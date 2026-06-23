'use strict';

/**
 * Unit Tests — SchemeService (Sprint 5 Phase 1)
 */

require('../../setup');
const mongoose = require('mongoose');
const GovernmentScheme = require('../../../models/GovernmentScheme');
const SchemeService    = require('../../../services/schemeService');

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function createScheme(overrides = {}) {
  return GovernmentScheme.create({
    name:     'Test Scheme',
    category: 'Subsidy Loan',
    provider: 'KVIC',
    isActive: true,
    ...overrides,
  });
}

// ─── listSchemes ─────────────────────────────────────────────────────────────

describe('SchemeService.listSchemes', () => {
  it('returns all active schemes with default pagination', async () => {
    await createScheme({ name: 'Scheme A' });
    await createScheme({ name: 'Scheme B' });

    const result = await SchemeService.listSchemes();

    expect(result.schemes.length).toBe(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(1);
  });

  it('filters by category (case-insensitive)', async () => {
    await createScheme({ name: 'Scheme A', category: 'Grant' });
    await createScheme({ name: 'Scheme B', category: 'Loan' });

    const result = await SchemeService.listSchemes({ category: 'grant' });

    expect(result.schemes.length).toBe(1);
    expect(result.schemes[0].name).toBe('Scheme A');
  });

  it('filters by provider (partial match)', async () => {
    await createScheme({ name: 'Scheme A', provider: 'MUDRA Bank' });
    await createScheme({ name: 'Scheme B', provider: 'KVIC' });

    const result = await SchemeService.listSchemes({ provider: 'MUDRA' });

    expect(result.schemes.length).toBe(1);
    expect(result.schemes[0].name).toBe('Scheme A');
  });

  it('filters by isActive flag', async () => {
    await createScheme({ name: 'Active',   isActive: true });
    await createScheme({ name: 'Inactive', isActive: false });

    const active = await SchemeService.listSchemes({ isActive: true });
    expect(active.schemes.length).toBe(1);
    expect(active.schemes[0].name).toBe('Active');

    const inactive = await SchemeService.listSchemes({ isActive: false });
    expect(inactive.schemes.length).toBe(1);
    expect(inactive.schemes[0].name).toBe('Inactive');
  });

  it('searches across name, description, and benefits', async () => {
    await createScheme({ name: 'PMEGP', description: 'Employment scheme' });
    await createScheme({ name: 'MUDRA', description: 'Collateral-free loan' });

    const result = await SchemeService.listSchemes({ search: 'employment' });

    expect(result.schemes.length).toBe(1);
    expect(result.schemes[0].name).toBe('PMEGP');
  });

  it('paginates results correctly', async () => {
    for (let i = 1; i <= 12; i++) {
      await createScheme({ name: `Scheme ${i}` });
    }

    const page1 = await SchemeService.listSchemes({ page: 1, limit: 5 });
    const page2 = await SchemeService.listSchemes({ page: 2, limit: 5 });
    const page3 = await SchemeService.listSchemes({ page: 3, limit: 5 });

    expect(page1.schemes.length).toBe(5);
    expect(page2.schemes.length).toBe(5);
    expect(page3.schemes.length).toBe(2);
    expect(page1.totalPages).toBe(3);
    expect(page1.total).toBe(12);
  });

  it('returns empty result when no schemes exist', async () => {
    const result = await SchemeService.listSchemes();
    expect(result.schemes).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});

// ─── getSchemeById ────────────────────────────────────────────────────────────

describe('SchemeService.getSchemeById', () => {
  it('returns scheme when found', async () => {
    const scheme = await createScheme({ name: 'Stand-Up India' });
    const found  = await SchemeService.getSchemeById(scheme._id.toString());
    expect(found.name).toBe('Stand-Up India');
  });

  it('throws 404 AppError when scheme does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(SchemeService.getSchemeById(fakeId)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
