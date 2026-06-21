const OpenAIProvider = require('./OpenAIProvider');
const OllamaProvider = require('./OllamaProvider');
const GeminiProvider = require('./GeminiProvider'); // placeholder, implement later

/**
 * ProviderFactory returns an instance of the requested AI provider.
 * Priority order can be configured via AI_PROVIDER env var.
 * Supported values: 'openai', 'ollama', 'gemini'.
 */
class ProviderFactory {
  static create() {
    const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
    switch (provider) {
      case 'ollama':
        return new OllamaProvider();
      case 'gemini':
        // Load GeminiProvider when implemented
        return new GeminiProvider();
      case 'openai':
      default:
        return new OpenAIProvider();
    }
  }
}

module.exports = ProviderFactory;
