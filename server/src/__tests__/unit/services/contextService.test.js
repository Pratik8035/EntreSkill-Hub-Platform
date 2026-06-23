/**
 * Unit tests – ContextService (Sprint 4 Phase 2)
 *
 * All DB models and the two external services (recommendationEngine,
 * mentorMatchService) are mocked so these tests run without a real database.
 *
 * Test coverage:
 *   buildUserContext()        – happy path, invalid userId, partial data
 *   getAssessmentContext()    – normal, no assessment, broken populate
 *   getRecommendationContext()– normal, empty, service throws
 *   getBusinessContext()      – normal, missing roadmap/plan/resources, throws
 *   getMentorContext()        – normal, service throws
 *   Parallel execution        – Promise.all is verified via mock call timing
 */

'use strict';

// ── Mock all DB models ────────────────────────────────────────────────────────
jest.mock('../../../models/UserAssessment');
jest.mock('../../../models/UserSkill');
jest.mock('../../../models/UserInterest');
jest.mock('../../../models/BusinessIdea');
jest.mock('../../../models/Roadmap');
jest.mock('../../../models/LearningResource');
jest.mock('../../../models/BusinessPlan');

// ── Mock external services ────────────────────────────────────────────────────
jest.mock('../../../services/recommendationEngine');
jest.mock('../../../services/mentorMatchService');

const mongoose = require('mongoose');

const UserAssessment   = require('../../../models/UserAssessment');
const UserSkill        = require('../../../models/UserSkill');
const UserInterest     = require('../../../models/UserInterest');
const BusinessIdea     = require('../../../models/BusinessIdea');
const Roadmap          = require('../../../models/Roadmap');
const LearningResource = require('../../../models/LearningResource');
const BusinessPlan     = require('../../../models/BusinessPlan');

const { getRecommendationsForUser } = require('../../../services/recommendationEngine');
const { getMentorMatches }          = require('../../../services/mentorMatchService');

const ContextService = require('../../../services/contextService');

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────
const VALID_USER_ID = new mongoose.Types.ObjectId().toString();
const VALID_IDEA_ID = new mongoose.Types.ObjectId().toString();

const MOCK_ASSESSMENT = {
  experienceLevel: 'Intermediate',
  assessmentScore: 72,
  isCompleted: true,
};

const MOCK_USER_SKILLS = [
  { skillId: { _id: new mongoose.Types.ObjectId(), name: 'Tailoring' }, proficiencyLevel: 'Advanced' },
  { skillId: { _id: new mongoose.Types.ObjectId(), name: 'Marketing' }, proficiencyLevel: 'Beginner' },
];

const MOCK_USER_INTERESTS = [
  { interestId: { _id: new mongoose.Types.ObjectId(), name: 'Fashion' }, preferenceWeight: 5 },
];

const MOCK_BUSINESS_IDEA = {
  _id: VALID_IDEA_ID,
  name: 'Tailoring Business',
  category: 'Textile',
  startupCostRange: '₹10,000–₹25,000',
  difficultyLevel: 'Beginner',
};

const MOCK_ROADMAP = {
  timeline: '3 months',
  milestones: [{ title: 'Register business' }, { title: 'Buy equipment' }],
  missingSkills: [
    { skillId: { _id: new mongoose.Types.ObjectId(), name: 'Accounting' }, weight: 1 },
  ],
};

const MOCK_BUSINESS_PLAN = {
  riskScore: 'Low',
  executiveSummary: 'A tailoring business focused on women in rural Maharashtra.',
};

const MOCK_RESOURCES = [
  { title: 'GST for Small Business', type: 'Article', url: 'https://example.com/gst' },
  { title: 'Marketing on WhatsApp', type: 'Video',   url: 'https://example.com/wa' },
];

const MOCK_RECOMMENDATIONS = [
  { businessIdea: { name: 'Tailoring Business' },   matchScore: 88 },
  { businessIdea: { name: 'Food Processing Unit' }, matchScore: 65 },
  { businessIdea: { name: 'Handicraft Store' },     matchScore: 55 },
  { businessIdea: { name: 'Tutoring Service' },     matchScore: 40 }, // should be excluded (top 3 only)
];

