/**
 * authMiddleware.js — JWT Verification & Role-Based Access Control
 *
 * PURPOSE:
 *   Protects private routes by verifying the Bearer access token in the
 *   Authorization header. Attaches `req.user` for downstream controllers.
 *   The `authorize(...roles)` factory restricts access to specific roles.
 *
 * NOTE:
 *   This file remains in /middleware (shared infrastructure) rather than
 *   /modules/auth because it is consumed by EVERY protected module —
 *   skills, roadmaps, mentors, etc. — not just the auth module itself.
 */

const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

// Lazily import User to avoid circular deps if models import middleware
let User;
const getUser = () => {
  if (!User) User = require('../models/User');
  return User;
};

// ─── protect ─────────────────────────────────────────────────────────────────
// Verifies the access token and attaches the user document to req.user.
const protect = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authentication required. Please log in.', 401));
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Fetch user — confirms account still exists and is not deleted
    const UserModel = getUser();
    const user = await UserModel.findById(decoded.id).select('-password');
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 4. Attach to request for downstream use
    req.user = user;
    next();
  } catch (err) {
    // jwt.verify throws JsonWebTokenError / TokenExpiredError — caught by errorHandler
    next(err);
  }
};

// ─── authorize ───────────────────────────────────────────────────────────────
// Middleware factory restricting access to one or more roles.
// Must be chained AFTER protect: router.get('/admin', protect, authorize('admin'), ...)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. This resource requires one of the following roles: ${roles.join(', ')}.`,
          403
        )
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
