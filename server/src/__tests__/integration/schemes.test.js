'use strict';

/**
 * Integration Tests — Schemes API (Sprint 5 Phase 1)
 * GET /api/schemes
 * GET /api/schemes/:id
 */

require('../setup');
const request = require('supertest');

process.env.NODE_ENV  = 'test';
process.env.JWT_SECRET         = 'test-jwt-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.JWT_ACCESS_EXPIRES = '15m';
process.env.JWT_REFRESH_EXPIRES= '7d';

const app              = require('../../app');
const GovernmentScheme = require('../../models/GovernmentScheme');

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAuthToken() {
  const email = `schemetest_${Date.now()}@test.com`;
  const reg = await request(app).post('/api/auth/register').send({
    name: 'Scheme Tester', email, password: 'password123',
  });
  return reg.body.data.token;
}

async function seedSchemes() {
  return GovernmentScheme.insertMany([
    { name: 'PMEGP',        category: 'Subsidy Loan',  provider: 'KVIC',  isActive: true,  state: 'All' },
    { name: 'Mudra Loan',   category: 'Loan',          provider: 'MUDRA', isActive: true,  state: 'All' },
    { name: 'Stand-Up India', category: 'Credit Loan', provider: 'SIDBI', isActive: false, state: 'All' },
  ]);
}

// ─── GET /api/schemes ─────────────────────────────────────────────────────────

describe('GET /api/schemes', () => {
  let token;

  beforeEach(async () => {
    token = await getAuthToken();
    await seedSchemes();
  });

  it('returns 200 with paginated schemes', async () => {
    const res = await request(app)
      .get('/api/schemes')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.schemes).toBeInstanceOf(Array);
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.pagination).toHaveProperty('total');
    expect(res.body.data.pagination).toHaveProperty('page');
    expect(res.body.data.pagination).toHaveProperty('limit');
    expect(res.body.data.pagination).toHaveProperty('totalPages');
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/schemes');
    expect(res.status).toBe(401);
  });

  it('filters by category query param', async () => {
    const res = await request(app)
      .get('/api/schemes?category=Subsidy+Loan')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.schemes.length).toBe(1);
    expect(res.body.data.schemes[0].name).toBe('PMEGP');
  });

  it('filters by provider query param', async () => {
    const res = await request(app)
      .get('/api/schemes?provider=MUDRA')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.schemes.length).toBe(1);
    expect(res.body.data.schemes[0].name).toBe('Mudra Loan');
  });

  it('filters by isActive=true', async () => {
    const res = await request(app)
      .get('/api/schemes?isActive=true')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.schemes.every((s) => s.isActive === true)).toBe(true);
  });

  it('respects page and limit pagination params', async () => {
    const res = await request(app)
      .get('/api/schemes?page=1&limit=2')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.schemes.length).toBeLessThanOrEqual(2);
    expect(res.body.data.pagination.limit).toBe(2);
  });
});

// ─── GET /api/schemes/:id ─────────────────────────────────────────────────────

describe('GET /api/schemes/:id', () => {
  let token;
  let scheme;

  beforeEach(async () => {
    token  = await getAuthToken();
    [scheme] = await seedSchemes();
  });

  it('returns 200 with scheme data for valid id', async () => {
    const res = await request(app)
      .get(`/api/schemes/${scheme._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('PMEGP');
  });

  it('returns 404 for non-existent id', async () => {
    const fakeId = '64f1234567890abcde123456';
    const res = await request(app)
      .get(`/api/schemes/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for invalid ObjectId format', async () => {
    const res = await request(app)
      .get('/api/schemes/not-a-valid-id')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get(`/api/schemes/${scheme._id}`);
    expect(res.status).toBe(401);
  });
});
