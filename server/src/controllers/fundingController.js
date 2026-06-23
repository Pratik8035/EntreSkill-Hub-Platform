'use strict';

/**
 * fundingController.js — Sprint 5 Phase 1 + Phase 2 + Phase 3
 *
 * Endpoints:
 *   GET /api/funding                  — list with filters + pagination
 *   GET /api/funding/:id              — get single program
 *   GET /api/funding/recommended      — legacy scheme recommendations
 *   GET /api/funding/eligibility      — Phase 2: eligibility engine results
 *   GET /api/funding/recommendations  — Phase 3: weighted funding recommendations
 */

const asyncHandler = require('express-async-handler');
const { sendSuccess } = require('../utils/responseHandler');
const FundingService = require('../services/fundingService');
const { recommendFundingForUser } = require('../services/schemeRecommendationService');
const EligibilityEngineService       = require('../services/eligibilityEngineService');
const FundingRecommendationService   = require('../services/fundingRecommendationService');
const FundingAdvisorService          = require('../services/fundingAdvisorService');
const { FundingQuerySchema, FundingParamsSchema } = require('../validations/funding.validation');

/**
 * @desc  List funding programs with optional filtering and pagination
 * @route GET /api/funding
 * @access Private
 */
const getFundingPrograms = asyncHandler(async (req, res) => {
  const query = FundingQuerySchema.parse(req.query);

  const result = await FundingService.listPrograms({
    fundingType: query.fundingType,
    provider:    query.provider,
    industry:    query.industry,
    search:      query.search,
    isActive:    query.isActive,
    page:        query.page,
    limit:       query.limit,
  });

  sendSuccess(res, {
    programs: result.programs,
    pagination: {
      total:      result.total,
      page:       result.page,
      limit:      result.limit,
      totalPages: result.totalPages,
    },
  }, 'Funding programs retrieved successfully');
});

/**
 * @desc  Get a single funding program by ID
 * @route GET /api/funding/:id
 * @access Private
 */
const getFundingById = asyncHandler(async (req, res) => {
  const { id } = FundingParamsSchema.parse(req.params);
  const program = await FundingService.getProgramById(id);
  sendSuccess(res, program, 'Funding program retrieved successfully');
});

/**
 * @desc  Get personalized recommended funding programs for the logged-in user
 * @route GET /api/funding/recommended
 * @access Private
 */
const getRecommendedFunding = asyncHandler(async (req, res) => {
  const recommended = await recommendFundingForUser(req.user._id);
  sendSuccess(res, recommended, 'Personalized funding recommendations retrieved successfully');
});

/**
 * @desc  Evaluate user eligibility across all active schemes and programs
 * @route GET /api/funding/eligibility
 * @access Private
 */
const getEligibility = asyncHandler(async (req, res) => {
  const result = await EligibilityEngineService.evaluate(req.user._id);
  sendSuccess(res, result, 'Eligibility evaluated successfully');
});

/**
 * @desc  Get top-5 weighted funding recommendations for the logged-in user
 * @route GET /api/funding/recommendations
 * @access Private
 */
const getFundingRecommendations = asyncHandler(async (req, res) => {
  const result = await FundingRecommendationService.recommend(req.user._id);
  sendSuccess(res, result, 'Funding recommendations retrieved successfully');
});

/**
 * @desc  AI Funding Advisor — combines eligibility + recommendations + AI summary
 * @route GET /api/funding/advisor
 * @access Private
 */
const getFundingAdvisor = asyncHandler(async (req, res) => {
  const result = await FundingAdvisorService.getAdvisorSummary(req.user._id, req.user);
  sendSuccess(res, result, 'Funding advisor summary retrieved successfully');
});

module.exports = {
  getFundingPrograms,
  getFundingById,
  getRecommendedFunding,
  getEligibility,
  getFundingRecommendations,
  getFundingAdvisor,
};
