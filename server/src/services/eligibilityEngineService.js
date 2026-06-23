'use strict';

/**
 * eligibilityEngineService.js — Sprint 5 Phase 2
 *
 * Evaluates a user's eligibility against every active GovernmentScheme
 * and FundingProgram in the database.
 *
 * Public API
 * ──────────
 *   EligibilityEngineService.evaluate(userId)
 *     → { eligibleSchemes, partiallyEligibleSchemes, notEligibleSchemes }
 *
 * Each item in the arrays has the shape:
 *   {
 *     schemeName        : string,
 *     type              : 'scheme' | 'program',
 *     eligible          : boolean,
 *     score             : number (0-100),
 *     reasons           : string[],
 *     missingRequirements: string[],
 *   }
 *
 * Thresholds:
 *   score >= 75  → eligibleSchemes
 *   score >= 40  → partiallyEligibleSchemes
 *   score <  40  → notEligibleSchemes
 *
 * Never throws — missing user data returns safe defaults.
 */

const mongoose = require('mongoose');

const User             = require('../models/User');
const UserAssessment   = require('../models/UserAssessment');
const UserSkill        = require('../models/UserSkill');
const UserInterest     = require('../models/UserInterest');
const BusinessPlan     = require('../models/BusinessPlan');
const BusinessIdea     = require('../models/BusinessIdea');
const GovernmentScheme = require('../models/GovernmentScheme');
const FundingProgram   = require('../models/FundingProgram');
require('../models/EligibilityRule'); // ensure schema is registered for populate

// ─── Thresholds ───────────────────────────────────────────────────────────────
const ELIGIBLE_THRESHOLD          = 75;
const PARTIALLY_ELIGIBLE_THRESHOLD = 40;

// ─── Industry/category synonym map (shared with schemeRecommendationService) ─
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

function isNationalScheme(schemeIndustry, schemeState) {
  const ind = (schemeIndustry || '').toLowerCase().trim();
  const st  = (schemeState   || '').toLowerCase().trim();
  const nationalValues = ['all', 'multi', 'national', 'india', ''];
  return nationalValues.includes(ind) || nationalValues.includes(st);
}

function categoryMatches(userCategory, targetIndustry) {
  if (!targetIndustry) return true;
  const tgt = targetIndustry.toLowerCase().trim();
  if (['all', 'multi'].includes(tgt)) return true;
  if (!userCategory) return false;
  const src = userCategory.toLowerCase().trim();
  if (src === tgt) return true;
  const synonyms = CATEGORY_SYNONYMS[src] || [];
  return synonyms.includes(tgt) || tgt.includes(src) || src.includes(tgt);
}

function stateMatches(userState, schemeState) {
  const st = (schemeState || '').toLowerCase().trim();
  if (!st || ['all', 'national', 'india'].includes(st)) return true;
  if (!userState) return false;
  return userState.toLowerCase().trim() === st;
}

/**
 * Evaluate a single EligibilityRule object against user context.
 * Returns { pass: boolean, note: string }.
 */
function evaluateRule(rule, userCtx) {
  const { field, operator, value } = rule;
  const rawActual = userCtx[field];

  // Field not present in context → cannot evaluate → treat as soft fail
  if (rawActual === undefined || rawActual === null) {
    return { pass: false, note: `Field "${field}" not found in your profile.` };
  }

  const actual  = String(rawActual).toLowerCase().trim();
  const expected = String(value).toLowerCase().trim();

  switch (operator) {
    case 'eq':       return { pass: actual === expected,    note: `${field} must equal "${value}".` };
    case 'neq':      return { pass: actual !== expected,    note: `${field} must not equal "${value}".` };
    case 'contains': return { pass: actual.includes(expected), note: `${field} must contain "${value}".` };
    case 'gt':       return { pass: parseFloat(actual) >  parseFloat(expected), note: `${field} must be > ${value}.` };
    case 'gte':      return { pass: parseFloat(actual) >= parseFloat(expected), note: `${field} must be ≥ ${value}.` };
    case 'lt':       return { pass: parseFloat(actual) <  parseFloat(expected), note: `${field} must be < ${value}.` };
    case 'lte':      return { pass: parseFloat(actual) <= parseFloat(expected), note: `${field} must be ≤ ${value}.` };
    case 'in': {
      const allowed = expected.split(',').map((v) => v.trim());
      return { pass: allowed.includes(actual), note: `${field} must be one of: ${value}.` };
    }
    case 'nin': {
      const blocked = expected.split(',').map((v) => v.trim());
      return { pass: !blocked.includes(actual), note: `${field} must not be one of: ${value}.` };
    }
    default:
      return { pass: false, note: `Unknown operator "${operator}".` };
  }
}

