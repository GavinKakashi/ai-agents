import type Anthropic from '@anthropic-ai/sdk';

export type Effort = 'low' | 'medium' | 'high';
export type AgentStatus = 'active' | 'paused';

export type Agent = {
  id: string;
  name: string;
  description: string;
  model: string;
  systemPrompt: string;
  effort: Effort;
  maxTokens: number;
  status: AgentStatus;
  colorIndex: number;
  createdAt: string;
  updatedAt: string;
};

export type Usage = {
  inputTokens: number;
  outputTokens: number;
  /** Model that actually answered (may differ if a safety fallback ran). */
  model: string;
};

export type ChatMessage =
  | {
      id: string;
      role: 'user';
      text: string;
      createdAt: string;
      /** 'failed' messages are excluded from the history sent to the API. */
      status: 'sent' | 'failed';
      error?: string;
    }
  | {
      id: string;
      role: 'assistant';
      text: string;
      createdAt: string;
      /** Raw content blocks, replayed unchanged so the history stays append-only. */
      content: Anthropic.Beta.BetaContentBlock[];
      usage: Usage;
      notice?: string;
    };

export type Conversation = {
  id: string;
  agentId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
};

export type ThemePreference = 'system' | 'light' | 'dark';

export type Settings = {
  theme: ThemePreference;
};

export type ConsentRecord = {
  policyVersion: string;
  termsAccepted: true;
  ageConfirmed: true;
  acceptedAt: string;
};
