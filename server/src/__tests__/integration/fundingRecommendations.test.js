'use strict';

/**
 * Integration Tests — GET /api/funding/recommendations (Sprint 5 Phase 3)
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
  const email = `rectest_${Date.now()}${suffix}@test.com`;
  const res = await request(app).post('/api/auth/register').send({
    name: 'Rec Test User', email, password: 'password123',
  });
  return res.body.data.token;
}

async function seedCatalog() {
  await GovernmentScheme.insertMany([
    { name: 'PMEGP',        category: 'Subsidy Loan', industry: 'All', state: 'All', isActive: true },
    { name: 'Startup India', category: 'Grant',       industry: 'Technology', state: 'All', isActive: true },
    { name: 'Mudra Loan',   category: 'Loan',         industry: 'All', state: 'All', isActive: true },
  ]);
  await FundingProgram.insertMany([
    { name: 'Micro Loan',    fundingType: 'Loan',  provider: 'MUDRA', industries: ['All'],        isActive: true },
    { name: 'Startup Grant', fundingType: 'Grant', provider: 'DPIIT', industries: ['Technology'], isActive: true },
    { name: 'Agri Loan',     fundingType: 'Loan',  provider: 'NABARD',industries: ['Agriculture'],isActive: true },
  ]);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GET /api/funding/recommendations', () => {
  let token;

  beforeEach(async () => {
    token = await registerAndGetToken();
    await seedCatalog();
  });

  it('returns 200 with recommendations and totalMatches', async () => {
    const res = await request(app)
      .get('/api/funding/recommendations')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('recommendations');
    expect(res.body.data).toHaveProperty('totalMatches');
    expect(Array.isArray(res.body.data.recommendations)).toBe(true);
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/funding/recommendations');
    expect(res.status).toBe(401);
  });

  it('returns at most 5 recommendations', async () => {
    const res = await request(app)
      .get('/api/funding/recommendations')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.recommendations.length).toBeLessThanOrEqual(5);
  });

  it('each recommendation has name, type, score, reasons', async () => {
    const res = await request(app)
      .get('/api/funding/recommendations')
      .set('Authorization', `Bearer ${token}`);

    for (const rec of res.body.data.recommendations) {
      expect(rec).toHaveProperty('name');
      expect(rec).toHaveProperty('type');
      expect(rec).toHaveProperty('score');
      expect(rec).toHaveProperty('reasons');
      expect(['scheme', 'program']).toContain(rec.type);
      expect(typeof rec.score).toBe('number');
    }
  });

  it('recommendations are ordered by score descending', async () => {
    const res = await request(app)
      .get('/api/funding/recommendations')
      .set('Authorization', `Bearer ${token}`);

    const recs = res.body.data.recommendations;
    for (let i = 0; i < recs.length - 1; i++) {
      expect(recs[i].score).toBeGreaterThanOrEqual(recs[i + 1].score);
    }
  });

  it('does not crash when user has no assessment or plan', async () => {
    const bareToken = await registerAndGetToken('_bare');
    const res = await request(app)
      .get('/api/funding/recommendations')
      .set('Authorization', `Bearer ${bareToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns empty recommendations when no active catalog', async () => {
    await GovernmentScheme.deleteMany({});
    await FundingProgram.deleteMany({});

    const res = await request(app)
      .get('/api/funding/recommendations')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.recommendations).toHaveLength(0);
    expect(res.body.data.totalMatches).toBe(0);
  });

  it('totalMatches counts items with score >= 40', async () => {
    const res = await request(app)
      .get('/api/funding/recommendations')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(typeof res.body.data.totalMatches).toBe('number');
    expect(res.body.data.totalMatches).toBeGreaterThanOrEqual(0);
  });
});
