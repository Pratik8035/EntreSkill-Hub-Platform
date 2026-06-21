const { getUserAnalytics, getDashboardAnalytics } = require('../services/analyticsService');
const asyncHandler = require('express-async-handler');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// @desc Get analytics for logged-in user
// @route GET /api/analytics/user
// @access Private
const getAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  try {
    const data = await getUserAnalytics(userId);
    sendSuccess(res, data, 'User analytics retrieved');
  } catch (err) {
    sendError(res, err.message, 500);
  }
});

// @desc Get dashboard analytics for logged-in user
// @route GET /api/analytics/dashboard
// @access Private
const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  try {
    const data = await getDashboardAnalytics(userId);
    sendSuccess(res, data, 'Dashboard analytics retrieved');
  } catch (err) {
    sendError(res, err.message, 500);
  }
});

module.exports = { getAnalytics, getDashboard };
