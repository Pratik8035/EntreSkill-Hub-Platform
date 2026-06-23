'use strict';

const { z } = require('zod');
const { objectId } = require('./objectId');

/**
 * Scheme Validations — Sprint 5 Phase 1
 */

// Query params for GET /api/schemes
const SchemeQuerySchema = z.object({
  category: z.string().trim().optional(),
  provider: z.string().trim().optional(),
  state:    z.string().trim().optional(),
  search:   z.string().trim().optional(),
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

// Params for GET /api/schemes/:id
const SchemeParamsSchema = z.object({
  id: objectId(),
});

module.exports = { SchemeQuerySchema, SchemeParamsSchema };
