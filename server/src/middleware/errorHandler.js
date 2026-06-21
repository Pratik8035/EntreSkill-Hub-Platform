const AppError = require('../utils/AppError');

/**
 * Global Error Handler Middleware
 *
 * PURPOSE:
 *   Single centralized location for translating all thrown errors into a
 *   consistent { success, message, errors } JSON response.
 *   Must be registered LAST in app.js — after all routes.
 *
 * CATEGORIES HANDLED:
 *   1. AppError (operational) — thrown intentionally by controllers/services
 *   2. Zod ZodError           — though usually caught in validateRequest()
 *   3. Mongoose CastError     — invalid ObjectId format in route params
 *   4. Mongoose code 11000    — duplicate unique-index key violation
 *   5. JWT errors             — invalid signature or expired token
 *   6. Unknown / catch-all    — programming bugs; never expose internals
 *
 * PRODUCTION vs DEVELOPMENT:
 *   In development, the raw stack trace is included to assist debugging.
 *   In production, only the safe message is returned to the client.
 */

const isDev = process.env.NODE_ENV === 'development';

// ─── Error Transformers ───────────────────────────────────────────────────────

// Mongoose: invalid ObjectId (e.g. /api/users/not-an-id)
const handleCastError = (err) =>
  new AppError(`Invalid value '${err.value}' for field '${err.path}'.`, 400);

// Mongoose: unique index violation (e.g. duplicate email)
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return new AppError(
    `The value '${value}' is already in use for field '${field}'. Please use a different value.`,
    409
  );
};

// Mongoose: schema validation error (pre-save hooks)
const handleMongooseValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return new AppError('Database validation failed.', 400, errors);
};

// JWT: token is tampered or wrong secret
const handleJWTError = () =>
  new AppError('Invalid authentication token. Please log in again.', 401);

// JWT: token has passed its expiry date
const handleJWTExpiredError = () =>
  new AppError('Your session has expired. Please log in again.', 401);

// ─── Send Response Helpers ────────────────────────────────────────────────────

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    errors: err.errors || [],
    stack: err.stack,
    // Extra diagnostic fields only in development
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  // Only trusted, operational errors get a descriptive message
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
    });
  }

  // Programming / unexpected bugs — log but never expose internals
  console.error('[ERROR] Unexpected non-operational error:', err);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong on our end. Please try again later.',
    errors: [],
  });
};

// ─── Main Error Handler ───────────────────────────────────────────────────────

const errorHandler = (err, req, res, next) => {
  // Set defaults if not already set
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log every server-side error for diagnostics (stdout/monitoring)
  if (err.statusCode >= 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err);
  }

  let error = { ...err, message: err.message };

  // ── Transform known error types into AppErrors ───────────────────────────
  if (err.name === 'CastError') error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateKeyError(err);
  if (err.name === 'ValidationError') error = handleMongooseValidationError(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  // ── Send environment-appropriate response ─────────────────────────────────
  if (isDev) {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

module.exports = errorHandler;
