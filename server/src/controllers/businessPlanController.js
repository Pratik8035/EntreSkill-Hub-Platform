const asyncHandler = require('express-async-handler');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const BusinessPlan = require('../models/BusinessPlan');
const CostEstimate = require('../models/CostEstimate');
const RevenueProjection = require('../models/RevenueProjection');
const { generateBusinessPlan } = require('../services/businessPlanService');

// @desc Generate a business plan (and persist) for the logged‑in user
// @route POST /api/business-plan/generate/:businessIdeaId
// @access Private
const generatePlan = asyncHandler(async (req, res) => {
  const { businessIdeaId } = req.params;
  const userId = req.user._id;
  try {
    const plan = await generateBusinessPlan(businessIdeaId, userId);
    sendSuccess(res, plan, 'Business plan generated');
  } catch (err) {
    sendError(res, err.message, 500);
  }
});

// @desc Get a populated business plan
// @route GET /api/business-plan/:businessIdeaId
// @access Private
const getPlan = asyncHandler(async (req, res) => {
  const { businessIdeaId } = req.params;
  const plan = await BusinessPlan.findOne({ businessIdeaId })
    .populate('costEstimate')
    .populate('revenueProjection')
    .lean();
  if (!plan) return sendError(res, 'Business plan not found', 404);
  sendSuccess(res, plan, 'Business plan fetched');
});

// @desc Get cost estimate only
// @route GET /api/business-plan/cost/:businessIdeaId
// @access Private
const getCostEstimate = asyncHandler(async (req, res) => {
  const { businessIdeaId } = req.params;
  const cost = await CostEstimate.findOne({ businessIdeaId }).lean();
  if (!cost) return sendError(res, 'Cost estimate not found', 404);
  sendSuccess(res, cost, 'Cost estimate fetched');
});

// @desc Get revenue projection only
// @route GET /api/business-plan/revenue/:businessIdeaId
// @access Private
const getRevenueProjection = asyncHandler(async (req, res) => {
  const { businessIdeaId } = req.params;
  const rev = await RevenueProjection.findOne({ businessIdeaId }).lean();
  if (!rev) return sendError(res, 'Revenue projection not found', 404);
  sendSuccess(res, rev, 'Revenue projection fetched');
});

module.exports = {
  generatePlan,
  getPlan,
  getCostEstimate,
  getRevenueProjection,
};
