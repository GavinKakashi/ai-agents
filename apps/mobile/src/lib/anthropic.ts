import Anthropic from '@anthropic-ai/sdk';

import { getModel } from './models';
import type { Agent, ChatMessage, Usage } from './types';

/**
 * The app calls the Anthropic API directly from the device with the user's own
 * key; no request passes through our servers. `dangerouslyAllowBrowser` is
 * required for the web build and is appropriate here because the key belongs
 * to the person using the app and never leaves their device except to go to
 * Anthropic.
 */
function client(apiKey: string) {
  return new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
    maxRetries: 2,
    timeout: 10 * 60 * 1000,
  });
}

/** Builds the API history from stored messages, skipping failed sends. */
export function toApiMessages(messages: ChatMessage[]): Anthropic.Beta.BetaMessageParam[] {
  return messages.flatMap((m): Anthropic.Beta.BetaMessageParam[] => {
    if (m.role === 'user') return m.status === 'sent' ? [{ role: 'user', content: m.text }] : [];
    // Replay the assistant's content blocks exactly as returned.
    return [{ role: 'assistant', content: m.content as Anthropic.Beta.BetaContentBlockParam[] }];
  });
}

export type AgentReply = {
  text: string;
  content: Anthropic.Beta.BetaContentBlock[];
  usage: Usage;
  notice?: string;
};

export async function runAgent(apiKey: string, agent: Agent, messages: ChatMessage[]): Promise<AgentReply> {
  const model = getModel(agent.model);
  const response = await client(apiKey).beta.messages.create({
    model: agent.model,
    max_tokens: agent.maxTokens,
    ...(agent.systemPrompt.trim() ? { system: agent.systemPrompt } : {}),
    messages: toApiMessages(messages),
    output_config: { effort: agent.effort },
    // If a safety classifier declines, let Anthropic retry on an appropriate model.
    ...(model?.supportsFallback ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
  });

  const text = response.content
    .flatMap((b) => (b.type === 'text' ? [b.text] : []))
    .join('\n\n')
    .trim();

  let notice: string | undefined;
  if (response.stop_reason === 'refusal') {
    notice = response.stop_details?.explanation
      ? `The model declined this request: ${response.stop_details.explanation}`
      : 'The model declined this request.';
  } else if (response.stop_reason === 'max_tokens') {
    notice = `The reply was cut off at this agent's limit of ${agent.maxTokens.toLocaleString()} tokens. You can raise it in the agent's settings.`;
  }
  if (response.model !== agent.model) {
    notice = [notice, `Answered by ${getModel(response.model)?.label ?? response.model}.`].filter(Boolean).join(' ');
  }

  return {
    text,
    content: response.content,
    notice,
    usage: {
      inputTokens:
        response.usage.input_tokens +
        (response.usage.cache_creation_input_tokens ?? 0) +
        (response.usage.cache_read_input_tokens ?? 0),
      outputTokens: response.usage.output_tokens,
      model: response.model,
    },
  };
}

/** Cheap call that confirms the key works, without generating any tokens. */
export async function verifyApiKey(apiKey: string): Promise<void> {
  await client(apiKey).models.list({ limit: 1 });
}

/** Turns SDK errors into plain-language messages. */
export function describeError(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) {
    return 'Anthropic rejected your API key. Check it in Settings → API key.';
  }
  if (err instanceof Anthropic.PermissionDeniedError) {
    return "Your API key doesn't have permission to use this model.";
  }
  if (err instanceof Anthropic.NotFoundError) {
    return 'That model is not available to your Anthropic account. Choose another model in the agent settings.';
  }
  if (err instanceof Anthropic.RateLimitError) {
    return 'You have hit a rate or spending limit on your Anthropic account. Wait a moment and try again.';
  }
  if (err instanceof Anthropic.BadRequestError) {
    return `Anthropic could not process this request: ${err.message}`;
  }
  if (err instanceof Anthropic.InternalServerError) {
    return 'Anthropic is having a temporary problem. Please try again shortly.';
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return 'Could not reach Anthropic. Check your internet connection and try again.';
  }
  if (err instanceof Anthropic.APIError) return err.message;
  return err instanceof Error ? err.message : 'Something went wrong.';
}
