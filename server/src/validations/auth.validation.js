const { z } = require('zod');

// ─── Register Schema ─────────────────────────────────────────────────────────
// Validates the POST /api/auth/register request body.
// Rules:
//   - name: 2–60 chars, trim whitespace
//   - email: valid RFC-compliant email, lowercased
//   - password: min 6 chars, at least 1 letter and 1 number
//   - role: only 'user' or 'mentor' are self-selectable (admin must be seeded)
const RegisterSchema = z.object({
  name: z
    .string({ required_error: 'Name is required.' })
    .trim()
    .min(2, 'Name must be at least 2 characters long.')
    .max(60, 'Name cannot exceed 60 characters.'),

  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address.'),

  password: z
    .string({ required_error: 'Password is required.' })
    .min(6, 'Password must be at least 6 characters long.')
    .max(72, 'Password cannot exceed 72 characters.')
    .regex(
      /^(?=.*[a-zA-Z])(?=.*[0-9])/,
      'Password must contain at least one letter and one number.'
    ),

  role: z
    .enum(['user', 'mentor'], {
      errorMap: () => ({ message: "Role must be either 'user' or 'mentor'." }),
    })
    .optional()
    .default('user'),
});

// ─── Login Schema ────────────────────────────────────────────────────────────
// Validates the POST /api/auth/login request body.
// Intentionally minimal — avoid leaking which field is wrong to deter enumeration.
const LoginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address.'),

  password: z
    .string({ required_error: 'Password is required.' })
    .min(1, 'Password is required.'),
});

// ─── Refresh Token Schema ────────────────────────────────────────────────────
// The refresh token is read from an HttpOnly cookie — no body validation needed.
// This schema validates any optional query parameters passed to /api/auth/refresh.
const RefreshSchema = z.object({}).optional();

module.exports = { RegisterSchema, LoginSchema, RefreshSchema };
