'use strict';

/**
 * schemeController.js — Sprint 5 Phase 1
 *
 * Endpoints:
 *   GET /api/schemes              — list with filters + pagination
 *   GET /api/schemes/:id          — get single scheme
 *   GET /api/schemes/recommended  — personalized recommendations (existing)
 *   GET /api/schemes/check-eligibility/:id — eligibility check (existing)
 */

const asyncHandler = require('express-async-handler');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const SchemeService = require('../services/schemeService');
const { recommendSchemesForUser, checkSchemeEligibility } = require('../services/schemeRecommendationService');
const { SchemeQuerySchema, SchemeParamsSchema } = require('../validations/scheme.validation');

/**
 * @desc  List government schemes with optional filtering and pagination
 * @route GET /api/schemes
 * @access Private
 */
const getSchemes = asyncHandler(async (req, res) => {
  const query = SchemeQuerySchema.parse(req.query);

  const result = await SchemeService.listSchemes({
    category: query.category,
    provider: query.provider,
    state:    query.state,
    search:   query.search,
    isActive: query.isActive,
    page:     query.page,
    limit:    query.limit,
  });

  sendSuccess(res, {
    schemes:    result.schemes,
    pagination: {
      total:      result.total,
      page:       result.page,
      limit:      result.limit,
      totalPages: result.totalPages,
    },
  }, 'Government schemes retrieved successfully');
});

/**
 * @desc  Get a single government scheme by ID
 * @route GET /api/schemes/:id
 * @access Private
 */
const getSchemeById = asyncHandler(async (req, res) => {
  const { id } = SchemeParamsSchema.parse(req.params);
  const scheme = await SchemeService.getSchemeById(id);
  sendSuccess(res, scheme, 'Government scheme retrieved successfully');
});

/**
 * @desc  Get personalized recommended schemes for the logged-in user
 * @route GET /api/schemes/recommended
 * @access Private
 */
const getRecommendedSchemes = asyncHandler(async (req, res) => {
  const recommended = await recommendSchemesForUser(req.user._id);
  sendSuccess(res, recommended, 'Personalized government schemes recommended successfully');
});

/**
 * @desc  Check user eligibility for a specific scheme
 * @route GET /api/schemes/check-eligibility/:id
 * @access Private
 */
const checkEligibility = asyncHandler(async (req, res) => {
  const eligibilityReport = await checkSchemeEligibility(req.params.id, req.user._id);
  sendSuccess(res, eligibilityReport, 'Scheme eligibility checked successfully');
});

module.exports = {
  getSchemes,
  getSchemeById,
  getRecommendedSchemes,
  checkEligibility,
};
