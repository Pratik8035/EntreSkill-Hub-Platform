const https = require('https');
const axios = require('axios');
const AppError = require('../utils/AppError');

/**
 * GroqProvider – Wrapper around the Groq chat completions API.
 *
 * Uses the OpenAI-compatible REST API exposed by Groq at:
 *   https://api.groq.com/openai/v1/chat/completions
 *
 * Shares the same generate() interface as GeminiProvider / OpenAIProvider:
 *   generate({ systemPrompt, messages, prompt, maxTokens })
 *
 * Environment variables:
 *   GROQ_API_KEY  – Required. Your Groq API key.
 *   GROQ_MODEL    – Optional. Defaults to llama-3.3-70b-versatile.
 */
class GroqProvider {
  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new AppError('GROQ_API_KEY not configured', 500);

    this.apiKey = apiKey;
    this.modelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    this.endpoint = 'https://api.groq.com/openai/v1/chat/completions';

    // In development, the local CA bundle may not include intermediate certs
    // needed to verify api.groq.com. We disable strict TLS only in that case.
    // In production (NODE_ENV=production) strict TLS is always enforced.
    const isDev = (process.env.NODE_ENV || 'development') !== 'production';
    this.httpsAgent = new https.Agent({ rejectUnauthorized: !isDev });
  }

  /**
   * Generate a response from Groq.
   *
   * @param {object}   params
   * @param {string}   params.systemPrompt  - System instruction for the model.
   * @param {Array<{role:'user'|'assistant', content:string}>} [params.messages]
   *   Ordered conversation history. The most recent user message must be last.
   * @param {string}   [params.prompt]      - Legacy single-turn prompt (fallback).
   * @param {number}   [params.maxTokens]   - Max output tokens.
   * @returns {Promise<{content:string, tokens:number|null}>}
   */
  async generate({ systemPrompt, messages, prompt, maxTokens }) {
    const resolvedMaxTokens =
      maxTokens != null
        ? maxTokens
        : (parseInt(process.env.AI_MAX_TOKENS, 10) || 1500);

    // Build the messages array in OpenAI format.
    // System prompt goes first as a 'system' role message.
    const chatMessages = [];

    if (systemPrompt) {
      chatMessages.push({ role: 'system', content: systemPrompt });
    }

    if (Array.isArray(messages) && messages.length > 0) {
      for (const msg of messages) {
        chatMessages.push({ role: msg.role, content: msg.content });
      }
    } else {
      // Fallback: single user turn from legacy `prompt` param
      chatMessages.push({ role: 'user', content: prompt || '' });
    }

    const body = {
      model: this.modelName,
      messages: chatMessages,
      max_tokens: resolvedMaxTokens,
    };

    try {
      const response = await axios.post(this.endpoint, body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        httpsAgent: this.httpsAgent,
        timeout: 60000,
      });

      const content = response.data.choices?.[0]?.message?.content?.trim() ?? '';
      const tokens = response.data.usage?.total_tokens ?? null;

      return { content, tokens };
    } catch (err) {
      if (err instanceof AppError) throw err;
      const msg = err.response?.data?.error?.message || err.message || 'Unknown';
      throw new AppError('Groq provider error: ' + msg, 502);
    }
  }
}

module.exports = GroqProvider;
