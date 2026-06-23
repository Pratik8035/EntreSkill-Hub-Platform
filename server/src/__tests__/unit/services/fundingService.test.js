'use strict';

/**
 * Unit Tests — FundingService (Sprint 5 Phase 1)
 */

require('../../setup');
const mongoose      = require('mongoose');
const FundingProgram = require('../../../models/FundingProgram');
const FundingService = require('../../../services/fundingService');

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function createProgram(overrides = {}) {
  return FundingProgram.create({
    name:        'Test Program',
    fundingType: 'Loan',
    minAmount:   10000,
    maxAmount:   500000,
    provider:    'Test Bank',
    industries:  ['All'],
    isActive:    true,
    ...overrides,
  });
}

// ─── listPrograms ─────────────────────────────────────────────────────────────

describe('FundingService.listPrograms', () => {
  it('returns all programs with default pagination', async () => {
    await createProgram({ name: 'Program A' });
    await createProgram({ name: 'Program B' });

    const result = await FundingService.listPrograms();

    expect(result.programs.length).toBe(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(1);
  });

  it('filters by fundingType', async () => {
    await createProgram({ name: 'Grant A', fundingType: 'Grant' });
    await createProgram({ name: 'Loan A',  fundingType: 'Loan' });

    const result = await FundingService.listPrograms({ fundingType: 'Grant' });

    expect(result.programs.length).toBe(1);
    expect(result.programs[0].name).toBe('Grant A');
  });

  it('filters by provider (partial, case-insensitive)', async () => {
    await createProgram({ name: 'Program A', provider: 'SIDBI' });
    await createProgram({ name: 'Program B', provider: 'HDFC Bank' });

    const result = await FundingService.listPrograms({ provider: 'sidbi' });

    expect(result.programs.length).toBe(1);
    expect(result.programs[0].name).toBe('Program A');
  });

  it('filters by isActive flag', async () => {
    await createProgram({ name: 'Active',   isActive: true });
    await createProgram({ name: 'Inactive', isActive: false });

    const active = await FundingService.listPrograms({ isActive: true });
    expect(active.programs.length).toBe(1);
    expect(active.programs[0].name).toBe('Active');

    const inactive = await FundingService.listPrograms({ isActive: false });
    expect(inactive.programs.length).toBe(1);
    expect(inactive.programs[0].name).toBe('Inactive');
  });

  it('searches across name, provider, and eligibility', async () => {
    await createProgram({ name: 'Micro Loan', provider: 'MUDRA', eligibility: 'No collateral' });
    await createProgram({ name: 'Big Loan',   provider: 'SBI',   eligibility: 'Collateral needed' });

    const result = await FundingService.listPrograms({ search: 'no collateral' });

    expect(result.programs.length).toBe(1);
    expect(result.programs[0].name).toBe('Micro Loan');
  });

  it('paginates results correctly', async () => {
    for (let i = 1; i <= 7; i++) {
      await createProgram({ name: `Program ${i}` });
    }

    const page1 = await FundingService.listPrograms({ page: 1, limit: 3 });
    const page2 = await FundingService.listPrograms({ page: 2, limit: 3 });
    const page3 = await FundingService.listPrograms({ page: 3, limit: 3 });

    expect(page1.programs.length).toBe(3);
    expect(page2.programs.length).toBe(3);
    expect(page3.programs.length).toBe(1);
    expect(page1.totalPages).toBe(3);
    expect(page1.total).toBe(7);
  });

  it('returns empty result when no programs exist', async () => {
    const result = await FundingService.listPrograms();
    expect(result.programs).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});

// ─── getProgramById ───────────────────────────────────────────────────────────

describe('FundingService.getProgramById', () => {
  it('returns program when found', async () => {
    const program = await createProgram({ name: 'Startup Grant' });
    const found   = await FundingService.getProgramById(program._id.toString());
    expect(found.name).toBe('Startup Grant');
  });

  it('throws 404 AppError when program does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(FundingService.getProgramById(fakeId)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
