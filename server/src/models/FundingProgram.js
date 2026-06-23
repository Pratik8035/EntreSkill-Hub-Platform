const mongoose = require('mongoose');

/**
 * FundingProgram — Sprint 5 Phase 1
 * Stores information about a funding program or loan offering.
 * Fields added in Phase 1: fundingType, minAmount, maxAmount,
 *   eligibilityRules, industries, isActive.
 * Legacy fields retained for backward compatibility.
 */
const FundingProgramSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  // Phase 1: type of funding offered
  fundingType:    {
    type: String,
    enum: ['Grant', 'Loan', 'Subsidy', 'Equity', 'Credit Guarantee', 'Other'],
    default: 'Other',
    trim: true,
  },
  // Phase 1: amount range
  minAmount:      { type: Number },
  maxAmount:      { type: Number },
  // Legacy single amount preserved for existing recommendation service
  amount:         { type: Number },
  provider:       { type: String, trim: true },
  // Phase 1: array of EligibilityRule references
  eligibilityRules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EligibilityRule',
  }],
  // Legacy eligibility string preserved
  eligibility:    { type: String },
  // Phase 1: list of target industries
  industries:     [{ type: String, trim: true }],
  // Legacy single industry preserved
  industry:       { type: String },
  // Phase 1: soft-delete flag
  isActive:       { type: Boolean, default: true },
  // Legacy fields preserved
  interestRate:   { type: Number },
  applicationLink:{ type: String },
}, { timestamps: true });

FundingProgramSchema.index({ industry: 1 });
FundingProgramSchema.index({ fundingType: 1 });
FundingProgramSchema.index({ isActive: 1 });

module.exports = mongoose.model('FundingProgram', FundingProgramSchema);
