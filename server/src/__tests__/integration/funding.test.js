'use strict';

/**
 * Integration Tests — Funding API (Sprint 5 Phase 1)
 * GET /api/funding
 * GET /api/funding/:id
 */

require('../setup');
const request = require('supertest');

process.env.NODE_ENV           = 'test';
process.env.JWT_SECRET         = 'test-jwt-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.JWT_ACCESS_EXPIRES = '15m';
process.env.JWT_REFRESH_EXPIRES= '7d';

const app            = require('../../app');
const FundingProgram = require('../../models/FundingProgram');

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAuthToken() {
  const email = `fundingtest_${Date.now()}@test.com`;
  const reg = await request(app).post('/api/auth/register').send({
    name: 'Funding Tester', email, password: 'password123',
  });
  return reg.body.data.token;
}

async function seedPrograms() {
  return FundingProgram.insertMany([
    { name: 'Micro Loan',        fundingType: 'Loan',  provider: 'MUDRA',   minAmount: 5000,   maxAmount: 50000,   isActive: true,  industries: ['All'] },
    { name: 'Small Business Loan', fundingType: 'Loan', provider: 'SBI',    minAmount: 50000,  maxAmount: 2500000, isActive: true,  industries: ['Retail'] },
    { name: 'Startup Grant',     fundingType: 'Grant', provider: 'DPIIT',   minAmount: 100000, maxAmount: 2000000, isActive: false, industries: ['Technology'] },
  ]);
}

// ─── GET /api/funding ─────────────────────────────────────────────────────────

describe('GET /api/funding', () => {
  let token;

  beforeEach(async () => {
    token = await getAuthToken();
    await seedPrograms();
  });

  it('returns 200 with paginated programs', async () => {
    const res = await request(app)
      .get('/api/funding')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.programs).toBeInstanceOf(Array);
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.pagination).toHaveProperty('total');
    expect(res.body.data.pagination).toHaveProperty('page');
    expect(res.body.data.pagination).toHaveProperty('limit');
    expect(res.body.data.pagination).toHaveProperty('totalPages');
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/funding');
    expect(res.status).toBe(401);
  });

  it('filters by fundingType query param', async () => {
    const res = await request(app)
      .get('/api/funding?fundingType=Grant')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    // Startup Grant is inactive but fundingType filter doesn't filter by isActive
    expect(res.body.data.programs.every((p) => p.fundingType === 'Grant')).toBe(true);
  });

  it('filters by provider query param', async () => {
    const res = await request(app)
      .get('/api/funding?provider=SBI')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.programs.length).toBe(1);
    expect(res.body.data.programs[0].name).toBe('Small Business Loan');
  });

  it('filters by isActive=true', async () => {
    const res = await request(app)
      .get('/api/funding?isActive=true')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.programs.every((p) => p.isActive === true)).toBe(true);
    expect(res.body.data.programs.length).toBe(2);
  });

  it('respects page and limit pagination params', async () => {
    const res = await request(app)
      .get('/api/funding?page=1&limit=2')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.programs.length).toBeLessThanOrEqual(2);
    expect(res.body.data.pagination.limit).toBe(2);
  });

  it('returns 400 for invalid fundingType', async () => {
    const res = await request(app)
      .get('/api/funding?fundingType=InvalidType')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});

// ─── GET /api/funding/:id ─────────────────────────────────────────────────────

describe('GET /api/funding/:id', () => {
  let token;
  let program;

  beforeEach(async () => {
    token   = await getAuthToken();
    [program] = await seedPrograms();
  });

  it('returns 200 with program data for valid id', async () => {
    const res = await request(app)
      .get(`/api/funding/${program._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Micro Loan');
  });

  it('returns 404 for non-existent id', async () => {
    const fakeId = '64f1234567890abcde123456';
    const res = await request(app)
      .get(`/api/funding/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for invalid ObjectId format', async () => {
    const res = await request(app)
      .get('/api/funding/not-valid-id')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get(`/api/funding/${program._id}`);
    expect(res.status).toBe(401);
  });
});
