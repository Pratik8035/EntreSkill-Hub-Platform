/**
 * Unit tests – OpenAIProvider (Sprint 4 Phase 1)
 *
 * The openai SDK is mocked so no real API calls are made.
 * Tests verify:
 *   - messages[] array is passed correctly with system prompt prepended
 *   - Legacy `prompt` fallback still works
 *   - maxTokens resolves in correct priority order (param > env > default)
 *   - Returned shape is { content, tokens }
 *   - SDK errors are wrapped in AppError(502)
 */

'use strict';

// ── Mock the openai package before require ────────────────────────────────────
const mockCreate = jest.fn();
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  }));
});

const OpenAIProvider = require('../../../providers/OpenAIProvider');

// Helper – build a standard successful response from the SDK
function makeSDKResponse(text = 'Hello from OpenAI', totalTokens = 42) {
  return {
    choices: [{ message: { content: `  ${text}  ` } }], // trailing spaces to test .trim()
    usage: { total_tokens: totalTokens },
  };
}

describe('OpenAIProvider', () => {
  let provider;

  beforeEach(() => {
    jest.clearAllMocks();
    // Set required env var so constructor doesn't throw
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.OPENAI_MODEL = 'gpt-4o-mini';
    // Remove tuning vars so tests control them explicitly
    delete process.env.AI_MAX_TOKENS;
    provider = new OpenAIProvider();
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_MODEL;
    delete process.env.AI_MAX_TOKENS;
  });

  // ── Constructor ─────────────────────────────────────────────────────────────
  describe('constructor', () => {
    it('throws AppError(500) when OPENAI_API_KEY is missing', () => {
      delete process.env.OPENAI_API_KEY;
      expect(() => new OpenAIProvider()).toThrow('OPENAI_API_KEY not configured');
    });

    it('picks up OPENAI_MODEL from env', () => {
      process.env.OPENAI_MODEL = 'gpt-4o';
      const p = new OpenAIProvider();
      expect(p.model).toBe('gpt-4o');
    });

    it('defaults model to gpt-4o-mini when OPENAI_MODEL is not set', () => {
      delete process.env.OPENAI_MODEL;
      const p = new OpenAIProvider();
      expect(p.model).toBe('gpt-4o-mini');
    });
  });

  // ── generate() – messages[] format (primary path) ──────────────────────────
  describe('generate() with messages[]', () => {
    it('prepends system prompt and passes messages[] to the SDK', async () => {
      mockCreate.mockResolvedValueOnce(makeSDKResponse('Great advice'));

      const systemPrompt = 'You are a helpful mentor.';
      const messages = [
        { role: 'user', content: 'How do I start?' },
        { role: 'assistant', content: 'First, research the market.' },
        { role: 'user', content: 'What next?' },
      ];

      await provider.generate({ systemPrompt, messages, maxTokens: 500 });

      expect(mockCreate).toHaveBeenCalledTimes(1);
      const callArgs = mockCreate.mock.calls[0][0];

      // System message must be first
      expect(callArgs.messages[0]).toEqual({ role: 'system', content: systemPrompt });

      // Full history follows in order
      expect(callArgs.messages[1]).toEqual(messages[0]);
      expect(callArgs.messages[2]).toEqual(messages[1]);
      expect(callArgs.messages[3]).toEqual(messages[2]);

      // Total length: 1 system + 3 history
      expect(callArgs.messages).toHaveLength(4);
    });

    it('returns trimmed content and token count', async () => {
      mockCreate.mockResolvedValueOnce(makeSDKResponse('  trimmed response  ', 99));

      const result = await provider.generate({
        systemPrompt: 'sys',
        messages: [{ role: 'user', content: 'hi' }],
      });

      expect(result.content).toBe('trimmed response');
      expect(result.tokens).toBe(99);
    });

    it('returns tokens: null when usage is absent', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'response' } }],
        // no usage field
      });

      const result = await provider.generate({
        systemPrompt: 'sys',
        messages: [{ role: 'user', content: 'test' }],
      });

      expect(result.tokens).toBeNull();
    });
  });

  // ── generate() – legacy prompt fallback ────────────────────────────────────
  describe('generate() with legacy prompt fallback', () => {
    it('wraps prompt as a single user message when messages[] is absent', async () => {
      mockCreate.mockResolvedValueOnce(makeSDKResponse('legacy response'));

      await provider.generate({
        systemPrompt: 'System',
        prompt: 'Old-style prompt',
        maxTokens: 300,
      });

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages).toHaveLength(2); // system + 1 user
      expect(callArgs.messages[1]).toEqual({ role: 'user', content: 'Old-style prompt' });
    });

    it('uses prompt fallback when messages is an empty array', async () => {
      mockCreate.mockResolvedValueOnce(makeSDKResponse('fallback'));

      await provider.generate({
        systemPrompt: 'sys',
        messages: [],
        prompt: 'fallback prompt',
      });

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages[1]).toEqual({ role: 'user', content: 'fallback prompt' });
    });
  });

  // ── maxTokens resolution ────────────────────────────────────────────────────
  describe('maxTokens resolution', () => {
    it('uses maxTokens param when explicitly provided', async () => {
      mockCreate.mockResolvedValueOnce(makeSDKResponse());
      process.env.AI_MAX_TOKENS = '999';

      await provider.generate({
        systemPrompt: 'sys',
        messages: [{ role: 'user', content: 'hi' }],
        maxTokens: 123,
      });

      expect(mockCreate.mock.calls[0][0].max_tokens).toBe(123);
    });

    it('falls back to AI_MAX_TOKENS env var when maxTokens param is absent', async () => {
      mockCreate.mockResolvedValueOnce(makeSDKResponse());
      process.env.AI_MAX_TOKENS = '800';

      await provider.generate({
        systemPrompt: 'sys',
        messages: [{ role: 'user', content: 'hi' }],
      });

      expect(mockCreate.mock.calls[0][0].max_tokens).toBe(800);
    });

    it('defaults to 1500 when neither param nor env var is set', async () => {
      mockCreate.mockResolvedValueOnce(makeSDKResponse());
      delete process.env.AI_MAX_TOKENS;

      await provider.generate({
        systemPrompt: 'sys',
        messages: [{ role: 'user', content: 'hi' }],
      });

      expect(mockCreate.mock.calls[0][0].max_tokens).toBe(1500);
    });
  });

  // ── Error handling ──────────────────────────────────────────────────────────
  describe('error handling', () => {
    it('wraps SDK errors in AppError with status 502', async () => {
      mockCreate.mockRejectedValueOnce(new Error('Network timeout'));

      await expect(
        provider.generate({
          systemPrompt: 'sys',
          messages: [{ role: 'user', content: 'hi' }],
        })
      ).rejects.toMatchObject({
        message: expect.stringContaining('OpenAI provider error'),
        statusCode: 502,
      });
    });
  });
});
