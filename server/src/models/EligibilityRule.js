const mongoose = require('mongoose');

/**
 * EligibilityRule — Sprint 5 Phase 1
 * Defines a single eligibility condition that can be referenced
 * by FundingProgram documents.
 *
 * Example:
 *   { ruleName: 'Min Age', field: 'age', operator: 'gte', value: '18' }
 *   { ruleName: 'Gender', field: 'gender', operator: 'eq', value: 'female' }
 */
const EligibilityRuleSchema = new mongoose.Schema({
  // Human-readable label for this rule
  ruleName: { type: String, required: true, trim: true },

  // The user-profile or business field this rule targets
  // e.g. 'age', 'gender', 'experienceLevel', 'state', 'annualRevenue'
  field:    { type: String, required: true, trim: true },

  // Comparison operator
  operator: {
    type: String,
    required: true,
    enum: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'contains'],
    trim: true,
  },

  // The threshold / reference value (stored as string, cast at evaluation time)
  value:    { type: String, required: true, trim: true },
}, { timestamps: true });

EligibilityRuleSchema.index({ field: 1 });

module.exports = mongoose.model('EligibilityRule', EligibilityRuleSchema);
