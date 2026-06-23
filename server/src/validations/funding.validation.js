'use strict';

const { z } = require('zod');
const { objectId } = require('./objectId');

/**
 * Funding Validations — Sprint 5 Phase 1
 */

const FUNDING_TYPES = ['Grant', 'Loan', 'Subsidy', 'Equity', 'Credit Guarantee', 'Other'];

// Query params for GET /api/funding
const FundingQuerySchema = z.object({
  fundingType: z.enum(FUNDING_TYPES).optional(),
  provider:    z.string().trim().optional(),
  industry:    z.string().trim().optional(),
  search:      z.string().trim().optional(),
  isActive: z
    .string()
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      return v === 'true';
    }),
  page:  z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

// Params for GET /api/funding/:id
const FundingParamsSchema = z.object({
  id: objectId(),
});

module.exports = { FundingQuerySchema, FundingParamsSchema };
