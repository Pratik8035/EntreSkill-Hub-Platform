'use strict';

/**
 * Unit Tests — EligibilityEngineService (Sprint 5 Phase 2)
 */

require('../../setup');
const mongoose             = require('mongoose');
const User                 = require('../../../models/User');
const UserAssessment       = require('../../../models/UserAssessment');
const BusinessPlan         = require('../../../models/BusinessPlan');
const BusinessIdea         = require('../../../models/BusinessIdea');
const GovernmentScheme     = require('../../../models/GovernmentScheme');
const FundingProgram       = require('../../../models/FundingProgram');
const EligibilityEngineService = require('../../../services/eligibilityEngineService');

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function createUser(overrides = {}) {
  return User.create({
    name:     'Eligibility Tester',
    email:    `eligtest_${Date.now()}@test.com`,
    password: 'hashedpassword',
    profile:  { location: 'Maharashtra', skills: ['Sewing'] },
    ...overrides,
  });
}

async function createAssessment(userId, overrides = {}) {
  return UserAssessment.create({
    userId,
    experienceLevel: 'Beginner',
    assessmentScore: 60,
    isCompleted: true,
    ...overrides,
  });
}

async function createBusinessIdeaAndPlan(overrides = {}) {
  const idea = await BusinessIdea.create({
    name: 'Test Boutique',
    description: 'Fashion boutique',
    category: 'Tailoring & Fashion',
    difficultyLevel: 'Beginner',
    startupCostRange: '$300-$800',
    estimatedMonthlyIncome: '$1500',
    ...overrides.idea,
  });
  const plan = await BusinessPlan.create({
    businessIdeaId: idea._id,
    executiveSummary: 'A local boutique.',
    targetMarket: 'Women aged 18-40',
    marketingStrategy: 'Social media',
    operationsPlan: 'Home-based',
    financialPlan: 'Bootstrap',
    riskScore: 'Low',
    ...overrides.plan,
  });
  return { idea, plan };
}

async function createScheme(overrides = {}) {
  return GovernmentScheme.create({
    name:     'PMEGP',
    category: 'Subsidy Loan',
    provider: 'KVIC',
    state:    'All',
    industry: 'All',
    isActive: true,
    ...overrides,
  });
}

