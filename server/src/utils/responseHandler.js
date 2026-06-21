/**
 * responseHandler — Standardized API Response Utilities
 *
 * PURPOSE:
 *   Enforces a uniform JSON envelope across every API endpoint so the frontend
 *   can rely on a predictable `{ success, message, data }` / `{ success, message, errors }`
 *   shape regardless of which route it calls.
 *
 * SUCCESS ENVELOPE:
 *   {
 *     "success": true,
 *     "message": "User registered successfully.",
 *     "data": { ... }
 *   }
 *
 * ERROR ENVELOPE:
 *   {
 *     "success": false,
 *     "message": "Validation failed.",
 *     "errors": [
 *       { "field": "email", "message": "Invalid email format" }
 *     ]
 *   }
 */

/**
 * Send a standardized success response.
 *
 * @param {import('express').Response} res
 * @param {object|Array|null} data       - Payload to return (omit key if null)
 * @param {string} message               - Human-readable success message
 * @param {number} [statusCode=200]      - HTTP status code
 */
const sendSuccess = (res, data = null, message = 'Request successful', statusCode = 200) => {
  const body = { success: true, message };
  if (data !== null && data !== undefined) {
    body.data = data;
  }
  return res.status(statusCode).json(body);
};

/**
 * Send a standardized error response.
 *
 * @param {import('express').Response} res
 * @param {string} message               - Human-readable error description
 * @param {Array}  [errors=[]]           - Optional field-level error array (Zod details)
 * @param {number} [statusCode=500]      - HTTP status code
 */
const sendError = (res, message = 'An unexpected error occurred', errors = [], statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message, errors });
};

module.exports = { sendSuccess, sendError };
