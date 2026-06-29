const OpenAIProvider = require('./OpenAIProvider');
const OllamaProvider = require('./OllamaProvider');
const GeminiProvider = require('./GeminiProvider');
const GroqProvider = require('./GroqProvider');
const AppError = require('../utils/AppError');

/**
 * ProviderFactory – returns a configured AI provider instance.
 *
 * Sprint 4 Changes:
 * - Removed stale "placeholder, implement later" comment on GeminiProvider.
 *   GeminiProvider is now fully implemented with systemInstruction and
 *   proper multi-turn contents[] format.
 * - All three providers now share the same generate() interface:
 *   generate({ systemPrompt, messages, prompt, maxTokens })
 *
 * Groq Migration:
 * - Added 'groq' as a supported provider value.
 * - All existing providers remain for backward compatibility.
 *
 * Select the active provider via the AI_PROVIDER env var.
 * Supported values: 'openai' (default) | 'gemini' | 'ollama' | 'groq'
 *
 * If the selected provider's constructor throws (e.g. missing API key),
 * the factory returns a stub provider that throws a graceful 503 error
 * on generate() instead of crashing the process.
 */

/** Stub provider returned when the real provider cannot be initialised. */
class UnavailableProvider {
  constructor(reason) {
    this._reason = reason;
  }
  async generate() {
    throw new AppError(
      `AI service is temporarily unavailable: ${this._reason}`,
      503
    );
  }
}

class ProviderFactory {
  static create() {
    const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
    try {
      switch (provider) {
        case 'ollama':
          return new OllamaProvider();
        case 'gemini':
          return new GeminiProvider();
        case 'groq':
          return new GroqProvider();
        case 'openai':
        default:
          return new OpenAIProvider();
      }
    } catch (err) {
      // Gracefully degrade — return a stub that surfaces the error on generate()
      return new UnavailableProvider(err.message || 'provider configuration error');
    }
  }
}

module.exports = ProviderFactory;
