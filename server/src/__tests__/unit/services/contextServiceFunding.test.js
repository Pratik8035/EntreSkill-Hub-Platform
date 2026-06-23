'use strict';

/**
 * Unit Tests — ContextService.getFundingContext (Sprint 5 Phase 4)
 */

require('../../setup');
const mongoose       = require('mongoose');
const User           = require('../../../models/User');
const GovernmentScheme = require('../../../models/GovernmentScheme');
const FundingProgram   = require('../../../models/FundingProgram');
const ContextService   = require('../../../services/contextService');

async function createUser() {
  return User.create({
    name:    'CtxFunding Tester',
    email:   `ctxfund_${Date.now()}@test.com`,
    password:'hashedpwd',
    profile: { location: 'Delhi', skills: [] },
  });
}

async function seedCatalog() {
  await GovernmentScheme.insertMany([
    { name: 'PMEGP', category: 'Subsidy Loan', industry: 'All', state: 'All', isActive: true },
  ]);
  await FundingProgram.insertMany([
    { name: 'Micro Loan', fundingType: 'Loan', provider: 'MUDRA', industries: ['All'], isActive: true },
  ]);
}

describe('ContextService.getFundingContext', () => {
  it('returns three keys: eligibleSchemes, partiallyEligibleSchemes, topFundingRecommendations', async () => {
    const user = await createUser();
    await seedCatalog();

    const result = await ContextService.getFundingContext(user._id);

    expect(result).toHaveProperty('eligibleSchemes');
    expect(result).toHaveProperty('partiallyEligibleSchemes');
    expect(result).toHaveProperty('topFundingRecommendations');
    expect(Array.isArray(result.eligibleSchemes)).toBe(true);
    expect(Array.isArray(result.partiallyEligibleSchemes)).toBe(true);
    expect(Array.isArray(result.topFundingRecommendations)).toBe(true);
  });

  it('returns safe empty arrays for unknown userId', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const result = await ContextService.getFundingContext(fakeId);

    expect(result.eligibleSchemes).toHaveLength(0);
    expect(result.partiallyEligibleSchemes).toHaveLength(0);
    expect(result.topFundingRecommendations).toHaveLength(0);
  });

  it('eligible items have schemeName, score, type', async () => {
    const user = await createUser();
    await seedCatalog();

    const result = await ContextService.getFundingContext(user._id);
    const allItems = [...result.eligibleSchemes, ...result.partiallyEligibleSchemes];

    for (const item of allItems) {
      expect(item).toHaveProperty('schemeName');
      expect(item).toHaveProperty('score');
      expect(item).toHaveProperty('type');
    }
  });

  it('topFundingRecommendations items have name, type, score, reasons', async () => {
    const user = await createUser();
    await seedCatalog();

    const result = await ContextService.getFundingContext(user._id);

    for (const rec of result.topFundingRecommendations) {
      expect(rec).toHaveProperty('name');
      expect(rec).toHaveProperty('type');
      expect(rec).toHaveProperty('score');
      expect(rec).toHaveProperty('reasons');
    }
  });

  it('buildUserContext includes fundingContext field', async () => {
    const user = await createUser();
    await seedCatalog();

    const snapshot = await ContextService.buildUserContext(user._id, null);

    expect(snapshot).toHaveProperty('fundingContext');
    expect(snapshot.fundingContext).toHaveProperty('eligibleSchemes');
    expect(snapshot.fundingContext).toHaveProperty('partiallyEligibleSchemes');
    expect(snapshot.fundingContext).toHaveProperty('topFundingRecommendations');
  });
});
