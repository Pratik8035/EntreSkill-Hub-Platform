const OpenAIProvider = require('./OpenAIProvider');
const OllamaProvider = require('./OllamaProvider');
const GeminiProvider = require('./GeminiProvider');

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
 * Select the active provider via the AI_PROVIDER env var.
 * Supported values: 'openai' (default) | 'gemini' | 'ollama'
 */
class ProviderFactory {
  static create() {
    const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
    switch (provider) {
      case 'ollama':
        return new OllamaProvider();
      case 'gemini':
        return new GeminiProvider();
      case 'openai':
      default:
        return new OpenAIProvider();
    }
  }
}

module.exports = ProviderFactory;