// ─── EligibilityEngineService ────────────────────────────────────────────────

class EligibilityEngineService {

  /**
   * Evaluate the logged-in user against all active schemes and programs.
   *
   * @param {string|ObjectId} userId
   * @returns {Promise<EligibilityResult>}
   */
  static async evaluate(userId) {
    // ── 1. Load user context (all soft — never throw) ────────────────────
    const userCtx = await EligibilityEngineService._buildUserContext(userId);

    // ── 2. Load all active schemes + programs in parallel ────────────────
    const [schemes, programs] = await Promise.all([
      GovernmentScheme.find({ isActive: true }).lean(),
      FundingProgram.find({ isActive: true }).populate('eligibilityRules').lean(),
    ]);

    // ── 3. Score each item ───────────────────────────────────────────────
    const allResults = [
      ...schemes.map((s) => EligibilityEngineService._scoreScheme(s, userCtx)),
      ...programs.map((p) => EligibilityEngineService._scoreProgram(p, userCtx)),
    ];

    // ── 4. Bucket ────────────────────────────────────────────────────────
    const eligibleSchemes           = [];
    const partiallyEligibleSchemes  = [];
    const notEligibleSchemes        = [];

    for (const result of allResults) {
      if (result.score >= ELIGIBLE_THRESHOLD) {
        result.eligible = true;
        eligibleSchemes.push(result);
      } else if (result.score >= PARTIALLY_ELIGIBLE_THRESHOLD) {
        result.eligible = false;
        partiallyEligibleSchemes.push(result);
      } else {
        result.eligible = false;
        notEligibleSchemes.push(result);
      }
    }

    // Sort each bucket by score desc
    const byScore = (a, b) => b.score - a.score;
    eligibleSchemes.sort(byScore);
    partiallyEligibleSchemes.sort(byScore);
    notEligibleSchemes.sort(byScore);

    return { eligibleSchemes, partiallyEligibleSchemes, notEligibleSchemes };
  }

  // ── Score a GovernmentScheme ───────────────────────────────────────────────

