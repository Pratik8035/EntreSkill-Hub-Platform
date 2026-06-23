const OpenAI = require('openai');
const AppError = require('../utils/AppError');

/**
 * OpenAIProvider – Wrapper around the OpenAI Chat Completions API.
 *
 * Sprint 4 Changes:
 * - `generate()` now accepts a `messages` array (OpenAI format) instead of a
 *   single `prompt` string. This enables proper multi-turn conversation context.
 * - The system prompt is prepended as the first message with role "system".
 * - `maxTokens` default raised to 1500 (was 500) for richer entrepreneurship advice.
 * - Falls back gracefully: if `messages` is absent, wraps `prompt` in a single
 *   user message so existing callers don't break during the transition.
 */
class OpenAIProvider {
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new AppError('OPENAI_API_KEY not configured', 500);
    this.client = new OpenAI({ apiKey });
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  /**
   * Generate a chat completion from OpenAI.
   *
   * @param {object}   params
   * @param {string}   params.systemPrompt  - System-level instruction for the model.
   * @param {Array<{role:'user'|'assistant', content:string}>} [params.messages]
   *   Ordered conversation history. The most recent user message should be the
   *   last entry. When provided, `prompt` is ignored.
   * @param {string}   [params.prompt]      - Legacy single-turn prompt (fallback).
   * @param {number}   [params.maxTokens]   - Max tokens for the response.
   * @returns {Promise<{content:string, tokens:number|null}>}
   */
  async generate({ systemPrompt, messages, prompt, maxTokens }) {
    // Resolve max tokens: param → env var → default 1500
    const resolvedMaxTokens =
      maxTokens != null
        ? maxTokens
        : (parseInt(process.env.AI_MAX_TOKENS, 10) || 1500);

    // Build the full messages array sent to OpenAI.
    // Structure: [system] + [...history]
    // If `messages` is not provided fall back to treating `prompt` as a single
    // user turn (backward-compatible with any code that still passes `prompt`).
    const conversationMessages = [
      { role: 'system', content: systemPrompt || '' },
      ...(Array.isArray(messages) && messages.length > 0
        ? messages
        : [{ role: 'user', content: prompt || '' }]),
    ];

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: conversationMessages,
        max_tokens: resolvedMaxTokens,
      });

      const content = response.choices[0].message.content.trim();
      const tokens = response.usage?.total_tokens ?? null;
      return { content, tokens };
    } catch (err) {
      throw new AppError('OpenAI provider error: ' + (err.message || 'Unknown'), 502);
    }
  }
}

module.exports = OpenAIProvider;
