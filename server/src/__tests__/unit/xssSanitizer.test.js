/**
 * Unit Tests — XSS Sanitizer Middleware
 */

const xssSanitizer = require('../../middleware/xssSanitizer');

const buildMockReq = (overrides = {}) => ({
  body:   {},
  query:  {},
  params: {},
  ...overrides,
});

const mockNext = jest.fn();

beforeEach(() => {
  mockNext.mockClear();
});

describe('xssSanitizer middleware', () => {
  it('should strip < and > from req.body strings', () => {
    const req = buildMockReq({ body: { name: '<script>alert(1)</script>' } });
    xssSanitizer(req, {}, mockNext);
    expect(req.body.name).toBe('scriptalert(1)script');
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should strip " and \' from req.query', () => {
    const req = buildMockReq({ query: { search: 'hello"world\'test' } });
    xssSanitizer(req, {}, mockNext);
    expect(req.query.search).toBe('helloworldtest');
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should recursively sanitize nested objects in req.body', () => {
    const req = buildMockReq({
      body: { profile: { bio: "<img src=x onerror='alert(1)'>" } },
    });
    xssSanitizer(req, {}, mockNext);
    expect(req.body.profile.bio).not.toContain('<');
    expect(req.body.profile.bio).not.toContain('>');
  });

  it('should sanitize each string in an array', () => {
    const req = buildMockReq({ body: { tags: ['<b>valid</b>', 'clean'] } });
    xssSanitizer(req, {}, mockNext);
    expect(req.body.tags[0]).toBe('bvalidb');
    expect(req.body.tags[1]).toBe('clean');
  });

  it('should pass non-string primitives through unchanged', () => {
    const req = buildMockReq({ body: { age: 25, active: true, score: 9.5 } });
    xssSanitizer(req, {}, mockNext);
    expect(req.body.age).toBe(25);
    expect(req.body.active).toBe(true);
    expect(req.body.score).toBe(9.5);
  });

  it('should always call next()', () => {
    const req = buildMockReq({ body: { clean: 'no special chars' } });
    xssSanitizer(req, {}, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });
});