  static _scoreScheme(scheme, userCtx) {
    let score = 0;
    const reasons              = [];
    const missingRequirements  = [];

    // ── Criterion 1: Assessment completion (10 pts) ───────────────────────
    if (userCtx.isAssessmentDone) {
      score += 10;
      reasons.push('Assessment completed.');
    } else {
      missingRequirements.push('Complete your skills assessment to strengthen your application.');
    }

    // ── Criterion 2: Experience level match (20 pts) ──────────────────────
    const expLevel = userCtx.experienceLevel || 'Beginner';
    const schemeText = (scheme.name + ' ' + (scheme.eligibilityCriteria || scheme.eligibility || '')).toLowerCase();
    const isBeginnerFriendly = /mudra|pmegp|shishu|micro|seed|stand.?up|startup india/i.test(schemeText);
    const needsExperienced   = /guarantee|cgtmse|credit guarantee|collateral/i.test(schemeText);

    if (isBeginnerFriendly) {
      score += 20;
      reasons.push('Scheme is open to early-stage / beginner entrepreneurs.');
    } else if (needsExperienced && expLevel === 'Beginner') {
      score += 5;
      missingRequirements.push('This scheme typically requires an established business track record.');
    } else {
      score += 15;
      reasons.push(`Your experience level (${expLevel}) meets the general requirement.`);
    }

    // ── Criterion 3: Industry / business category match (40 pts) ──────────
    const schemeIsNational = isNationalScheme(scheme.industry, scheme.state);
    const userCategory     = userCtx.topIdeaCategory;

    if (schemeIsNational) {
      score += 30;
      reasons.push('Scheme is open nationally across all industries.');
    } else if (userCategory && categoryMatches(userCategory, scheme.industry)) {
      score += 40;
      reasons.push(`Matches your business category: ${userCategory}.`);
    } else if (userCategory) {
      score += 5;
      missingRequirements.push(
        `Scheme targets "${scheme.industry}" industry; your category is "${userCategory}".`
      );
    } else {
      score += 10;
      missingRequirements.push('Add a business idea to improve industry match.');
    }

    // ── Criterion 4: State match (within industry score) ─────────────────
    if (!schemeIsNational) {
      const sMatch = stateMatches(userCtx.userState, scheme.state);
      if (sMatch) {
        score += 10;
        reasons.push(`Located in the scheme's target state.`);
      } else if (scheme.state) {
        missingRequirements.push(
          `Scheme requires residency in ${scheme.state}; your location: "${userCtx.userState || 'not set'}".`
        );
      }
    }

    // ── Criterion 5: Business plan availability (30 pts) ─────────────────
    if (userCtx.hasBusinessPlan) {
      score += 30;
      reasons.push('You have an active business plan on file.');
    } else {
      score += 0;
      const required = /seed|hackathon|sisfs/i.test(schemeText);
      if (required) {
        missingRequirements.push('This scheme requires a business plan — generate one from the Business Plan page.');
      } else {
        missingRequirements.push('A business plan will significantly strengthen your application.');
      }
    }

    return {
      schemeName:           scheme.name,
      schemeId:             scheme._id,
      type:                 'scheme',
      category:             scheme.category || null,
      provider:             scheme.provider || null,
      fundingAmount:        scheme.fundingAmount || null,
      eligible:             false, // set by caller after threshold check
      score:                Math.min(100, score),
      reasons,
      missingRequirements,
    };
  }

  // ── Score a FundingProgram ────────────────────────────────────────────────

