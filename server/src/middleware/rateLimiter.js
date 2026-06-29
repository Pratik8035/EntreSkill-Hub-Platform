const rateLimit = require('express-rate-limit');

// ─── Shared Response Format for Rate Limit Violations ────────────────────────
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests from this IP address. Please try again later.',
    errors: [],
  });
};

// ─── Global API Limiter ──────────────────────────────────────────────────────
// Applied to ALL /api/* routes as a baseline protection.
// Allows 100 requests per 15-minute window per IP.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,   // Return rate limit info in `RateLimit-*` headers (RFC 6585)
  legacyHeaders: false,    // Disable `X-RateLimit-*` legacy headers
  handler: rateLimitHandler,
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});

// ─── Auth Route Limiter ──────────────────────────────────────────────────────
// Applied specifically to /api/auth/login and /api/auth/register.
// Stricter threshold: 10 attempts per 15-minute window.
// Protects against brute-force credential stuffing attacks.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skipSuccessfulRequests: true, // Only count FAILED requests toward the limit
});

// ─── Token Refresh Limiter ───────────────────────────────────────────────────
// Applied to /api/auth/refresh.
// Tokens should only refresh a few times per window.
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

const aiLimiter = process.env.NODE_ENV === 'development'
  ? (req, res, next) => next()  // no-op in development
  : rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      handler: rateLimitHandler,
    });

module.exports = { globalLimiter, authLimiter, refreshLimiter, aiLimiter };
