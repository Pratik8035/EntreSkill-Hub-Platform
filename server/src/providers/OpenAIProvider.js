const OpenAI = require('openai');
const AppError = require('../utils/AppError');

class OpenAIProvider {
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new AppError('OPENAI_API_KEY not configured', 500);
    this.client = new OpenAI({ apiKey });
  }

  async generate({ systemPrompt, prompt, maxTokens = 500 }) {
    try {
      const response = await this.client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: maxTokens,
      });
      const content = response.choices[0].message.content.trim();
      const tokens = response.usage?.total_tokens || null;
      return { content, tokens };
    } catch (err) {
      throw new AppError('OpenAI provider error: ' + (err.message || 'Unknown'), 502);
    }
  }
}

module.exports = OpenAIProvider;