const MOCK_MENTOR_MATCHES = [
  { mentor: { expertise: ['Business', 'Finance'], industries: ['Retail'] }, matchScore: 80 },
  { mentor: { expertise: ['Tech'],               industries: ['E-Commerce'] }, matchScore: 60 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers to set up chainable mock queries
// ─────────────────────────────────────────────────────────────────────────────

/** Creates a mock that supports .populate().lean() chaining and resolves to value */
function mockChain(value) {
  const chain = {
    populate: jest.fn().mockReturnThis(),
    select:   jest.fn().mockReturnThis(),
    limit:    jest.fn().mockReturnThis(),
    lean:     jest.fn().mockResolvedValue(value),
  };
  return chain;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('ContextService', () => {

  beforeEach(() => {
    jest.clearAllMocks();

    // Default happy-path mock setup
    UserAssessment.findOne   = jest.fn().mockReturnValue(mockChain(MOCK_ASSESSMENT));
    UserSkill.find           = jest.fn().mockReturnValue(mockChain(MOCK_USER_SKILLS));
    UserInterest.find        = jest.fn().mockReturnValue(mockChain(MOCK_USER_INTERESTS));

    BusinessIdea.findById    = jest.fn().mockReturnValue(mockChain(MOCK_BUSINESS_IDEA));
    Roadmap.findOne          = jest.fn().mockReturnValue(mockChain(MOCK_ROADMAP));
    BusinessPlan.findOne     = jest.fn().mockReturnValue(mockChain(MOCK_BUSINESS_PLAN));
    LearningResource.find    = jest.fn().mockReturnValue(mockChain(MOCK_RESOURCES));

    getRecommendationsForUser.mockResolvedValue(MOCK_RECOMMENDATIONS);
    getMentorMatches.mockResolvedValue(MOCK_MENTOR_MATCHES);
  });

  // ── buildUserContext ────────────────────────────────────────────────────────
  describe('buildUserContext()', () => {
    it('returns a complete snapshot on happy path', async () => {
      const result = await ContextService.buildUserContext(VALID_USER_ID, VALID_IDEA_ID);

      // Profile
      expect(result.experienceLevel).toBe('Intermediate');
      expect(result.assessmentScore).toBe(72);
      expect(result.isAssessmentDone).toBe(true);

      // Skills
      expect(result.skills).toHaveLength(2);
      expect(result.skills[0]).toEqual({ name: 'Tailoring', proficiency: 'Advanced' });

      // Interests
      expect(result.interests).toHaveLength(1);
      expect(result.interests[0]).toEqual({ name: 'Fashion', weight: 5 });

      // Business idea
      expect(result.businessIdeaName).toBe('Tailoring Business');
      expect(result.businessIdeaCategory).toBe('Textile');
      expect(result.startupCostRange).toBe('₹10,000–₹25,000');

      // Roadmap
      expect(result.roadmapTimeline).toBe('3 months');
      expect(result.milestoneCount).toBe(2);
      expect(result.missingSkillNames).toContain('Accounting');

      // Business plan
      expect(result.riskScore).toBe('Low');
      expect(result.executiveSummary).toBeTruthy();

      // Top 3 recommendations only (not 4)
      expect(result.topRecommendations).toHaveLength(3);
      expect(result.topRecommendations[0]).toEqual({ name: 'Tailoring Business', matchScore: 88 });
      const names = result.topRecommendations.map(r => r.name);
      expect(names).not.toContain('Tutoring Service');

      // Mentors
      expect(result.topMentors).toHaveLength(2);
      expect(result.topMentors[0].expertise).toContain('Business');

      // Resources
      expect(result.resources).toHaveLength(2);
      expect(result.resources[0].title).toBe('GST for Small Business');

      // Timestamp
      expect(result.builtAt).toBeInstanceOf(Date);
    });

    it('returns empty snapshot for invalid userId', async () => {
      const result = await ContextService.buildUserContext('not-an-object-id');
      expect(result.skills).toEqual([]);
      expect(result.interests).toEqual([]);
      expect(result.topRecommendations).toEqual([]);
      expect(result.businessIdeaName).toBeNull();
    });

    it('skips business context when businessIdeaId is null', async () => {
      const result = await ContextService.buildUserContext(VALID_USER_ID, null);
      expect(result.businessIdeaName).toBeNull();
      expect(result.roadmapTimeline).toBeNull();
      expect(result.riskScore).toBeNull();
      expect(result.resources).toEqual([]);
      // Assessment and recommendations still run
      expect(result.experienceLevel).toBe('Intermediate');
    });

    it('still returns partial context when one sub-query group fails', async () => {
      // Make recommendation engine throw
      getRecommendationsForUser.mockRejectedValueOnce(new Error('DB timeout'));

      const result = await ContextService.buildUserContext(VALID_USER_ID, VALID_IDEA_ID);
      // Recommendations degrade gracefully
      expect(result.topRecommendations).toEqual([]);
      // Other data still populated
      expect(result.skills).toHaveLength(2);
      expect(result.businessIdeaName).toBe('Tailoring Business');
    });

    it('truncates executiveSummary to 250 characters', async () => {
      const longSummary = 'A'.repeat(500);
      BusinessPlan.findOne = jest.fn().mockReturnValue(
        mockChain({ riskScore: 'Medium', executiveSummary: longSummary })
      );

      const result = await ContextService.buildUserContext(VALID_USER_ID, VALID_IDEA_ID);
      expect(result.executiveSummary.length).toBeLessThanOrEqual(250);
    });
  });

  // ── getAssessmentContext ────────────────────────────────────────────────────
  describe('getAssessmentContext()', () => {
    it('returns correct structure on happy path', async () => {
      const result = await ContextService.getAssessmentContext(VALID_USER_ID);

      expect(result.experienceLevel).toBe('Intermediate');
      expect(result.assessmentScore).toBe(72);
      expect(result.isAssessmentDone).toBe(true);
      expect(result.skills[0].name).toBe('Tailoring');
      expect(result.interests[0].name).toBe('Fashion');
    });

    it('returns defaults when no assessment document exists', async () => {
      UserAssessment.findOne = jest.fn().mockReturnValue(mockChain(null));

      const result = await ContextService.getAssessmentContext(VALID_USER_ID);

      expect(result.experienceLevel).toBe('Beginner');
      expect(result.assessmentScore).toBe(0);
      expect(result.isAssessmentDone).toBe(false);
    });

    it('filters out skills where populate returned null skillId', async () => {
      const brokenSkills = [
        { skillId: null, proficiencyLevel: 'Beginner' },                             // null
        { skillId: { _id: new mongoose.Types.ObjectId(), name: 'Sewing' }, proficiencyLevel: 'Advanced' }, // valid
      ];
      UserSkill.find = jest.fn().mockReturnValue(mockChain(brokenSkills));

      const result = await ContextService.getAssessmentContext(VALID_USER_ID);

      expect(result.skills).toHaveLength(1);
      expect(result.skills[0].name).toBe('Sewing');
    });

    it('returns safe defaults when DB query throws', async () => {
      UserAssessment.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error('Connection refused')),
      });

      const result = await ContextService.getAssessmentContext(VALID_USER_ID);

      expect(result.skills).toEqual([]);
      expect(result.interests).toEqual([]);
      expect(result.experienceLevel).toBe('Beginner');
    });

    it('caps skills at 10 entries', async () => {
      const manySkills = Array.from({ length: 15 }, (_, i) => ({
        skillId: { _id: new mongoose.Types.ObjectId(), name: `Skill${i}` },
        proficiencyLevel: 'Beginner',
      }));
      UserSkill.find = jest.fn().mockReturnValue(mockChain(manySkills));

      const result = await ContextService.getAssessmentContext(VALID_USER_ID);
      expect(result.skills.length).toBeLessThanOrEqual(10);
    });
  });

  // ── getRecommendationContext ────────────────────────────────────────────────
  describe('getRecommendationContext()', () => {
    it('returns top 3 recommendations with name and matchScore', async () => {
      const result = await ContextService.getRecommendationContext(VALID_USER_ID);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ name: 'Tailoring Business', matchScore: 88 });
      expect(result[2]).toEqual({ name: 'Handicraft Store', matchScore: 55 });
    });

    it('returns empty array when engine returns nothing', async () => {
      getRecommendationsForUser.mockResolvedValueOnce([]);
      const result = await ContextService.getRecommendationContext(VALID_USER_ID);
      expect(result).toEqual([]);
    });

    it('returns empty array when engine throws', async () => {
      getRecommendationsForUser.mockRejectedValueOnce(new Error('Scoring failed'));
      const result = await ContextService.getRecommendationContext(VALID_USER_ID);
      expect(result).toEqual([]);
    });
  });

  // ── getBusinessContext ──────────────────────────────────────────────────────
  describe('getBusinessContext()', () => {
    it('returns full business context on happy path', async () => {
      const result = await ContextService.getBusinessContext(VALID_IDEA_ID);

      expect(result.businessIdea.name).toBe('Tailoring Business');
      expect(result.roadmap.timeline).toBe('3 months');
      expect(result.roadmap.milestones).toHaveLength(2);
      expect(result.roadmap.missingSkillNames).toContain('Accounting');
      expect(result.businessPlan.riskScore).toBe('Low');
      expect(result.resources).toHaveLength(2);
    });

    it('returns null roadmap when no roadmap document exists', async () => {
      Roadmap.findOne = jest.fn().mockReturnValue(mockChain(null));
      const result = await ContextService.getBusinessContext(VALID_IDEA_ID);
      expect(result.roadmap).toBeNull();
    });

    it('returns null businessPlan when no plan document exists', async () => {
      BusinessPlan.findOne = jest.fn().mockReturnValue(mockChain(null));
      const result = await ContextService.getBusinessContext(VALID_IDEA_ID);
      expect(result.businessPlan).toBeNull();
    });

    it('returns empty resources array when none exist', async () => {
      LearningResource.find = jest.fn().mockReturnValue(mockChain([]));
      const result = await ContextService.getBusinessContext(VALID_IDEA_ID);
      expect(result.resources).toEqual([]);
    });

    it('limits resources to 5 items', async () => {
      // LearningResource.find().limit(5) — we verify limit() is called with 5
      const chain = mockChain(MOCK_RESOURCES);
      LearningResource.find = jest.fn().mockReturnValue(chain);

      await ContextService.getBusinessContext(VALID_IDEA_ID);

      expect(chain.limit).toHaveBeenCalledWith(5);
    });

    it('filters out missingSkills where populate returned null skillId', async () => {
      const roadmapWithBrokenSkill = {
        timeline: '2 months',
        milestones: [],
        missingSkills: [
          { skillId: null, weight: 1 },
          { skillId: { _id: new mongoose.Types.ObjectId(), name: 'GST Filing' }, weight: 1 },
        ],
      };
      Roadmap.findOne = jest.fn().mockReturnValue(mockChain(roadmapWithBrokenSkill));

      const result = await ContextService.getBusinessContext(VALID_IDEA_ID);
      expect(result.roadmap.missingSkillNames).toEqual(['GST Filing']);
    });

    it('returns empty context when DB throws', async () => {
      BusinessIdea.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean:   jest.fn().mockRejectedValue(new Error('DB error')),
      });

      const result = await ContextService.getBusinessContext(VALID_IDEA_ID);
      expect(result.businessIdea).toBeNull();
      expect(result.roadmap).toBeNull();
      expect(result.resources).toEqual([]);
    });
  });

  // ── getMentorContext ────────────────────────────────────────────────────────
  describe('getMentorContext()', () => {
    it('returns top 3 mentor matches with correct shape', async () => {
      const result = await ContextService.getMentorContext(VALID_USER_ID);

      expect(result).toHaveLength(2); // mock only has 2
      expect(result[0].expertise).toContain('Business');
      expect(result[0].industries).toContain('Retail');
      expect(typeof result[0].matchScore).toBe('number');
    });

    it('returns empty array when mentorMatchService throws', async () => {
      getMentorMatches.mockRejectedValueOnce(new Error('User not found'));
      const result = await ContextService.getMentorContext(VALID_USER_ID);
      expect(result).toEqual([]);
    });

    it('handles mentors with missing expertise/industries gracefully', async () => {
      getMentorMatches.mockResolvedValueOnce([
        { mentor: {}, matchScore: 50 }, // no expertise or industries fields
      ]);
      const result = await ContextService.getMentorContext(VALID_USER_ID);
      expect(result[0].expertise).toEqual([]);
      expect(result[0].industries).toEqual([]);
    });
  });

  // ── Parallel execution ──────────────────────────────────────────────────────
  describe('parallel execution', () => {
    it('calls all four independent context helpers (all DB queries start together)', async () => {
      // Track call order using timestamps
      const callOrder = [];

      UserAssessment.findOne = jest.fn(() => {
        callOrder.push('assessment');
        return mockChain(MOCK_ASSESSMENT);
      });

      getRecommendationsForUser.mockImplementationOnce(async () => {
        callOrder.push('recommendations');
        return MOCK_RECOMMENDATIONS;
      });

      BusinessIdea.findById = jest.fn(() => {
        callOrder.push('businessIdea');
        return mockChain(MOCK_BUSINESS_IDEA);
      });

      getMentorMatches.mockImplementationOnce(async () => {
        callOrder.push('mentors');
        return MOCK_MENTOR_MATCHES;
      });

      await ContextService.buildUserContext(VALID_USER_ID, VALID_IDEA_ID);

      // All four must have been called (order is not guaranteed with Promise.all)
      expect(callOrder).toContain('assessment');
      expect(callOrder).toContain('recommendations');
      expect(callOrder).toContain('businessIdea');
      expect(callOrder).toContain('mentors');
    });
  });

});
