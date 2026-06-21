/**
 * AppError — Custom Operational Error Class
 *
 * PURPOSE:
 *   Distinguishes between operational errors (expected, handleable — e.g. "User not
 *   found", "Validation failed") and programming bugs (unexpected — null refs, etc.).
 *
 * WHY:
 *   The global error handler checks `err.isOperational`. If true, it sends a clean
 *   client-facing JSON response. If false (a bug), it logs the full stack and returns
 *   a generic 500 to avoid leaking internal implementation details.
 *
 * USAGE:
 *   throw new AppError('User with this email already exists.', 409);
 */
class AppError extends Error {
  /**
   * @param {string} message      - Human-readable error description sent to the client.
   * @param {number} statusCode   - HTTP status code (4xx for client, 5xx for server).
   * @param {Array}  errors       - Optional array of granular validation field errors.
   */
  constructor(message, statusCode, errors = []) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    this.isOperational = true; // Flag distinguishing from unhandled bugs
    this.errors = errors;      // Zod / field-level validation detail array

    // Capture clean stack trace, omitting this constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
