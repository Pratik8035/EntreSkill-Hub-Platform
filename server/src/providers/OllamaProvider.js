const axios = require('axios');
const AppError = require('../utils/AppError');

/**
 * OllamaProvider – Wrapper for local Ollama model inference.
 * Reads OLLAMA_ENDPOINT env var (e.g., http://localhost:11434/api/generate).
 * Expects a JSON payload { model, prompt, system, max_tokens }.
 */
class OllamaProvider {
  constructor() {
    this.endpoint = process.env.OLLAMA_ENDPOINT;
    if (!this.endpoint) {
      throw new AppError('OLLAMA_ENDPOINT not configured', 500);
    }
  }

  /**
   * Generate a response from Ollama.
   * @param {object} params
   * @param {string} params.prompt - User message.
   * @param {string} [params.systemPrompt] - System context.
   * @param {number} [params.maxTokens=1024]
   * @returns {Promise<{content:string,tokens:number}>}
   */
  async generate({ prompt, systemPrompt = '', maxTokens = 1024 }) {
    try {
      const payload = {
        model: process.env.OLLAMA_MODEL || 'llama2',
        prompt,
        system: systemPrompt,
        max_tokens: maxTokens,
        stream: false,
      };
      const { data } = await axios.post(this.endpoint, payload);
      // Ollama returns { response, done, total_duration, eval_count, eval_step_count }
      const content = data.response || '';
      const tokens = data.eval_count || 0;
      return { content, tokens };
    } catch (err) {
      throw new AppError('Ollama provider error: ' + err.message, 502);
    }
  }
}

module.exports = OllamaProvider;
