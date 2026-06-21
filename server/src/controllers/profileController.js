const { getProfileProgress } = require('../services/analyticsService');
const asyncHandler = require('express-async-handler');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// @desc Get profile progress for logged-in user
// @route GET /api/profile/progress
// @access Private
const getProgress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  try {
    const progress = await getProfileProgress(userId);
    sendSuccess(res, progress, 'Profile progress retrieved');
  } catch (err) {
    sendError(res, err.message, 500);
  }
});

module.exports = { getProgress };
