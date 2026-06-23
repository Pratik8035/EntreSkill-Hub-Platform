/**
 * contextService.js
 * Sprint 4 – Phase 2
 *
 * Assembles all user-specific context needed by the AI Mentor prompt builder.
 * Every independent query group runs in parallel via Promise.all().
 * Missing data (no roadmap, no business plan, etc.) never throws — it returns
 * safe empty/null values so a failed sub-query never kills the chat response.
 *
 * Public API
 * ──────────
 *   ContextService.buildUserContext(userId, businessIdeaId?)
 *     → { profile, assessment, recommendations, businessContext, mentors }
 *
 * Internal helpers (all static, all safe — catch their own errors)
 * ──────────────────────────────────────────────────────────────────
 *   getAssessmentContext(userId)
 *   getRecommendationContext(userId)
 *   getBusinessContext(businessIdeaId)
 *   getMentorContext(userId)
 */

'use strict';

const mongoose = require('mongoose');

// Models
const UserAssessment   = require('../models/UserAssessment');
const UserSkill        = require('../models/UserSkill');
const UserInterest     = require('../models/UserInterest');
const BusinessIdea     = require('../models/BusinessIdea');
const Roadmap          = require('../models/Roadmap');
const LearningResource = require('../models/LearningResource');
const BusinessPlan     = require('../models/BusinessPlan');

// Existing services (already tested, reuse don't rewrite)
const { getRecommendationsForUser } = require('./recommendationEngine');
const { getMentorMatches }          = require('./mentorMatchService');

// Sprint 5 Phase 4: Funding context
const EligibilityEngineService       = require('./eligibilityEngineService');
const FundingRecommendationService   = require('./fundingRecommendationService');

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const MAX_RESOURCES            = 5;
const MAX_RECOMMENDATIONS      = 3;
const MAX_MENTORS              = 3;
const MAX_SKILLS_IN_SNAPSHOT   = 10; // keep snapshot lean for prompt token budget
const MAX_INTERESTS_IN_SNAPSHOT = 8;
const EXEC_SUMMARY_MAX_CHARS   = 250;
const MAX_FUNDING_ELIGIBLE     = 3;  // Sprint 5 Phase 4

// ─────────────────────────────────────────────────────────────────────────────
// ContextService
// ─────────────────────────────────────────────────────────────────────────────
class ContextService {

  // ── Main entry point ───────────────────────────────────────────────────────

  /**
   * Build a full user context object by running all sub-queries in parallel.
   *
   * @param {ObjectId|string} userId
   * @param {ObjectId|string|null} [businessIdeaId]
   * @returns {Promise<ContextSnapshot>}
   *
   * ContextSnapshot shape (mirrors ChatSession.contextSnapshot schema):
   * {
   *   experienceLevel, assessmentScore, isAssessmentDone,
   *   skills        : [{ name, proficiency }],
   *   interests     : [{ name, weight }],
   *   businessIdeaName, businessIdeaCategory, startupCostRange, difficultyLevel,
   *   roadmapTimeline, milestoneCount, missingSkillNames,
   *   riskScore, executiveSummary,
   *   topRecommendations : [{ name, matchScore }],
   *   topMentors         : [{ expertise, industries, matchScore }],
   *   resources          : [{ title, type, url }],
   *   builtAt
   * }
   */
  static async buildUserContext(userId, businessIdeaId = null) {
    // Validate userId – if invalid return an empty context rather than crash
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return ContextService._emptySnapshot();
    }

    const hasBusinessIdea =
      businessIdeaId && mongoose.isValidObjectId(businessIdeaId);

    // Run all independent context fetches in parallel.
    // Each helper swallows its own errors and returns safe defaults.
    const [assessment, recommendations, businessCtx, mentors, fundingCtx] =
      await Promise.all([
        ContextService.getAssessmentContext(userId),
        ContextService.getRecommendationContext(userId),
        hasBusinessIdea
          ? ContextService.getBusinessContext(businessIdeaId)
          : ContextService._emptyBusinessContext(),
        ContextService.getMentorContext(userId),
        ContextService.getFundingContext(userId),     // Sprint 5 Phase 4
      ]);

