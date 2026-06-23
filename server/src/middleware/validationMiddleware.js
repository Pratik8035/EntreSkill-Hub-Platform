const { z } = require('zod');

/**
 * validateRequest — Zod Schema Validation Middleware Factory
 *
 * PURPOSE:
 *   Returns an Express middleware that parses the selected part of the request
 *   (body, query, or params) against a given Zod schema.
 *   On failure, it short-circuits the route pipeline and returns a structured
 *   400 Bad Request with field-level error details — so the frontend knows
 *   exactly which field failed and why.
 *
 * USAGE:
 *   router.post('/register', validateRequest(RegisterSchema), authController.register);
 *   router.get('/ideas', validateRequest(IdeasQuerySchema, 'query'), ideasController.list);
 *
 * @param {z.ZodSchema} schema        - A Zod schema object
 * @param {'body'|'query'|'params'} [source='body'] - Request key to validate against
 */
const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      // Transform Zod's flat errors array into a clean field-error format
      // Zod v4 uses .issues; .errors is kept as a fallback for v3 compatibility
      const errors = (result.error.issues ?? result.error.errors ?? []).map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed. Please check the fields below.',
        errors,
      });
    }

    // Attach parsed (and coerced/stripped) data back onto the request
    // so downstream controllers always receive clean, type-safe data
    req[source] = result.data;
    next();
  };
};

module.exports = { validateRequest };
