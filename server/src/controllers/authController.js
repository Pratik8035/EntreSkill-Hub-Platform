const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { sendEmail } = require('../services/emailService');
const logger = require('../utils/logger');

// ─── Token Generators ────────────────────────────────────────────────────────

const generateAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' });

const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });

const generateOpaqueToken = () => crypto.randomBytes(32).toString('hex');

// ─── Cookie helpers ──────────────────────────────────────────────────────────

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });
};

// ─── Register ────────────────────────────────────────────────────────────────

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, profile } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Please add all required fields: name, email, password', [], 400);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendError(res, 'User already exists with this email', [], 400);
    }

    let assignedRole = 'user';
    if (role && ['user', 'mentor'].includes(role)) {
      assignedRole = role;
    }

    // Generate email verification token
    const verificationToken = generateOpaqueToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      profile: profile || { skills: [], location: '', bio: '', phoneNumber: '' },
      verificationToken,
      verificationTokenExpires,
    });

    if (!user) {
      return sendError(res, 'Invalid user data', [], 400);
    }

    // Send verification email
    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Verify your EntreSkill Hub account',
      text: `Hi ${user.name},\n\nClick the link below to verify your email address:\n${verifyUrl}\n\nThis link expires in 24 hours.\n\nIf you did not create an account, please ignore this email.`,
      html: `<h2>Welcome to EntreSkill Hub, ${user.name}!</h2><p>Click below to verify your email:</p><a href="${verifyUrl}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none">Verify Email</a><p>Link expires in 24 hours.</p>`,
    });

    // Issue tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, refreshToken);

    logger.info({ userId: user._id, email: user.email }, 'New user registered');

    return sendSuccess(
      res,
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isVerified: user.isVerified,
        token: accessToken,
      },
      'User registered successfully. Please check your email to verify your account.',
      201
    );
  } catch (error) {
    next(error);
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────

// @desc    Authenticate a user & get tokens
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Please provide both email and password', [], 400);
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return sendError(res, 'Invalid email or password', [], 401);
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, refreshToken);

    logger.info({ userId: user._id }, 'User logged in');

    return sendSuccess(
      res,
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isVerified: user.isVerified,
        token: accessToken,
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

// ─── Refresh Access Token ────────────────────────────────────────────────────

// @desc    Issue new access token using refresh token
// @route   POST /api/auth/refresh
// @access  Public (via HTTP-only cookie or body)
const refreshAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      return sendError(res, 'No refresh token provided', [], 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    } catch {
      return sendError(res, 'Invalid or expired refresh token', [], 401);
    }

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return sendError(res, 'Refresh token mismatch — please log in again', [], 401);
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, newRefreshToken);

    return sendSuccess(res, { token: newAccessToken }, 'Access token refreshed');
  } catch (error) {
    next(error);
  }
};

// ─── Logout ──────────────────────────────────────────────────────────────────

// @desc    Invalidate refresh token and clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    }
    clearRefreshCookie(res);
    return sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

// ─── Email Verification ──────────────────────────────────────────────────────

// @desc    Verify email using token from email link
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return sendError(res, 'Verification token is required', [], 400);
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return sendError(res, 'Invalid or expired verification token', [], 400);
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save({ validateBeforeSave: false });

    logger.info({ userId: user._id }, 'Email verified');

    return sendSuccess(res, null, 'Email verified successfully. You can now log in.');
  } catch (error) {
    next(error);
  }
};

// @desc    Resend email verification link
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 'Email is required', [], 400);
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal whether email exists
      return sendSuccess(res, null, 'If that email exists and is unverified, a new link has been sent.');
    }

    if (user.isVerified) {
      return sendError(res, 'This account is already verified', [], 400);
    }

    const verificationToken = generateOpaqueToken();
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Resend: Verify your EntreSkill Hub account',
      text: `Hi ${user.name},\n\nYour new verification link:\n${verifyUrl}\n\nExpires in 24 hours.`,
      html: `<h2>Verify your EntreSkill Hub account</h2><a href="${verifyUrl}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none">Verify Email</a>`,
    });

    return sendSuccess(res, null, 'If that email exists and is unverified, a new link has been sent.');
  } catch (error) {
    next(error);
  }
};

// ─── Forgot / Reset Password ─────────────────────────────────────────────────

// @desc    Generate password reset token and email it
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 'Email is required', [], 400);
    }

    const user = await User.findOne({ email });

    // Always return same response to prevent email enumeration
    if (!user) {
      return sendSuccess(res, null, 'If that email is registered, a reset link has been sent.');
    }

    const resetToken = generateOpaqueToken();
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset — EntreSkill Hub',
      text: `Hi ${user.name},\n\nClick below to reset your password:\n${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.`,
      html: `<h2>Reset Your Password</h2><p>Hi ${user.name},</p><p>Click below to reset your password:</p><a href="${resetUrl}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none">Reset Password</a><p>Expires in 1 hour.</p>`,
    });

    logger.info({ userId: user._id }, 'Password reset token issued');

    return sendSuccess(res, null, 'If that email is registered, a reset link has been sent.');
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using reset token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return sendError(res, 'Token and new password are required', [], 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters', [], 400);
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return sendError(res, 'Invalid or expired reset token', [], 400);
    }

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.refreshToken = null; // Invalidate all sessions on password change
    await user.save();

    clearRefreshCookie(res);

    logger.info({ userId: user._id }, 'Password reset successfully');

    return sendSuccess(res, null, 'Password has been reset successfully. Please log in with your new password.');
  } catch (error) {
    next(error);
  }
};

// ─── Get Me ──────────────────────────────────────────────────────────────────

// @desc    Get current logged in user profile
// @route   GET /api/auth/me, GET /api/auth/profile
// @access  Private
const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, req.user, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe,
};
