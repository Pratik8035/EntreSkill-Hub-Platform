const axios = require('axios');
const AppError = require('../utils/AppError');

/**
 * OllamaProvider – Wrapper for local Ollama model inference.
 *
 * Sprint 4 Changes:
 * - `generate()` now accepts a `messages` array for conversation history.
 * - Because the Ollama /api/generate endpoint takes a single `prompt` string
 *   (not a structured messages array like OpenAI), we format the history into
 *   a clearly labelled dialogue string. The Ollama /api/chat endpoint does
 *   support a messages array, but to stay consistent with the current endpoint
 *   config (OLLAMA_ENDPOINT may point to /api/generate) we convert here.
 * - Role labels: "User:" and "Assistant:" prefix each turn.
 * - `maxTokens` default raised to 1500.
 * - Falls back gracefully if `messages` is absent (single `prompt` string).
 *
 * NOTE: If OLLAMA_ENDPOINT is set to the /api/chat endpoint, set
 * OLLAMA_USE_CHAT_API=true to send the native messages[] format instead.
 */
class OllamaProvider {
  constructor() {
    this.endpoint = process.env.OLLAMA_ENDPOINT;
    if (!this.endpoint) {
      throw new AppError('OLLAMA_ENDPOINT not configured', 500);
    }
    this.model = process.env.OLLAMA_MODEL || 'llama2';
    // Set to 'true' if OLLAMA_ENDPOINT points to /api/chat (supports messages[])
    this.useChatApi = process.env.OLLAMA_USE_CHAT_API === 'true';
  }

  /**
   * Format a messages array into a human-readable conversation string.
   * Used when targeting the /api/generate endpoint.
   *
   * @param {Array<{role:string, content:string}>} messages
   * @returns {string}
   */
  _formatHistoryAsPrompt(messages) {
    return messages
      .map((msg) => {
        const label = msg.role === 'assistant' ? 'Assistant' : 'User';
        return `${label}: ${msg.content}`;
      })
      .join('\n\n');
  }

  /**
   * Generate a response from Ollama.
   *
   * @param {object}   params
   * @param {string}   params.systemPrompt  - System context for the model.
   * @param {Array<{role:'user'|'assistant', content:string}>} [params.messages]
   *   Ordered conversation history (newest last).
   * @param {string}   [params.prompt]      - Legacy single-turn fallback.
   * @param {number}   [params.maxTokens]   - Max tokens for response.
   * @returns {Promise<{content:string, tokens:number}>}
   */
  async generate({ systemPrompt, messages, prompt, maxTokens }) {
    const resolvedMaxTokens =
      maxTokens != null
        ? maxTokens
        : (parseInt(process.env.AI_MAX_TOKENS, 10) || 1500);

    try {
      let payload;

      if (this.useChatApi) {
        // /api/chat format — native messages[] support
        const chatMessages = Array.isArray(messages) && messages.length > 0
          ? messages
          : [{ role: 'user', content: prompt || '' }];

        payload = {
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt || '' },
            ...chatMessages,
          ],
          stream: false,
          options: { num_predict: resolvedMaxTokens },
        };
      } else {
        // /api/generate format — single prompt string
        let formattedPrompt;
        if (Array.isArray(messages) && messages.length > 0) {
          formattedPrompt = this._formatHistoryAsPrompt(messages);
        } else {
          formattedPrompt = prompt || '';
        }

        payload = {
          model: this.model,
          system: systemPrompt || '',
          prompt: formattedPrompt,
          stream: false,
          options: { num_predict: resolvedMaxTokens },
        };
      }

      const { data } = await axios.post(this.endpoint, payload);

      // /api/generate returns { response, eval_count }
      // /api/chat returns { message: { content }, eval_count }
      const content = this.useChatApi
        ? (data.message?.content || '').trim()
        : (data.response || '').trim();

      const tokens = data.eval_count || 0;
      return { content, tokens };
    } catch (err) {
      throw new AppError('Ollama provider error: ' + err.message, 502);
    }
  }
}

module.exports = OllamaProvider;
