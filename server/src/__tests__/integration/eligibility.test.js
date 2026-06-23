'use strict';

/**
 * Integration Tests — GET /api/funding/eligibility (Sprint 5 Phase 2)
 */

require('../setup');
const request          = require('supertest');

process.env.NODE_ENV           = 'test';
process.env.JWT_SECRET         = 'test-jwt-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.JWT_ACCESS_EXPIRES = '15m';
process.env.JWT_REFRESH_EXPIRES= '7d';

const app              = require('../../app');
const GovernmentScheme = require('../../models/GovernmentScheme');
const FundingProgram   = require('../../models/FundingProgram');

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function registerAndGetToken(suffix = '') {
  const email = `eligtest_${Date.now()}${suffix}@test.com`;
  const res = await request(app).post('/api/auth/register').send({
    name: 'Eligibility User', email, password: 'password123',
  });
  return res.body.data.token;
}

async function seedCatalog() {
  await GovernmentScheme.insertMany([
    { name: 'PMEGP',      category: 'Subsidy Loan', state: 'All', industry: 'All', isActive: true },
    { name: 'Mudra Loan', category: 'Loan',         state: 'All', industry: 'All', isActive: true },
  ]);
  await FundingProgram.insertMany([
    { name: 'Micro Loan', fundingType: 'Loan', provider: 'MUDRA', industries: ['All'], isActive: true },
  ]);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GET /api/funding/eligibility', () => {
  let token;

  beforeEach(async () => {
    token = await registerAndGetToken();
    await seedCatalog();
  });

  it('returns 200 with three eligibility buckets', async () => {
    const res = await request(app)
      .get('/api/funding/eligibility')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('eligibleSchemes');
    expect(res.body.data).toHaveProperty('partiallyEligibleSchemes');
    expect(res.body.data).toHaveProperty('notEligibleSchemes');
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/funding/eligibility');
    expect(res.status).toBe(401);
  });

  it('each item in any bucket has the required shape', async () => {
    const res = await request(app)
      .get('/api/funding/eligibility')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const { eligibleSchemes, partiallyEligibleSchemes, notEligibleSchemes } = res.body.data;
    const all = [...eligibleSchemes, ...partiallyEligibleSchemes, ...notEligibleSchemes];

    for (const item of all) {
      expect(item).toHaveProperty('schemeName');
      expect(item).toHaveProperty('type');
      expect(item).toHaveProperty('eligible');
      expect(item).toHaveProperty('score');
      expect(item).toHaveProperty('reasons');
      expect(item).toHaveProperty('missingRequirements');
    }
  });

  it('all items across all buckets are from the active catalog', async () => {
    const res = await request(app)
      .get('/api/funding/eligibility')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const { eligibleSchemes, partiallyEligibleSchemes, notEligibleSchemes } = res.body.data;
    const allNames = [...eligibleSchemes, ...partiallyEligibleSchemes, ...notEligibleSchemes]
      .map((i) => i.schemeName);

    // All seeded items should appear somewhere
    expect(allNames).toContain('PMEGP');
    expect(allNames).toContain('Mudra Loan');
    expect(allNames).toContain('Micro Loan');
  });

  it('does not crash when user has no assessment or business plan', async () => {
    // Fresh user with no assessment/plan data
    const freshToken = await registerAndGetToken('_bare');
    const res = await request(app)
      .get('/api/funding/eligibility')
      .set('Authorization', `Bearer ${freshToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns empty buckets when no active catalog exists', async () => {
    // Clear catalog seeded in beforeEach
    await GovernmentScheme.deleteMany({});
    await FundingProgram.deleteMany({});

    const res = await request(app)
      .get('/api/funding/eligibility')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const total = res.body.data.eligibleSchemes.length +
                  res.body.data.partiallyEligibleSchemes.length +
                  res.body.data.notEligibleSchemes.length;
    expect(total).toBe(0);
  });
});
