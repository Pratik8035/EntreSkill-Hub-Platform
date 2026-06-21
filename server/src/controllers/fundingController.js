const FundingProgram = require('../models/FundingProgram');
const { recommendFundingForUser } = require('../services/schemeRecommendationService');
const asyncHandler = require('express-async-handler');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc Get all funding programs/loans with optional search & filters
 * @route GET /api/funding
 * @access Private
 */
const getFundingPrograms = asyncHandler(async (req, res) => {
  const { search, industry, provider } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { provider: { $regex: search, $options: 'i' } },
      { eligibility: { $regex: search, $options: 'i' } }
    ];
  }

  if (industry && industry !== 'All') {
    filter.industry = { $in: [industry, 'All', 'Multi'] };
  }

  if (provider && provider !== 'All') {
    filter.provider = { $regex: provider, $options: 'i' };
  }

  const funding = await FundingProgram.find(filter).sort({ createdAt: -1 }).lean();
  sendSuccess(res, funding, 'Funding programs retrieved successfully');
});

/**
 * @desc Get personalized recommended funding programs for user
 * @route GET /api/funding/recommended
 * @access Private
 */
const getRecommendedFunding = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const recommended = await recommendFundingForUser(userId);
  sendSuccess(res, recommended, 'Personalized funding recommendations retrieved successfully');
});

module.exports = {
  getFundingPrograms,
  getRecommendedFunding,
};
