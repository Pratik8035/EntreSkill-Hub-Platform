'use strict';

/**
 * Integration Tests — GET /api/funding/advisor (Sprint 5 Phase 4)
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

// Mock AI provider at the integration level
jest.mock('../../providers/providerFactory', () => ({
  create: () => ({
    generate: jest.fn().mockResolvedValue({
      content: 'Integration test advisor summary.',
      tokens: 40,
    }),
  }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function registerAndGetToken() {
  const email = `advisorInt_${Date.now()}@test.com`;
  const res = await request(app).post('/api/auth/register').send({
    name: 'Advisor Int User', email, password: 'password123',
  });
  return res.body.data.token;
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

describe('GET /api/funding/advisor', () => {
  let token;

  beforeEach(async () => {
    token = await registerAndGetToken();
    await seedCatalog();
  });

  it('returns 200 with eligibility, recommendations, advisorSummary', async () => {
    const res = await request(app)
      .get('/api/funding/advisor')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('eligibility');
    expect(res.body.data).toHaveProperty('recommendations');
    expect(res.body.data).toHaveProperty('advisorSummary');
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/funding/advisor');
    expect(res.status).toBe(401);
  });

  it('advisorSummary is a non-empty string', async () => {
    const res = await request(app)
      .get('/api/funding/advisor')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(typeof res.body.data.advisorSummary).toBe('string');
    expect(res.body.data.advisorSummary.length).toBeGreaterThan(0);
  });

  it('eligibility buckets are present', async () => {
    const res = await request(app)
      .get('/api/funding/advisor')
      .set('Authorization', `Bearer ${token}`);

    const { eligibility } = res.body.data;
    expect(eligibility).toHaveProperty('eligibleSchemes');
    expect(eligibility).toHaveProperty('partiallyEligibleSchemes');
    expect(eligibility).toHaveProperty('notEligibleSchemes');
  });

  it('recommendations object has required shape', async () => {
    const res = await request(app)
      .get('/api/funding/advisor')
      .set('Authorization', `Bearer ${token}`);

    const { recommendations } = res.body.data;
    expect(recommendations).toHaveProperty('recommendations');
    expect(recommendations).toHaveProperty('totalMatches');
    expect(Array.isArray(recommendations.recommendations)).toBe(true);
  });

  it('does not crash when catalog is empty', async () => {
    await GovernmentScheme.deleteMany({});
    await FundingProgram.deleteMany({});

    const res = await request(app)
      .get('/api/funding/advisor')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
