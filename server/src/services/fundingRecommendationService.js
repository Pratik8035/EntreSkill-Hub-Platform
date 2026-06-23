'use strict';

/**
 * fundingRecommendationService.js — Sprint 5 Phase 3
 *
 * Recommends the best-matching government schemes and funding programs
 * for a given user using a weighted scoring model.
 *
 * Scoring weights (must sum to 100%):
 *   Industry Match    40%
 *   Business Match    30%
 *   Experience Match  20%
 *   Assessment Match  10%
 *
 * Public API
 * ──────────
 *   FundingRecommendationService.recommend(userId)
 *     → { recommendations: TopRecommendation[], totalMatches: number }
 *
 * TopRecommendation shape:
 *   {
 *     name         : string,
 *     type         : 'scheme' | 'program',
 *     fundingType  : string | null,
 *     provider     : string | null,
 *     score        : number (0-100),
 *     reasons      : string[],
 *     applicationUrl: string | null,
 *   }
 *
 * Returns top 5 items by score.
 * Never throws — missing user data returns safe defaults.
 */

const mongoose = require('mongoose');

const User             = require('../models/User');
const UserAssessment   = require('../models/UserAssessment');
const UserSkill        = require('../models/UserSkill');
const UserInterest     = require('../models/UserInterest');
const BusinessPlan     = require('../models/BusinessPlan');
const GovernmentScheme = require('../models/GovernmentScheme');
const FundingProgram   = require('../models/FundingProgram');
require('../models/EligibilityRule');

// ─── Constants ────────────────────────────────────────────────────────────────
const TOP_N = 5;

const WEIGHT_INDUSTRY   = 0.40;
const WEIGHT_BUSINESS   = 0.30;
const WEIGHT_EXPERIENCE = 0.20;
const WEIGHT_ASSESSMENT = 0.10;

// Experience level → numeric tier (1-3)
const EXP_TIER = { Beginner: 1, Intermediate: 2, Experienced: 3 };

