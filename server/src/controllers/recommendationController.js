const { getRecommendationsForUser } = require('../services/recommendationEngine');
const BusinessIdea = require('../models/BusinessIdea');
const asyncHandler = require('express-async-handler');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// @desc Get top recommendations for logged in user
// @route GET /api/recommendations
// @access Private
const getRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const recommendations = await getRecommendationsForUser(userId);
  sendSuccess(res, recommendations, 'Recommendations retrieved');
});

// @desc Get detailed recommendation by business idea id
// @route GET /api/recommendations/:id
// @access Private
const getRecommendationDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const businessIdeaId = req.params.id;
  const recommendations = await getRecommendationsForUser(userId);
  const detail = recommendations.find(r => r.businessIdea._id.toString() === businessIdeaId);
  if (!detail) return sendError(res, 'Recommendation not found', 404);
  sendSuccess(res, detail, 'Recommendation detail retrieved');
});

module.exports = { getRecommendations, getRecommendationDetails };
