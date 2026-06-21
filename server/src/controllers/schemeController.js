const GovernmentScheme = require('../models/GovernmentScheme');
const { recommendSchemesForUser, checkSchemeEligibility } = require('../services/schemeRecommendationService');
const asyncHandler = require('express-async-handler');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc Get all government schemes with optional search & filters
 * @route GET /api/schemes
 * @access Private
 */
const getSchemes = asyncHandler(async (req, res) => {
  const { search, category, state } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { eligibility: { $regex: search, $options: 'i' } }
    ];
  }

  if (category && category !== 'All') {
    filter.category = category;
  }

  if (state && state !== 'All') {
    filter.state = { $in: [state, 'All', 'National', 'India'] };
  }

  const schemes = await GovernmentScheme.find(filter).sort({ createdAt: -1 }).lean();
  sendSuccess(res, schemes, 'Government schemes retrieved successfully');
});

/**
 * @desc Get personalized recommended schemes for user
 * @route GET /api/schemes/recommended
 * @access Private
 */
const getRecommendedSchemes = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const recommended = await recommendSchemesForUser(userId);
  sendSuccess(res, recommended, 'Personalized government schemes recommended successfully');
});

/**
 * @desc Check user eligibility for a specific scheme
 * @route GET /api/schemes/check-eligibility/:id
 * @access Private
 */
const checkEligibility = asyncHandler(async (req, res) => {
  const schemeId = req.params.id;
  const userId = req.user._id;
  
  const eligibilityReport = await checkSchemeEligibility(schemeId, userId);
  sendSuccess(res, eligibilityReport, 'Scheme eligibility checked successfully');
});

module.exports = {
  getSchemes,
  getRecommendedSchemes,
  checkEligibility,
};