// ─── Industry synonym map ─────────────────────────────────────────────────────
const CATEGORY_SYNONYMS = {
  'tailoring & fashion': ['fashion', 'apparel', 'textiles', 'tailoring'],
  'food & catering':     ['food', 'catering', 'hospitality', 'beverages'],
  'handicrafts':         ['crafts', 'handicrafts', 'art', 'creative'],
  'beauty & wellness':   ['beauty', 'wellness', 'healthcare', 'personal care'],
  'repair services':     ['repair', 'maintenance', 'electronics', 'mechanic'],
  'agriculture':         ['agriculture', 'farming', 'agro', 'rural'],
  'digital services':    ['digital', 'technology', 'web', 'software', 'it'],
  'education & training':['education', 'training', 'coaching'],
  'home services':       ['home', 'cleaning', 'interior'],
  'retail & trading':    ['retail', 'trading', 'commerce', 'shop'],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function categoryMatches(userCategory, targetIndustry) {
  if (!targetIndustry) return true;
  const tgt = targetIndustry.toLowerCase().trim();
  if (['all', 'multi', ''].includes(tgt)) return true;
  if (!userCategory) return false;
  const src = userCategory.toLowerCase().trim();
  if (src === tgt) return true;
  const synonyms = CATEGORY_SYNONYMS[src] || [];
  return synonyms.includes(tgt) || tgt.includes(src) || src.includes(tgt);
}

/**
 * Compute a 0-1 industry match score.
 * Returns { score, reason }.
 */
function industryScore(userCategory, industries) {
  if (!userCategory) {
    return { score: 0.3, reason: 'No business category set — add a business idea for better matching.' };
  }
  const targets = Array.isArray(industries) ? industries : (industries ? [industries] : []);
  const isOpen  = targets.length === 0 || targets.some((i) => ['all', 'multi'].includes((i || '').toLowerCase().trim()));

  if (isOpen) {
    return { score: 0.7, reason: 'Open to all industries.' };
  }
  const matched = targets.some((ind) => categoryMatches(userCategory, ind));
  if (matched) {
    return { score: 1.0, reason: `Your business category "${userCategory}" matches target industries.` };
  }
  return {
    score: 0.0,
    reason: `Your category "${userCategory}" does not match [${targets.join(', ')}].`,
  };
}

/**
 * Compute a 0-1 business plan match score.
 * Returns { score, reason }.
 */
function businessScore(hasBusinessPlan, riskScore) {
  if (!hasBusinessPlan) {
    return { score: 0.0, reason: 'No business plan found — generate one to improve your match.' };
  }
  // Risk-adjusted bonus
  const riskMultiplier = riskScore === 'Low' ? 1.0 : riskScore === 'Medium' ? 0.85 : 0.7;
  return {
    score: riskMultiplier,
    reason: hasBusinessPlan
      ? `Business plan available${riskScore ? ` (risk: ${riskScore})` : ''}.`
      : '',
  };
}

/**
 * Compute a 0-1 experience match score for a given requirement tier.
 * Returns { score, reason }.
 */
function experienceScore(userExpLevel, requiredTier) {
  const userTier = EXP_TIER[userExpLevel] || 1;
  if (userTier >= requiredTier) {
    return { score: 1.0, reason: `Experience level (${userExpLevel}) meets the requirement.` };
  }
  // Partial credit: 0.5 if one level below
  if (requiredTier - userTier === 1) {
    return { score: 0.5, reason: `Experience level (${userExpLevel}) is close to the requirement.` };
  }
  return { score: 0.0, reason: `Experience level (${userExpLevel}) is below the recommended level.` };
}

/**
 * Compute a 0-1 assessment match score.
 * Returns { score, reason }.
 */
function assessmentScore(isCompleted, rawScore) {
  if (!isCompleted) {
    return { score: 0.0, reason: 'Complete your assessment to improve this score.' };
  }
  const normalized = Math.min(1, (rawScore || 0) / 100);
  return {
    score: normalized,
    reason: `Assessment score: ${rawScore ?? 0}%.`,
  };
}

// ─── FundingRecommendationService ─────────────────────────────────────────────

class FundingRecommendationService {

  /**
   * Produce top-5 funding recommendations for a user.
   *
   * @param {string|ObjectId} userId
   * @returns {Promise<{ recommendations: TopRecommendation[], totalMatches: number }>}
   */
  static async recommend(userId) {
    // ── 1. Load user context ─────────────────────────────────────────────
    const ctx = await FundingRecommendationService._buildContext(userId);

    // ── 2. Load all active schemes + programs ────────────────────────────
    const [schemes, programs] = await Promise.all([
      GovernmentScheme.find({ isActive: true }).lean(),
      FundingProgram.find({ isActive: true }).populate('eligibilityRules').lean(),
    ]);

    // ── 3. Score each item ───────────────────────────────────────────────
    const scored = [
      ...schemes.map((s) => FundingRecommendationService._scoreScheme(s, ctx)),
      ...programs.map((p) => FundingRecommendationService._scoreProgram(p, ctx)),
    ];

    // ── 4. Sort by score desc, take top N ────────────────────────────────
    scored.sort((a, b) => b.score - a.score);
    const recommendations = scored.slice(0, TOP_N);
    const totalMatches    = scored.filter((r) => r.score >= 40).length;

    return { recommendations, totalMatches };
  }

  // ── Score a GovernmentScheme ──────────────────────────────────────────────

  static _scoreScheme(scheme, ctx) {
    const reasons = [];

    // Industry (40%)
    const industries = scheme.industry ? [scheme.industry] : [];
    const ind = industryScore(ctx.topIdeaCategory, industries);
    reasons.push(ind.reason);

    // Business match (30%) — whether we have a plan + cost coverage
    const biz = businessScore(ctx.hasBusinessPlan, ctx.businessPlanRisk);
    reasons.push(biz.reason);

    // Experience (20%) — beginnerFriendly schemes require tier 1
    const schemeText        = (scheme.name + ' ' + (scheme.eligibilityCriteria || scheme.eligibility || '')).toLowerCase();
    const isBeginnerFriendly = /mudra|pmegp|shishu|micro|seed|stand.?up|startup india/i.test(schemeText);
    const requiredTier       = isBeginnerFriendly ? 1 : 2;
    const exp = experienceScore(ctx.experienceLevel, requiredTier);
    reasons.push(exp.reason);

    // Assessment (10%)
    const ass = assessmentScore(ctx.isAssessmentDone, ctx.assessmentScoreVal);
    reasons.push(ass.reason);

    const rawScore = (
      ind.score * WEIGHT_INDUSTRY +
      biz.score * WEIGHT_BUSINESS +
      exp.score * WEIGHT_EXPERIENCE +
      ass.score * WEIGHT_ASSESSMENT
    ) * 100;

    return {
      name:         scheme.name,
      schemeId:     scheme._id,
      type:         'scheme',
      fundingType:  scheme.category || null,
      provider:     scheme.provider || null,
      score:        Math.round(Math.min(100, rawScore)),
      reasons:      reasons.filter(Boolean),
      applicationUrl: scheme.applicationUrl || scheme.officialLink || null,
      fundingAmount:  scheme.fundingAmount || null,
    };
  }

  // ── Score a FundingProgram ────────────────────────────────────────────────

  static _scoreProgram(program, ctx) {
    const reasons = [];

    // Industry (40%)
    const industries = [
      ...(program.industries || []),
      program.industry ? program.industry : null,
    ].filter(Boolean);
    const ind = industryScore(ctx.topIdeaCategory, industries);
    reasons.push(ind.reason);

    // Business match (30%)
    const biz = businessScore(ctx.hasBusinessPlan, ctx.businessPlanRisk);
    reasons.push(biz.reason);

    // Experience (20%) — grants are tier-1, loans require tier-2
    const requiredTier = program.fundingType === 'Grant' ? 1 : 2;
    const exp = experienceScore(ctx.experienceLevel, requiredTier);
    reasons.push(exp.reason);

    // Assessment (10%)
    const ass = assessmentScore(ctx.isAssessmentDone, ctx.assessmentScoreVal);
    reasons.push(ass.reason);

    const rawScore = (
      ind.score * WEIGHT_INDUSTRY +
      biz.score * WEIGHT_BUSINESS +
      exp.score * WEIGHT_EXPERIENCE +
      ass.score * WEIGHT_ASSESSMENT
    ) * 100;

    return {
      name:          program.name,
      schemeId:      program._id,
      type:          'program',
      fundingType:   program.fundingType || null,
      provider:      program.provider || null,
      score:         Math.round(Math.min(100, rawScore)),
      reasons:       reasons.filter(Boolean),
      applicationUrl: program.applicationLink || null,
      minAmount:      program.minAmount || null,
      maxAmount:      program.maxAmount || null,
    };
  }

  // ── Build user context ────────────────────────────────────────────────────

  static async _buildContext(userId) {
    const ctx = {
      userId,
      experienceLevel:   'Beginner',
      assessmentScoreVal: 0,
      isAssessmentDone:   false,
      topIdeaCategory:    null,
      topIdeaName:        null,
      hasBusinessPlan:    false,
      businessPlanRisk:   null,
      userState:          '',
    };

    try {
      const [user, assessment] = await Promise.all([
        User.findById(userId).lean(),
        UserAssessment.findOne({ userId }).lean(),
      ]);

      if (!user) return ctx;

      ctx.userState = user.profile?.location || '';

      if (assessment) {
        ctx.experienceLevel    = assessment.experienceLevel || 'Beginner';
        ctx.assessmentScoreVal = assessment.assessmentScore || 0;
        ctx.isAssessmentDone   = assessment.isCompleted || false;
      }

      // Fetch the user's most recent business plan (with its idea)
      const topPlan = await BusinessPlan.findOne()
        .populate({ path: 'businessIdeaId', model: 'BusinessIdea', select: 'category name' })
        .sort({ createdAt: -1 })
        .lean();

      if (topPlan && topPlan.businessIdeaId) {
        ctx.topIdeaCategory  = topPlan.businessIdeaId.category || null;
        ctx.topIdeaName      = topPlan.businessIdeaId.name     || null;
        ctx.hasBusinessPlan  = true;
        ctx.businessPlanRisk = topPlan.riskScore || null;
      }

    } catch (err) {
      console.error('[FundingRecommendationService] _buildContext error:', err.message);
    }

    return ctx;
  }
}

module.exports = FundingRecommendationService;
