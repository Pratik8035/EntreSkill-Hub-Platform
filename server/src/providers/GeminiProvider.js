const { GoogleGenerativeAI } = require('@google/generative-ai');
const AppError = require('../utils/AppError');

class GeminiProvider {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new AppError('GEMINI_API_KEY not configured', 500);
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generate({ systemPrompt, prompt, maxTokens = 500 }) {
    try {
      const result = await this.model.generateContent([
        { role: 'system', parts: [{ text: systemPrompt }] },
        { role: 'user', parts: [{ text: prompt }] },
      ], { generationConfig: { maxOutputTokens: maxTokens } });
      const content = result.response.candidates[0].content.parts[0].text.trim();
      // Gemini does not expose token usage publicly; set null
      return { content, tokens: null };
    } catch (err) {
      throw new AppError('Gemini provider error: ' + (err.message || 'Unknown'), 502);
    }
  }
}

module.exports = GeminiProvider;