    // Flatten into the single snapshot shape stored in ChatSession
    return {
      // Assessment fields
      experienceLevel:  assessment.experienceLevel,
      assessmentScore:  assessment.assessmentScore,
      isAssessmentDone: assessment.isAssessmentDone,
      skills:           assessment.skills,
      interests:        assessment.interests,

      // Business idea fields (null-safe)
      businessIdeaName:     businessCtx.businessIdea?.name     ?? null,
      businessIdeaCategory: businessCtx.businessIdea?.category ?? null,
      startupCostRange:     businessCtx.businessIdea?.startupCostRange ?? null,
      difficultyLevel:      businessCtx.businessIdea?.difficultyLevel  ?? null,

      // Roadmap fields
      roadmapTimeline:   businessCtx.roadmap?.timeline     ?? null,
      milestoneCount:    businessCtx.roadmap?.milestones?.length ?? 0,
      missingSkillNames: businessCtx.roadmap?.missingSkillNames ?? [],

      // Business plan fields
      riskScore:        businessCtx.businessPlan?.riskScore         ?? null,
      executiveSummary: businessCtx.businessPlan?.executiveSummary  ?? null,

      // Recommendations
      topRecommendations: recommendations,

      // Mentors
      topMentors: mentors,

      // Resources
      resources: businessCtx.resources,

      // Sprint 5 Phase 4: Funding context
      fundingContext: fundingCtx,

      // Cache timestamp
      builtAt: new Date(),
    };
  }

  // ── Task 2 – Assessment context ────────────────────────────────────────────

  /**
   * Fetch the user's assessment, skills (populated), and interests (populated).
   * All three queries run in parallel.
   *
   * @param {ObjectId|string} userId
   * @returns {Promise<AssessmentContext>}
   * {
   *   experienceLevel : string,
   *   assessmentScore : number,
   *   isAssessmentDone: boolean,
   *   skills          : [{ name:string, proficiency:string }],
   *   interests       : [{ name:string, weight:number }],
   * }
   */
  static async getAssessmentContext(userId) {
    try {
      const [assessment, userSkills, userInterests] = await Promise.all([
        UserAssessment.findOne({ userId }).lean(),
        UserSkill.find({ userId })
          .populate({ path: 'skillId', select: 'name' })
          .lean(),
        UserInterest.find({ userId })
          .populate({ path: 'interestId', select: 'name' })
          .lean(),
      ]);

      // Normalise skills — guard against broken populate (null skillId)
      const skills = userSkills
        .filter((us) => us.skillId && us.skillId.name)
        .slice(0, MAX_SKILLS_IN_SNAPSHOT)
        .map((us) => ({
          name:        us.skillId.name,
          proficiency: us.proficiencyLevel,
        }));

      // Normalise interests
      const interests = userInterests
        .filter((ui) => ui.interestId && ui.interestId.name)
        .slice(0, MAX_INTERESTS_IN_SNAPSHOT)
        .map((ui) => ({
          name:   ui.interestId.name,
          weight: ui.preferenceWeight,
        }));

      return {
        experienceLevel:  assessment?.experienceLevel  ?? 'Beginner',
        assessmentScore:  assessment?.assessmentScore  ?? 0,
        isAssessmentDone: assessment?.isCompleted      ?? false,
        skills,
        interests,
      };
    } catch (err) {
      // Never crash the chat – return safe defaults
      console.error('[ContextService] getAssessmentContext error:', err.message);
      return {
        experienceLevel:  'Beginner',
        assessmentScore:  0,
        isAssessmentDone: false,
        skills:           [],
        interests:        [],
      };
    }
  }

  // ── Task 3 – Recommendation context ───────────────────────────────────────

  /**
   * Returns the top MAX_RECOMMENDATIONS matched business ideas for the user.
   * Reuses the existing recommendation engine — no duplicate scoring logic.
   *
   * @param {ObjectId|string} userId
   * @returns {Promise<Array<{ name:string, matchScore:number }>>}
   */
  static async getRecommendationContext(userId) {
    try {
      const all = await getRecommendationsForUser(userId);

      return all
        .slice(0, MAX_RECOMMENDATIONS)
        .map((r) => ({
          name:       r.businessIdea?.name ?? 'Unknown',
          matchScore: r.matchScore,
        }));
    } catch (err) {
      console.error('[ContextService] getRecommendationContext error:', err.message);
      return [];
    }
  }

  // ── Task 4 – Business context (idea + roadmap + plan + resources) ──────────

  /**
   * Fetches all data tied to a specific business idea.
   * BusinessIdea, Roadmap, BusinessPlan, and LearningResources are all
   * queried in parallel.
   *
   * @param {ObjectId|string} businessIdeaId
   * @returns {Promise<BusinessContext>}
   * {
   *   businessIdea : object | null,
   *   roadmap      : { timeline, milestones, missingSkillNames } | null,
   *   businessPlan : { riskScore, executiveSummary } | null,
   *   resources    : [{ title, type, url }],
   * }
   */
  static async getBusinessContext(businessIdeaId) {
    try {
      const [businessIdea, roadmap, businessPlan, resources] = await Promise.all([
        // ── Business idea ──────────────────────────────────────────────
        BusinessIdea.findById(businessIdeaId)
          .select('name category startupCostRange difficultyLevel estimatedMonthlyIncome tags')
          .lean(),

        // ── Roadmap – populate missingSkills.skillId for names ─────────
        Roadmap.findOne({ businessIdeaId })
          .populate({ path: 'missingSkills.skillId', select: 'name' })
          .lean(),

        // ── Business plan ──────────────────────────────────────────────
        BusinessPlan.findOne({ businessIdeaId })
          .select('riskScore executiveSummary targetMarket marketingStrategy')
          .lean(),

        // ── Learning resources (limit 5) ───────────────────────────────
        LearningResource.find({ businessIdeaId })
          .select('title type url')
          .limit(MAX_RESOURCES)
          .lean(),
      ]);

      // Normalise roadmap – extract missing skill names safely
      let normalizedRoadmap = null;
      if (roadmap) {
        const missingSkillNames = (roadmap.missingSkills || [])
          .filter((ms) => ms.skillId && ms.skillId.name)
          .map((ms) => ms.skillId.name);

        normalizedRoadmap = {
          timeline:         roadmap.timeline ?? null,
          milestones:       roadmap.milestones ?? [],
          missingSkillNames,
        };
      }

      // Normalise business plan – truncate executiveSummary for token budget
      let normalizedPlan = null;
      if (businessPlan) {
        normalizedPlan = {
          riskScore:       businessPlan.riskScore ?? null,
          executiveSummary: businessPlan.executiveSummary
            ? businessPlan.executiveSummary.slice(0, EXEC_SUMMARY_MAX_CHARS)
            : null,
        };
      }

      // Normalise resources
      const normalizedResources = (resources || []).map((r) => ({
        title: r.title,
        type:  r.type,
        url:   r.url,
      }));

      return {
        businessIdea:  businessIdea  ?? null,
        roadmap:       normalizedRoadmap,
        businessPlan:  normalizedPlan,
        resources:     normalizedResources,
      };
    } catch (err) {
      console.error('[ContextService] getBusinessContext error:', err.message);
      return ContextService._emptyBusinessContext();
    }
  }

  // ── Task 5 – Mentor context ────────────────────────────────────────────────

  /**
   * Returns the top MAX_MENTORS mentor matches for the user.
   * Reuses the existing mentorMatchService.
   *
   * @param {ObjectId|string} userId
   * @returns {Promise<Array<{ expertise:string[], industries:string[], matchScore:number }>>}
   */
  static async getMentorContext(userId) {
    try {
      const matches = await getMentorMatches(userId, MAX_MENTORS);

      return matches.map((m) => ({
        expertise:  m.mentor?.expertise  ?? [],
        industries: m.mentor?.industries ?? [],
        matchScore: m.matchScore,
      }));
    } catch (err) {
      // getMentorMatches throws 'User not found' if the user doc is missing —
      // return empty array rather than surfacing that to the chat layer.
      console.error('[ContextService] getMentorContext error:', err.message);
      return [];
    }
  }

  // ── Sprint 5 Phase 4 – Funding context ────────────────────────────────────

  /**
   * Returns a compact funding snapshot: top eligible schemes,
   * partially eligible schemes, and top funding recommendations.
   * Capped for prompt token budget.
   *
   * @param {ObjectId|string} userId
   * @returns {Promise<FundingContext>}
   * {
   *   eligibleSchemes           : [{ schemeName, score, type }],
   *   partiallyEligibleSchemes  : [{ schemeName, score, type }],
   *   topFundingRecommendations : [{ name, type, score, reasons }],
   * }
   */
  static async getFundingContext(userId) {
    const empty = {
      eligibleSchemes:           [],
      partiallyEligibleSchemes:  [],
      topFundingRecommendations: [],
    };

    try {
      const [eligibility, recommendations] = await Promise.all([
        EligibilityEngineService.evaluate(userId),
        FundingRecommendationService.recommend(userId),
      ]);

      return {
        eligibleSchemes: eligibility.eligibleSchemes
          .slice(0, MAX_FUNDING_ELIGIBLE)
          .map(({ schemeName, score, type }) => ({ schemeName, score, type })),

        partiallyEligibleSchemes: eligibility.partiallyEligibleSchemes
          .slice(0, MAX_FUNDING_ELIGIBLE)
          .map(({ schemeName, score, type }) => ({ schemeName, score, type })),

        topFundingRecommendations: recommendations.recommendations
          .slice(0, MAX_FUNDING_ELIGIBLE)
          .map(({ name, type, score, reasons }) => ({
            name,
            type,
            score,
            reasons: reasons.slice(0, 2), // keep it lean
          })),
      };
    } catch (err) {
      console.error('[ContextService] getFundingContext error:', err.message);
      return empty;
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /** Returns a safe all-empty snapshot (used when userId is invalid). */
  static _emptySnapshot() {
    return {
      experienceLevel:      'Beginner',
      assessmentScore:      0,
      isAssessmentDone:     false,
      skills:               [],
      interests:            [],
      businessIdeaName:     null,
      businessIdeaCategory: null,
      startupCostRange:     null,
      difficultyLevel:      null,
      roadmapTimeline:      null,
      milestoneCount:       0,
      missingSkillNames:    [],
      riskScore:            null,
      executiveSummary:     null,
      topRecommendations:   [],
      topMentors:           [],
      resources:            [],
      // Sprint 5 Phase 4
      fundingContext: {
        eligibleSchemes:           [],
        partiallyEligibleSchemes:  [],
        topFundingRecommendations: [],
      },
      builtAt:              new Date(),
    };
  }

  /** Returns a safe empty business context object. */
  static _emptyBusinessContext() {
    return {
      businessIdea: null,
      roadmap:      null,
      businessPlan: null,
      resources:    [],
    };
  }
}

module.exports = ContextService;
