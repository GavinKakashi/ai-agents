import type { Usage } from './types';

/**
 * Anthropic's published list prices, in USD per million tokens, as of the date
 * below. Shown to users as an estimate only — their Anthropic bill is
 * authoritative. Update both the prices and the date together.
 */
export const PRICES_AS_OF = '2026-10-06';

export type ModelInfo = {
  id: string;
  label: string;
  summary: string;
  inputPerMTok: number;
  outputPerMTok: number;
  /** Supports the server-side `fallbacks: "default"` refusal fallback. */
  supportsFallback: boolean;
};

export const MODELS: ModelInfo[] = [
  {
    id: 'claude-opus-5-5',
    label: 'Claude Opus 5.5',
    summary: 'Most capable Opus model. Best for complex, multi-step work.',
    inputPerMTok: 4,
    outputPerMTok: 20,
    supportsFallback: true,
  },
  {
    id: 'claude-sonnet-5-5',
    label: 'Claude Sonnet 5.5',
    summary: 'Balanced speed and capability for everyday tasks.',
    inputPerMTok: 2,
    outputPerMTok: 10,
    supportsFallback: true,
  },
  {
    id: 'claude-haiku-5-5',
    label: 'Claude Haiku 5.5',
    summary: 'Fastest and lowest cost. Good for simple, high-volume tasks.',
    inputPerMTok: 0.1,
    outputPerMTok: 0.5,
    supportsFallback: false,
  },
  {
    id: 'claude-fable-5-1',
    label: 'Claude Fable 5.1',
    summary: "Anthropic's most capable widely released model. Highest cost.",
    inputPerMTok: 10,
    outputPerMTok: 50,
    supportsFallback: true,
  },
];

export const DEFAULT_MODEL = 'claude-opus-5-5';

export function getModel(id: string): ModelInfo | undefined {
  return MODELS.find((m) => m.id === id);
}

/** Approximate cost in USD. Ignores prompt-caching discounts and long-context tiers. */
export function estimateCost(usage: Usage): number | null {
  const model = getModel(usage.model);
  if (!model) return null;
  return (usage.inputTokens * model.inputPerMTok + usage.outputTokens * model.outputPerMTok) / 1_000_000;
}
