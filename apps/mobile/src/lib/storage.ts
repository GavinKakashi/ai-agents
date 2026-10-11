import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Agent, ConsentRecord, Conversation, Settings } from './types';

// All app data lives on the device under this prefix. Nothing is synced.
const PREFIX = 'crewdeck:v1:';
const KEYS = {
  agents: `${PREFIX}agents`,
  conversationIndex: `${PREFIX}conversations`,
  settings: `${PREFIX}settings`,
  consent: `${PREFIX}consent`,
};
// Each conversation is stored under its own key to stay well below
// per-key size limits on Android.
const conversationKey = (id: string) => `${PREFIX}conversation:${id}`;

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const storage = {
  loadAgents: () => readJson<Agent[]>(KEYS.agents, []),
  saveAgents: (agents: Agent[]) => AsyncStorage.setItem(KEYS.agents, JSON.stringify(agents)),

  async loadConversations(): Promise<Conversation[]> {
    const ids = await readJson<string[]>(KEYS.conversationIndex, []);
    const entries = await AsyncStorage.multiGet(ids.map(conversationKey));
    return entries.flatMap(([, raw]) => {
      if (!raw) return [];
      try {
        return [JSON.parse(raw) as Conversation];
      } catch {
        return [];
      }
    });
  },
  async saveConversation(conversation: Conversation, allIds: string[]) {
    await AsyncStorage.multiSet([
      [conversationKey(conversation.id), JSON.stringify(conversation)],
      [KEYS.conversationIndex, JSON.stringify(allIds)],
    ]);
  },
  async deleteConversations(ids: string[], remainingIds: string[]) {
    await AsyncStorage.multiRemove(ids.map(conversationKey));
    await AsyncStorage.setItem(KEYS.conversationIndex, JSON.stringify(remainingIds));
  },

  loadSettings: () => readJson<Settings>(KEYS.settings, { theme: 'system' }),
  saveSettings: (settings: Settings) => AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings)),

  loadConsent: () => readJson<ConsentRecord | null>(KEYS.consent, null),
  saveConsent: (consent: ConsentRecord) => AsyncStorage.setItem(KEYS.consent, JSON.stringify(consent)),
  clearConsent: () => AsyncStorage.removeItem(KEYS.consent),

  /** Removes every key this app has written. */
  async wipe() {
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX));
    await AsyncStorage.multiRemove(keys);
  },
};
