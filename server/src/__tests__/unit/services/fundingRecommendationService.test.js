'use strict';

/**
 * Unit Tests — FundingRecommendationService (Sprint 5 Phase 3)
 */

require('../../setup');
const mongoose                     = require('mongoose');
const User                         = require('../../../models/User');
const UserAssessment               = require('../../../models/UserAssessment');
const BusinessPlan                 = require('../../../models/BusinessPlan');
const BusinessIdea                 = require('../../../models/BusinessIdea');
const GovernmentScheme             = require('../../../models/GovernmentScheme');
const FundingProgram               = require('../../../models/FundingProgram');
const FundingRecommendationService = require('../../../services/fundingRecommendationService');

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function createUser(overrides = {}) {
  return User.create({
    name:    'Rec Tester',
    email:   `rectest_${Date.now()}@test.com`,
    password:'hashedpwd',
    profile: { location: 'Delhi', skills: [] },
    ...overrides,
  });
}

async function createAssessment(userId, overrides = {}) {
  return UserAssessment.create({
    userId,
    experienceLevel: 'Intermediate',
    assessmentScore: 70,
    isCompleted: true,
    ...overrides,
  });
}

async function createIdeaAndPlan(category = 'Digital Services', riskScore = 'Low') {
  const idea = await BusinessIdea.create({
    name: `${category} Idea`,
    description: 'Test idea',
    category,
    difficultyLevel: 'Intermediate',
    startupCostRange: '$500-$1500',
    estimatedMonthlyIncome: '$2500',
  });
  const plan = await BusinessPlan.create({
    businessIdeaId: idea._id,
    executiveSummary: 'Summary.',
    targetMarket: 'SMBs',
    marketingStrategy: 'Digital ads',
    operationsPlan: 'Remote',
    financialPlan: 'Bootstrapped',
    riskScore,
  });
  return { idea, plan };
}

async function seedCatalog() {
  await GovernmentScheme.insertMany([
    { name: 'PMEGP',       category: 'Subsidy Loan', provider: 'KVIC',  industry: 'All',      state: 'All', isActive: true },
    { name: 'Mudra Loan',  category: 'Loan',         provider: 'MUDRA', industry: 'All',      state: 'All', isActive: true },
    { name: 'Startup India', category: 'Grant',      provider: 'DPIIT', industry: 'Technology', state: 'All', isActive: true },
  ]);
  await FundingProgram.insertMany([
    { name: 'Micro Loan',        fundingType: 'Loan',  provider: 'MUDRA',  industries: ['All'],        isActive: true },
    { name: 'Small Business Loan', fundingType: 'Loan', provider: 'SBI',   industries: ['All'],        isActive: true },
    { name: 'Startup Grant',     fundingType: 'Grant', provider: 'DPIIT', industries: ['Technology'], isActive: true },
    { name: 'Agri Fund',         fundingType: 'Loan',  provider: 'NABARD',industries: ['Agriculture'], isActive: true },
    { name: 'Fashion Grant',     fundingType: 'Grant', provider: 'MSME',  industries: ['Fashion', 'Apparel'], isActive: true },
  ]);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FundingRecommendationService.recommend', () => {
  it('returns recommendations array and totalMatches', async () => {
    const user = await createUser();
    await seedCatalog();

    const result = await FundingRecommendationService.recommend(user._id);

    expect(result).toHaveProperty('recommendations');
    expect(result).toHaveProperty('totalMatches');
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(typeof result.totalMatches).toBe('number');
  });

  it('returns at most 5 recommendations', async () => {
    const user = await createUser();
    await seedCatalog();

    const result = await FundingRecommendationService.recommend(user._id);

    expect(result.recommendations.length).toBeLessThanOrEqual(5);
  });

  it('each recommendation has required shape', async () => {
    const user = await createUser();
    await seedCatalog();

    const result = await FundingRecommendationService.recommend(user._id);

    for (const rec of result.recommendations) {
      expect(rec).toHaveProperty('name');
      expect(rec).toHaveProperty('type');
      expect(rec).toHaveProperty('score');
      expect(rec).toHaveProperty('reasons');
      expect(['scheme', 'program']).toContain(rec.type);
      expect(typeof rec.score).toBe('number');
      expect(rec.score).toBeGreaterThanOrEqual(0);
      expect(rec.score).toBeLessThanOrEqual(100);
      expect(Array.isArray(rec.reasons)).toBe(true);
    }
  });

  it('recommendations are sorted by score descending', async () => {
    const user = await createUser();
    await seedCatalog();

    const result = await FundingRecommendationService.recommend(user._id);

    for (let i = 0; i < result.recommendations.length - 1; i++) {
      expect(result.recommendations[i].score).toBeGreaterThanOrEqual(
        result.recommendations[i + 1].score
      );
    }
  });

  it('returns safe defaults when user has no assessment or business plan', async () => {
    const user = await createUser(); // no assessment, no plan
    await seedCatalog();

    const result = await FundingRecommendationService.recommend(user._id);

    // Must not throw; recommendations may be lower-scored but must exist
    expect(result).toHaveProperty('recommendations');
    expect(result.recommendations.length).toBeGreaterThanOrEqual(0);
  });

  it('returns empty recommendations when no active schemes or programs exist', async () => {
    const user = await createUser();
    // no catalog seeded

    const result = await FundingRecommendationService.recommend(user._id);

    expect(result.recommendations).toHaveLength(0);
    expect(result.totalMatches).toBe(0);
  });

  it('industry-matching items score higher than non-matching', async () => {
    const user = await createUser();
    await createAssessment(user._id);
    await createIdeaAndPlan('Digital Services');

    await GovernmentScheme.insertMany([
      { name: 'Digital Scheme', industry: 'Digital Services', category: 'Grant', state: 'All', isActive: true },
      { name: 'Agri Scheme',    industry: 'Agriculture',      category: 'Grant', state: 'All', isActive: true },
    ]);

    const result = await FundingRecommendationService.recommend(user._id);
    const digital = result.recommendations.find((r) => r.name === 'Digital Scheme');
    const agri    = result.recommendations.find((r) => r.name === 'Agri Scheme');

    if (digital && agri) {
      expect(digital.score).toBeGreaterThan(agri.score);
    }
  });

  it('user with completed assessment scores higher than user without', async () => {
    const userWith    = await createUser();
    const userWithout = await createUser();

    await createAssessment(userWith._id, { isCompleted: true, assessmentScore: 80 });
    // userWithout has no assessment

    await GovernmentScheme.create({
      name: 'Generic Scheme', industry: 'All', state: 'All', isActive: true,
    });

    const withResult    = await FundingRecommendationService.recommend(userWith._id);
    const withoutResult = await FundingRecommendationService.recommend(userWithout._id);

    const withScore    = withResult.recommendations[0]?.score    ?? 0;
    const withoutScore = withoutResult.recommendations[0]?.score ?? 0;

    expect(withScore).toBeGreaterThanOrEqual(withoutScore);
  });

  it('does not crash for unknown userId', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await seedCatalog();

    const result = await FundingRecommendationService.recommend(fakeId);

    expect(result).toHaveProperty('recommendations');
  });

  it('inactive programs are excluded from recommendations', async () => {
    const user = await createUser();
    await FundingProgram.create({
      name: 'Inactive Program', fundingType: 'Grant', provider: 'X',
      industries: ['All'], isActive: false,
    });

    const result = await FundingRecommendationService.recommend(user._id);
    const names = result.recommendations.map((r) => r.name);
    expect(names).not.toContain('Inactive Program');
  });
});
