/**
 * Unit tests – GeminiProvider (Sprint 4 Phase 1)
 *
 * @google/generative-ai is mocked so no real API calls are made.
 * Tests verify:
 *   - systemInstruction is set on the model (NOT inside contents[])
 *   - 'assistant' role is mapped to Gemini's 'model' role
 *   - 'user' role is passed through unchanged
 *   - Legacy `prompt` fallback works
 *   - maxTokens resolution (param > env > 1500 default)
 *   - Returned shape { content, tokens }
 *   - SDK errors wrapped in AppError(502)
 */

'use strict';

// ── Mock @google/generative-ai ────────────────────────────────────────────────
const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn();

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
}));

// getGenerativeModel returns an object with generateContent
mockGetGenerativeModel.mockImplementation((_config) => ({
  generateContent: mockGenerateContent,
}));

const GeminiProvider = require('../../../providers/GeminiProvider');

// Helper – build a standard Gemini SDK response
function makeSDKResponse(text = 'Gemini says hello', totalTokenCount = 55) {
  return {
    response: {
      text: () => `  ${text}  `, // spaces to test .trim()
      usageMetadata: { totalTokenCount },
    },
  };
}

describe('GeminiProvider', () => {
  let provider;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    process.env.GEMINI_MODEL = 'gemini-1.5-flash';
    delete process.env.AI_MAX_TOKENS;

    // Re-configure mock for each test
    mockGetGenerativeModel.mockImplementation((_config) => ({
      generateContent: mockGenerateContent,
    }));

    provider = new GeminiProvider();
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_MODEL;
    delete process.env.AI_MAX_TOKENS;
  });

  // ── Constructor ─────────────────────────────────────────────────────────────
  describe('constructor', () => {
    it('throws AppError(500) when GEMINI_API_KEY is missing', () => {
      delete process.env.GEMINI_API_KEY;
      expect(() => new GeminiProvider()).toThrow('GEMINI_API_KEY not configured');
    });

    it('uses GEMINI_MODEL env var', () => {
      process.env.GEMINI_MODEL = 'gemini-1.5-pro';
      const p = new GeminiProvider();
      expect(p.modelName).toBe('gemini-1.5-pro');
    });

    it('defaults to gemini-1.5-flash when GEMINI_MODEL is not set', () => {
      delete process.env.GEMINI_MODEL;
      const p = new GeminiProvider();
      expect(p.modelName).toBe('gemini-1.5-flash');
    });
  });

  // ── systemInstruction ───────────────────────────────────────────────────────
  describe('systemInstruction handling', () => {
    it('passes systemPrompt via getGenerativeModel systemInstruction (NOT in contents)', async () => {
      mockGenerateContent.mockResolvedValueOnce(makeSDKResponse());

      const systemPrompt = 'You are an expert business mentor.';
      await provider.generate({
        systemPrompt,
        messages: [{ role: 'user', content: 'Hello' }],
      });

      // getGenerativeModel must be called with the system prompt
      expect(mockGetGenerativeModel).toHaveBeenCalledWith(
        expect.objectContaining({ systemInstruction: systemPrompt })
      );

      // The contents array must NOT contain any system role entry
      const callArgs = mockGenerateContent.mock.calls[0][0];
      const hasSystemRole = callArgs.contents.some((c) => c.role === 'system');
      expect(hasSystemRole).toBe(false);
    });
  });

  // ── Role mapping ────────────────────────────────────────────────────────────
  describe('role mapping', () => {
    it("maps 'assistant' role to Gemini's 'model' role", async () => {
      mockGenerateContent.mockResolvedValueOnce(makeSDKResponse());

      const messages = [
        { role: 'user', content: 'How do I start?' },
        { role: 'assistant', content: 'Research the market.' },
        { role: 'user', content: 'What next?' },
      ];

      await provider.generate({ systemPrompt: 'sys', messages });

      const callArgs = mockGenerateContent.mock.calls[0][0];
      const roles = callArgs.contents.map((c) => c.role);

      expect(roles).toEqual(['user', 'model', 'user']);
    });

    it("keeps 'user' role as 'user'", async () => {
      mockGenerateContent.mockResolvedValueOnce(makeSDKResponse());

      await provider.generate({
        systemPrompt: 'sys',
        messages: [{ role: 'user', content: 'test message' }],
      });

      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.contents[0].role).toBe('user');
    });

    it('wraps each message content in parts[{ text }] format', async () => {
      mockGenerateContent.mockResolvedValueOnce(makeSDKResponse());

      await provider.generate({
        systemPrompt: 'sys',
        messages: [{ role: 'user', content: 'Hello Gemini' }],
      });

      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.contents[0].parts).toEqual([{ text: 'Hello Gemini' }]);
    });

    it('preserves message order in contents[]', async () => {
      mockGenerateContent.mockResolvedValueOnce(makeSDKResponse());

      const messages = [
        { role: 'user', content: 'msg1' },
        { role: 'assistant', content: 'msg2' },
        { role: 'user', content: 'msg3' },
      ];

      await provider.generate({ systemPrompt: 'sys', messages });

      const callArgs = mockGenerateContent.mock.calls[0][0];
      const texts = callArgs.contents.map((c) => c.parts[0].text);
      expect(texts).toEqual(['msg1', 'msg2', 'msg3']);
    });
  });

  // ── Legacy prompt fallback ──────────────────────────────────────────────────
  describe('legacy prompt fallback', () => {
    it('wraps legacy prompt as single user turn when messages[] is absent', async () => {
      mockGenerateContent.mockResolvedValueOnce(makeSDKResponse());

      await provider.generate({ systemPrompt: 'sys', prompt: 'Old prompt style' });

      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.contents).toHaveLength(1);
      expect(callArgs.contents[0]).toEqual({
        role: 'user',
        parts: [{ text: 'Old prompt style' }],
      });
    });

    it('uses prompt fallback when messages is an empty array', async () => {
      mockGenerateContent.mockResolvedValueOnce(makeSDKResponse());

      await provider.generate({ systemPrompt: 'sys', messages: [], prompt: 'fallback' });

      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.contents[0].parts[0].text).toBe('fallback');
    });
  });

  // ── Return shape ────────────────────────────────────────────────────────────
  describe('return shape', () => {
    it('returns trimmed content string', async () => {
      mockGenerateContent.mockResolvedValueOnce(makeSDKResponse('  padded  '));

      const result = await provider.generate({
        systemPrompt: 'sys',
        messages: [{ role: 'user', content: 'hi' }],
      });

      expect(result.content).toBe('padded');
    });

    it('returns token count from usageMetadata', async () => {
      mockGenerateContent.mockResolvedValueOnce(makeSDKResponse('response', 77));

      const result = await provider.generate({
        systemPrompt: 'sys',
        messages: [{ role: 'user', content: 'hi' }],
      });

      expect(result.tokens).toBe(77);
    });

    it('returns tokens: null when usageMetadata is absent', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'response',
          // no usageMetadata
        },
      });

      const result = await provider.generate({
        systemPrompt: 'sys',
        messages: [{ role: 'user', content: 'hi' }],
      });

      expect(result.tokens).toBeNull();
    });
  });

  // ── maxTokens resolution ────────────────────────────────────────────────────
  describe('maxTokens resolution', () => {
    it('uses maxTokens param when provided', async () => {
      mockGenerateContent.mockResolvedValueOnce(makeSDKResponse());
      process.env.AI_MAX_TOKENS = '999';

      await provider.generate({
        systemPrompt: 'sys',
        messages: [{ role: 'user', content: 'hi' }],
        maxTokens: 200,
      });

      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.generationConfig.maxOutputTokens).toBe(200);
    });

    it('falls back to AI_MAX_TOKENS env var', async () => {
      mockGenerateContent.mockResolvedValueOnce(makeSDKResponse());
      process.env.AI_MAX_TOKENS = '750';

      await provider.generate({
        systemPrompt: 'sys',
        messages: [{ role: 'user', content: 'hi' }],
      });

      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.generationConfig.maxOutputTokens).toBe(750);
    });

    it('defaults to 1500 when neither is set', async () => {
      mockGenerateContent.mockResolvedValueOnce(makeSDKResponse());
      delete process.env.AI_MAX_TOKENS;

      await provider.generate({
        systemPrompt: 'sys',
        messages: [{ role: 'user', content: 'hi' }],
      });

      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.generationConfig.maxOutputTokens).toBe(1500);
    });
  });

  // ── Error handling ──────────────────────────────────────────────────────────
  describe('error handling', () => {
    it('wraps SDK errors in AppError with status 502', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('Quota exceeded'));

      await expect(
        provider.generate({
          systemPrompt: 'sys',
          messages: [{ role: 'user', content: 'hi' }],
        })
      ).rejects.toMatchObject({
        message: expect.stringContaining('Gemini provider error'),
        statusCode: 502,
      });
    });
  });
});
