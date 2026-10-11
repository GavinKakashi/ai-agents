import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { BUSINESS } from '@/legal/generated';
import { runAgent, describeError } from '@/lib/anthropic';
import { newId } from '@/lib/format';
import { deleteApiKey, getApiKey } from '@/lib/secrets';
import { storage } from '@/lib/storage';
import type { AgentTemplate } from '@/lib/templates';
import type { Agent, ChatMessage, ConsentRecord, Conversation, Settings } from '@/lib/types';

type AppState = {
  ready: boolean;
  agents: Agent[];
  conversations: Conversation[];
  settings: Settings;
  consent: ConsentRecord | null;
  /** True when the user has accepted the current policy version. */
  consentCurrent: boolean;
  hasApiKey: boolean;
  refreshApiKeyStatus: () => Promise<void>;

  acceptPolicies: () => Promise<void>;
  withdrawConsent: () => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;

  createAgent: (input: AgentTemplate) => Promise<Agent>;
  updateAgent: (id: string, patch: Partial<Agent>) => Promise<void>;
  duplicateAgent: (id: string) => Promise<Agent | undefined>;
  deleteAgent: (id: string) => Promise<void>;

  startConversation: (agentId: string) => Promise<Conversation>;
  deleteConversation: (id: string) => Promise<void>;
  sendMessage: (conversationId: string, text: string, retryOf?: string) => Promise<void>;
  pending: Record<string, boolean>;

  exportData: () => string;
  deleteAllData: () => Promise<void>;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [settings, setSettings] = useState<Settings>({ theme: 'system' });
  const [consent, setConsent] = useState<ConsentRecord | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [pending, setPending] = useState<Record<string, boolean>>({});

  // Refs mirror state so async operations always see the latest values.
  // Every write goes through commit*/remove*, which update both.
  const agentsRef = useRef<Agent[]>([]);
  const conversationsRef = useRef<Conversation[]>([]);

  const refreshApiKeyStatus = useCallback(async () => {
    setHasApiKey(!!(await getApiKey()));
  }, []);

  useEffect(() => {
    (async () => {
      const [a, c, s, consentRecord] = await Promise.all([
        storage.loadAgents(),
        storage.loadConversations(),
        storage.loadSettings(),
        storage.loadConsent(),
      ]);
      agentsRef.current = a;
      conversationsRef.current = c;
      setAgents(a);
      setConversations(c);
      setSettings(s);
      setConsent(consentRecord);
      await refreshApiKeyStatus();
      setReady(true);
    })();
  }, [refreshApiKeyStatus]);

  const commitAgents = useCallback(async (next: Agent[]) => {
    agentsRef.current = next;
    setAgents(next);
    await storage.saveAgents(next);
  }, []);

  const commitConversation = useCallback(async (conversation: Conversation) => {
    const others = conversationsRef.current.filter((c) => c.id !== conversation.id);
    const next = [conversation, ...others];
    conversationsRef.current = next;
    setConversations(next);
    await storage.saveConversation(conversation, next.map((c) => c.id));
  }, []);

  const removeConversations = useCallback(async (ids: string[]) => {
    const next = conversationsRef.current.filter((c) => !ids.includes(c.id));
    conversationsRef.current = next;
    setConversations(next);
    await storage.deleteConversations(ids, next.map((c) => c.id));
  }, []);

  const value = useMemo<AppState>(() => {
    const now = () => new Date().toISOString();

    return {
      ready,
      agents,
      conversations,
      settings,
      consent,
      consentCurrent: consent?.policyVersion === BUSINESS.policyVersion,
      hasApiKey,
      refreshApiKeyStatus,
      pending,

      async acceptPolicies() {
        const record: ConsentRecord = {
          policyVersion: BUSINESS.policyVersion,
          termsAccepted: true,
          ageConfirmed: true,
          acceptedAt: now(),
        };
        await storage.saveConsent(record);
        setConsent(record);
      },

      async withdrawConsent() {
        await storage.clearConsent();
        setConsent(null);
      },

      async updateSettings(patch) {
        const next = { ...settings, ...patch };
        setSettings(next);
        await storage.saveSettings(next);
      },

      async createAgent(input) {
        const agent: Agent = {
          ...input,
          id: newId(),
          status: 'active',
          colorIndex: agentsRef.current.length % 8,
          createdAt: now(),
          updatedAt: now(),
        };
        await commitAgents([agent, ...agentsRef.current]);
        return agent;
      },

      async updateAgent(id, patch) {
        await commitAgents(
          agentsRef.current.map((a) => (a.id === id ? { ...a, ...patch, id, updatedAt: now() } : a))
        );
      },

      async duplicateAgent(id) {
        const source = agentsRef.current.find((a) => a.id === id);
        if (!source) return undefined;
        const copy: Agent = {
          ...source,
          id: newId(),
          name: `${source.name} (copy)`,
          colorIndex: (source.colorIndex + 1) % 8,
          createdAt: now(),
          updatedAt: now(),
        };
        await commitAgents([copy, ...agentsRef.current]);
        return copy;
      },

      async deleteAgent(id) {
        await commitAgents(agentsRef.current.filter((a) => a.id !== id));
        await removeConversations(conversationsRef.current.filter((c) => c.agentId === id).map((c) => c.id));
      },

      async startConversation(agentId) {
        const conversation: Conversation = {
          id: newId(),
          agentId,
          title: 'New conversation',
          messages: [],
          createdAt: now(),
          updatedAt: now(),
        };
        await commitConversation(conversation);
        return conversation;
      },

      deleteConversation: (id) => removeConversations([id]),

      async sendMessage(conversationId, text, retryOf) {
        const base = conversationsRef.current.find((c) => c.id === conversationId);
        const agent = base && agentsRef.current.find((a) => a.id === base.agentId);
        if (!base || !agent) return;

        const userMessage: ChatMessage = { id: newId(), role: 'user', text, createdAt: now(), status: 'sent' };
        const messages = [...base.messages.filter((m) => m.id !== retryOf), userMessage];
        let conversation: Conversation = {
          ...base,
          title: base.messages.length === 0 ? text.slice(0, 60) : base.title,
          messages,
          updatedAt: now(),
        };
        await commitConversation(conversation);
        setPending((p) => ({ ...p, [conversationId]: true }));

        try {
          const apiKey = await getApiKey();
          if (!apiKey) throw new Error('Add your Anthropic API key in Settings → API key first.');
          const reply = await runAgent(apiKey, agent, messages);
          conversation = {
            ...conversation,
            messages: [
              ...messages,
              {
                id: newId(),
                role: 'assistant',
                text: reply.text,
                content: reply.content,
                usage: reply.usage,
                notice: reply.notice,
                createdAt: now(),
              },
            ],
            updatedAt: now(),
          };
        } catch (err) {
          conversation = {
            ...conversation,
            messages: messages.map((m) =>
              m.id === userMessage.id ? { ...userMessage, status: 'failed' as const, error: describeError(err) } : m
            ),
          };
        } finally {
          setPending((p) => ({ ...p, [conversationId]: false }));
        }
        await commitConversation(conversation);
      },

      exportData() {
        return JSON.stringify(
          {
            exportedAt: now(),
            app: BUSINESS.appName,
            note: 'Your API key is not included in this export.',
            consent,
            settings,
            agents: agentsRef.current,
            conversations: conversationsRef.current.map((c) => ({
              ...c,
              messages: c.messages.map((m) => (m.role === 'assistant' ? { ...m, content: undefined } : m)),
            })),
          },
          null,
          2
        );
      },

      async deleteAllData() {
        await storage.wipe();
        await deleteApiKey();
        agentsRef.current = [];
        conversationsRef.current = [];
        setAgents([]);
        setConversations([]);
        setSettings({ theme: 'system' });
        setConsent(null);
        setHasApiKey(false);
      },
    };
  }, [ready, agents, conversations, settings, consent, hasApiKey, pending, refreshApiKeyStatus, commitAgents, commitConversation, removeConversations]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
