const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const { RegisterSchema, LoginSchema } = require('../validations/auth.validation');
const { authLimiter } = require('../middleware/rateLimiter');

// ─── Public Routes ─────────────────────────────────────────────────────────
router.post('/register',            authLimiter, validateRequest(RegisterSchema), registerUser);
router.post('/login',               authLimiter, validateRequest(LoginSchema),    loginUser);
router.post('/refresh',             authLimiter, refreshAccessToken);
router.post('/verify-email',        authLimiter, verifyEmail);
router.post('/resend-verification', authLimiter, resendVerification);
router.post('/forgot-password',     authLimiter, forgotPassword);
router.post('/reset-password',      authLimiter, resetPassword);

// ─── Protected Routes ──────────────────────────────────────────────────────
router.post('/logout',   protect, logoutUser);
router.get('/me',        protect, getMe);
router.get('/profile',   protect, getMe);

module.exports = router;