async function createProgram(overrides = {}) {
  return FundingProgram.create({
    name:        'Micro Loan',
    fundingType: 'Loan',
    provider:    'MUDRA',
    industries:  ['All'],
    isActive:    true,
    ...overrides,
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('EligibilityEngineService.evaluate', () => {
  it('returns three bucket arrays in the response', async () => {
    const user = await createUser();
    await createScheme();

    const result = await EligibilityEngineService.evaluate(user._id);

    expect(result).toHaveProperty('eligibleSchemes');
    expect(result).toHaveProperty('partiallyEligibleSchemes');
    expect(result).toHaveProperty('notEligibleSchemes');
    expect(Array.isArray(result.eligibleSchemes)).toBe(true);
    expect(Array.isArray(result.partiallyEligibleSchemes)).toBe(true);
    expect(Array.isArray(result.notEligibleSchemes)).toBe(true);
  });

  it('returns safe defaults when no user data exists', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await createScheme();

    const result = await EligibilityEngineService.evaluate(fakeId);

    expect(result).toHaveProperty('eligibleSchemes');
    // Should not throw — buckets may be empty or populated
    const total = result.eligibleSchemes.length +
                  result.partiallyEligibleSchemes.length +
                  result.notEligibleSchemes.length;
    expect(total).toBeGreaterThanOrEqual(0);
  });

  it('each result item has required shape fields', async () => {
    const user = await createUser();
    await createScheme({ name: 'Stand-Up India' });

    const result = await EligibilityEngineService.evaluate(user._id);
    const allItems = [
      ...result.eligibleSchemes,
      ...result.partiallyEligibleSchemes,
      ...result.notEligibleSchemes,
    ];

    expect(allItems.length).toBeGreaterThan(0);
    for (const item of allItems) {
      expect(item).toHaveProperty('schemeName');
      expect(item).toHaveProperty('type');
      expect(item).toHaveProperty('eligible');
      expect(item).toHaveProperty('score');
      expect(item).toHaveProperty('reasons');
      expect(item).toHaveProperty('missingRequirements');
      expect(typeof item.score).toBe('number');
      expect(item.score).toBeGreaterThanOrEqual(0);
      expect(item.score).toBeLessThanOrEqual(100);
    }
  });

  it('scheme type is tagged correctly', async () => {
    const user = await createUser();
    await createScheme({ name: 'Mudra Loan' });

    const result = await EligibilityEngineService.evaluate(user._id);
    const all = [
      ...result.eligibleSchemes,
      ...result.partiallyEligibleSchemes,
      ...result.notEligibleSchemes,
    ];
    const schemeItems = all.filter((i) => i.type === 'scheme');
    expect(schemeItems.length).toBe(1);
    expect(schemeItems[0].schemeName).toBe('Mudra Loan');
  });

  it('program type is tagged correctly', async () => {
    const user = await createUser();
    await createProgram({ name: 'Small Business Loan' });

    const result = await EligibilityEngineService.evaluate(user._id);
    const all = [
      ...result.eligibleSchemes,
      ...result.partiallyEligibleSchemes,
      ...result.notEligibleSchemes,
    ];
    const programItems = all.filter((i) => i.type === 'program');
    expect(programItems.length).toBe(1);
    expect(programItems[0].schemeName).toBe('Small Business Loan');
  });

  it('higher score when user has completed assessment and business plan', async () => {
    const user = await createUser();
    await createAssessment(user._id, { isCompleted: true, assessmentScore: 80 });
    await createBusinessIdeaAndPlan();

    const schemeA = await createScheme({ name: 'PMEGP National' });

    const result = await EligibilityEngineService.evaluate(user._id);
    const all = [
      ...result.eligibleSchemes,
      ...result.partiallyEligibleSchemes,
      ...result.notEligibleSchemes,
    ];
    const item = all.find((i) => i.schemeName === 'PMEGP National');
    expect(item).toBeDefined();
    expect(item.score).toBeGreaterThan(40);
  });

  it('items in eligibleSchemes have eligible=true', async () => {
    const user = await createUser();
    await createAssessment(user._id, { isCompleted: true, assessmentScore: 90 });
    await createBusinessIdeaAndPlan();
    await createScheme({ name: 'Startup India' });

    const result = await EligibilityEngineService.evaluate(user._id);
    for (const item of result.eligibleSchemes) {
      expect(item.eligible).toBe(true);
    }
  });

  it('items outside eligible bucket have eligible=false', async () => {
    const user = await createUser();
    await createScheme({ name: 'Stand-Up India' });

    const result = await EligibilityEngineService.evaluate(user._id);
    for (const item of [...result.partiallyEligibleSchemes, ...result.notEligibleSchemes]) {
      expect(item.eligible).toBe(false);
    }
  });

  it('skips inactive schemes', async () => {
    const user = await createUser();
    await createScheme({ name: 'Inactive Scheme', isActive: false });

    const result = await EligibilityEngineService.evaluate(user._id);
    const all = [
      ...result.eligibleSchemes,
      ...result.partiallyEligibleSchemes,
      ...result.notEligibleSchemes,
    ];
    expect(all.find((i) => i.schemeName === 'Inactive Scheme')).toBeUndefined();
  });

  it('returns empty buckets when no active schemes exist', async () => {
    const user = await createUser();
    const result = await EligibilityEngineService.evaluate(user._id);
    const total = result.eligibleSchemes.length +
                  result.partiallyEligibleSchemes.length +
                  result.notEligibleSchemes.length;
    expect(total).toBe(0);
  });
});