  static _scoreProgram(program, userCtx) {
    let score = 0;
    const reasons              = [];
    const missingRequirements  = [];

    // ── Criterion 1: Assessment completion (10 pts) ───────────────────────
    if (userCtx.isAssessmentDone) {
      score += 10;
      reasons.push('Assessment completed.');
    } else {
      missingRequirements.push('Complete your skills assessment to improve your funding match.');
    }

    // ── Criterion 2: Experience level (20 pts) ────────────────────────────
    const expLevel = userCtx.experienceLevel || 'Beginner';
    if (program.fundingType === 'Grant') {
      score += 20;
      reasons.push('Grants are open to all experience levels.');
    } else if (expLevel === 'Intermediate' || expLevel === 'Experienced') {
      score += 20;
      reasons.push(`Your experience level (${expLevel}) meets lender requirements.`);
    } else {
      score += 10;
      reasons.push('Beginner entrepreneurs can apply; stronger profile improves chances.');
    }

    // ── Criterion 3: Industry match (40 pts) ──────────────────────────────
    const programIndustries = [
      ...(program.industries || []),
      program.industry || '',
    ].filter(Boolean);

    const isOpenToAll = programIndustries.some((ind) =>
      ['all', 'multi', ''].includes(ind.toLowerCase().trim())
    );

    const userCategory = userCtx.topIdeaCategory;

    if (isOpenToAll) {
      score += 30;
      reasons.push('Funding program is open to all industries.');
    } else if (userCategory && programIndustries.some((ind) => categoryMatches(userCategory, ind))) {
      score += 40;
      reasons.push(`Your business category (${userCategory}) matches the program's target industries.`);
    } else if (userCategory) {
      score += 5;
      missingRequirements.push(
        `Program targets [${programIndustries.join(', ')}]; your category is "${userCategory}".`
      );
    } else {
      score += 10;
      missingRequirements.push('Add a business idea to improve industry matching.');
    }

    // ── Criterion 4: Business plan (30 pts) ──────────────────────────────
    if (userCtx.hasBusinessPlan) {
      score += 30;
      reasons.push('You have a business plan — lenders require this for loan applications.');
    } else {
      missingRequirements.push('Generate a business plan before applying for this funding.');
    }

    // ── Structured EligibilityRule evaluation (bonus/penalty) ────────────
    if (program.eligibilityRules && program.eligibilityRules.length > 0) {
      for (const rule of program.eligibilityRules) {
        const { pass, note } = evaluateRule(rule, userCtx.flatProfile);
        if (pass) {
          reasons.push(`✓ Rule met: ${rule.ruleName}.`);
        } else {
          missingRequirements.push(`✗ Rule not met: ${note}`);
        }
      }
    }

    return {
      schemeName:    program.name,
      schemeId:      program._id,
      type:          'program',
      fundingType:   program.fundingType || null,
      provider:      program.provider || null,
      minAmount:     program.minAmount || null,
      maxAmount:     program.maxAmount || null,
      eligible:      false,
      score:         Math.min(100, score),
      reasons,
      missingRequirements,
    };
  }

  // ── Build user context object ─────────────────────────────────────────────

  /**
   * Assembles all user data needed for eligibility scoring.
   * Every field has a safe default — never throws.
   *
   * @param {string|ObjectId} userId
   * @returns {Promise<UserContext>}
   */
  static async _buildUserContext(userId) {
    const ctx = {
      userId,
      userState:       '',
      experienceLevel: 'Beginner',
      assessmentScore: 0,
      isAssessmentDone: false,
      topIdeaCategory:  null,
      topIdeaName:      null,
      hasBusinessPlan:  false,
      businessPlanRisk: null,
      skillCount:       0,
      interestCount:    0,
      flatProfile:      {},
    };

    try {
      const [user, assessment, skillCount, interestCount] = await Promise.all([
        User.findById(userId).lean(),
        UserAssessment.findOne({ userId }).lean(),
        UserSkill.countDocuments({ userId }),
        UserInterest.countDocuments({ userId }),
      ]);

      if (!user) return ctx; // unknown user — return defaults

      ctx.userState        = user.profile?.location || '';
      ctx.skillCount       = skillCount;
      ctx.interestCount    = interestCount;

      if (assessment) {
        ctx.experienceLevel   = assessment.experienceLevel || 'Beginner';
        ctx.assessmentScore   = assessment.assessmentScore || 0;
        ctx.isAssessmentDone  = assessment.isCompleted || false;
      }

      // Top business idea for this user (by recommendation score or any active business plan)
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

      // Flat profile for EligibilityRule evaluation
      ctx.flatProfile = {
        experienceLevel: ctx.experienceLevel,
        assessmentScore: String(ctx.assessmentScore),
        state:           ctx.userState,
        location:        ctx.userState,
        businessCategory:ctx.topIdeaCategory || '',
        hasBusinessPlan: ctx.hasBusinessPlan ? 'true' : 'false',
        riskScore:       ctx.businessPlanRisk || '',
        skillCount:      String(skillCount),
        interestCount:   String(interestCount),
      };

    } catch (err) {
      console.error('[EligibilityEngineService] _buildUserContext error:', err.message);
    }

    return ctx;
  }
}

module.exports = EligibilityEngineService;
