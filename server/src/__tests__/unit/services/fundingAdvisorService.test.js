'use strict';

/**
 * Unit Tests — FundingAdvisorService (Sprint 5 Phase 4)
 */

require('../../setup');
const mongoose               = require('mongoose');
const User                   = require('../../../models/User');
const GovernmentScheme       = require('../../../models/GovernmentScheme');
const FundingProgram         = require('../../../models/FundingProgram');
const FundingAdvisorService  = require('../../../services/fundingAdvisorService');

// Mock the AI provider so tests are fast and deterministic
jest.mock('../../../providers/providerFactory', () => ({
  create: () => ({
    generate: jest.fn().mockResolvedValue({
      content: 'Mocked AI advisor summary text.',
      tokens: 50,
    }),
  }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function createUser() {
  return User.create({
    name:    'Advisor Tester',
    email:   `advisortest_${Date.now()}@test.com`,
    password:'hashedpwd',
    profile: { location: 'Delhi', skills: [] },
  });
}

async function seedCatalog() {
  await GovernmentScheme.insertMany([
    { name: 'PMEGP',      category: 'Subsidy Loan', industry: 'All', state: 'All', isActive: true },
    { name: 'Mudra Loan', category: 'Loan',         industry: 'All', state: 'All', isActive: true },
  ]);
  await FundingProgram.insertMany([
    { name: 'Micro Loan', fundingType: 'Loan', provider: 'MUDRA', industries: ['All'], isActive: true },
  ]);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FundingAdvisorService.getAdvisorSummary', () => {
  it('returns eligibility, recommendations, and advisorSummary', async () => {
    const user = await createUser();
    await seedCatalog();

    const result = await FundingAdvisorService.getAdvisorSummary(user._id, user);

    expect(result).toHaveProperty('eligibility');
    expect(result).toHaveProperty('recommendations');
    expect(result).toHaveProperty('advisorSummary');
    expect(typeof result.advisorSummary).toBe('string');
    expect(result.advisorSummary.length).toBeGreaterThan(0);
  });

  it('eligibility has three bucket arrays', async () => {
    const user = await createUser();
    await seedCatalog();

    const result = await FundingAdvisorService.getAdvisorSummary(user._id, user);

    expect(result.eligibility).toHaveProperty('eligibleSchemes');
    expect(result.eligibility).toHaveProperty('partiallyEligibleSchemes');
    expect(result.eligibility).toHaveProperty('notEligibleSchemes');
  });

  it('recommendations has recommendations array and totalMatches', async () => {
    const user = await createUser();
    await seedCatalog();

    const result = await FundingAdvisorService.getAdvisorSummary(user._id, user);

    expect(result.recommendations).toHaveProperty('recommendations');
    expect(result.recommendations).toHaveProperty('totalMatches');
    expect(Array.isArray(result.recommendations.recommendations)).toBe(true);
  });

  it('returns AI-generated summary when provider succeeds', async () => {
    const user = await createUser();
    await seedCatalog();

    const result = await FundingAdvisorService.getAdvisorSummary(user._id, user);

    expect(result.advisorSummary).toBe('Mocked AI advisor summary text.');
  });

  it('returns fallback summary when no catalog exists', async () => {
    const user = await createUser();
    // No catalog seeded

    const result = await FundingAdvisorService.getAdvisorSummary(user._id, user);

    expect(typeof result.advisorSummary).toBe('string');
    expect(result.advisorSummary.length).toBeGreaterThan(0);
  });

  it('does not throw for unknown userId', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await seedCatalog();

    await expect(
      FundingAdvisorService.getAdvisorSummary(fakeId, null)
    ).resolves.toBeDefined();
  });
});
