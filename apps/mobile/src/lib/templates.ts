import { DEFAULT_MODEL } from './models';
import type { Agent } from './types';

export type AgentTemplate = Pick<Agent, 'name' | 'description' | 'systemPrompt' | 'model' | 'effort' | 'maxTokens'>;

export const BLANK_TEMPLATE: AgentTemplate = {
  name: '',
  description: '',
  systemPrompt: '',
  model: DEFAULT_MODEL,
  effort: 'medium',
  maxTokens: 8000,
};

export const TEMPLATES: AgentTemplate[] = [
  {
    name: 'Research assistant',
    description: 'Breaks down questions and explains findings clearly.',
    systemPrompt:
      'You are a careful research assistant. Break questions into parts, reason step by step, and say clearly when you are unsure or when information may be out of date. Finish with a short summary.',
    model: DEFAULT_MODEL,
    effort: 'high',
    maxTokens: 8000,
  },
  {
    name: 'Writing editor',
    description: 'Tightens drafts while keeping your voice.',
    systemPrompt:
      "You are an editor. Improve clarity, structure and grammar while keeping the author's voice. Return the edited text first, then a short bulleted list of the main changes.",
    model: 'claude-sonnet-5-5',
    effort: 'medium',
    maxTokens: 8000,
  },
  {
    name: 'Code reviewer',
    description: 'Reviews code for bugs, security and readability.',
    systemPrompt:
      'You are a senior software engineer reviewing code. Point out bugs, security issues and unclear code, most important first. Suggest concrete fixes. Do not invent problems; if the code looks fine, say so.',
    model: DEFAULT_MODEL,
    effort: 'high',
    maxTokens: 16000,
  },
  {
    name: 'Meeting summariser',
    description: 'Turns notes into decisions and action items.',
    systemPrompt:
      'Summarise meeting notes. Output three sections: Decisions, Action items (owner and due date if stated), and Open questions. Only include what is in the notes.',
    model: 'claude-haiku-5-5',
    effort: 'low',
    maxTokens: 4000,
  },
];
