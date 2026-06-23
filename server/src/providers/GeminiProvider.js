const { GoogleGenerativeAI } = require('@google/generative-ai');
const AppError = require('../utils/AppError');

/**
 * GeminiProvider – Wrapper around Google Gemini's generateContent API.
 *
 * Sprint 4 Changes:
 * - Fixed critical bug: the old code passed `{ role: 'system', parts: [...] }`
 *   inside the `contents` array, which Gemini does NOT support. The Gemini API
 *   requires the system prompt to be set via the `systemInstruction` field on
 *   the model config, NOT as a turn in the conversation.
 * - `generate()` now accepts a `messages` array for proper multi-turn history.
 * - Role mapping: our internal 'assistant' role is mapped to Gemini's 'model'.
 * - `maxTokens` default raised to 1500.
 * - Model updated to gemini-1.5-flash (gemini-pro is deprecated).
 *   Override with GEMINI_MODEL env var.
 * - Falls back gracefully if `messages` is absent (single user prompt).
 */
class GeminiProvider {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new AppError('GEMINI_API_KEY not configured', 500);

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  }

  /**
   * Generate a response from Gemini.
   *
   * @param {object}   params
   * @param {string}   params.systemPrompt  - System instruction for the model.
   * @param {Array<{role:'user'|'assistant', content:string}>} [params.messages]
   *   Ordered conversation history. The most recent user message must be last
   *   and must have role 'user' (Gemini requirement: conversation must end on
   *   a user turn).
   * @param {string}   [params.prompt]      - Legacy single-turn prompt (fallback).
   * @param {number}   [params.maxTokens]   - Max output tokens.
   * @returns {Promise<{content:string, tokens:number|null}>}
   */
  async generate({ systemPrompt, messages, prompt, maxTokens }) {
    const resolvedMaxTokens =
      maxTokens != null
        ? maxTokens
        : (parseInt(process.env.AI_MAX_TOKENS, 10) || 1500);

    // The systemInstruction is set at model-initialisation time (per request)
    // so we create a fresh model instance with the dynamic system prompt.
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      systemInstruction: systemPrompt || '',
    });

    // Build the `contents` array Gemini expects.
    // Gemini role values: 'user' | 'model' (not 'assistant').
    // Rules enforced here:
    //   1. Roles alternate user → model → user → ...
    //   2. The final turn must be 'user'.
    //   3. We never put the system prompt inside contents.
    let contents;

    if (Array.isArray(messages) && messages.length > 0) {
      contents = messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));
    } else {
      // Fallback: single user turn from legacy `prompt` param
      contents = [{ role: 'user', parts: [{ text: prompt || '' }] }];
    }

    try {
      const result = await model.generateContent({
        contents,
        generationConfig: { maxOutputTokens: resolvedMaxTokens },
      });

      const response = result.response;
      const content = response.text().trim();

      // Gemini does not expose token usage in the same way; use metadata if available
      const tokens = response.usageMetadata?.totalTokenCount ?? null;
      return { content, tokens };
    } catch (err) {
      throw new AppError('Gemini provider error: ' + (err.message || 'Unknown'), 502);
    }
  }
}

module.exports = GeminiProvider;
