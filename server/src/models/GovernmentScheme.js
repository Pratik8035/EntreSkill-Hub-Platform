const mongoose = require('mongoose');

/**
 * GovernmentScheme — Sprint 5 Phase 1
 * Stores information about a public scheme that entrepreneurs can apply to.
 * Fields added in Phase 1: provider, applicationUrl, isActive, eligibilityCriteria.
 * Legacy fields retained for backward compatibility.
 */
const GovernmentSchemeSchema = new mongoose.Schema({
  name:               { type: String, required: true, trim: true },
  description:        { type: String, trim: true },
  category:           { type: String, trim: true },
  // Sprint 5 Phase 1: organisation administering the scheme
  provider:           { type: String, trim: true },
  // Phase 1: structured eligibility string (mirrors legacy 'eligibility' field)
  eligibilityCriteria:{ type: String, trim: true },
  // Legacy eligibility field preserved for existing data & recommendation service
  eligibility:        { type: String },
  benefits:           { type: String },
  // Phase 1: primary apply URL
  applicationUrl:     { type: String, trim: true },
  // Legacy officialLink preserved for existing data
  officialLink:       { type: String },
  deadline:           { type: Date },
  // Phase 1: soft-delete flag
  isActive:           { type: Boolean, default: true },
  // Legacy fields preserved
  state:              { type: String },
  industry:           { type: String },
  fundingAmount:      { type: Number },
}, { timestamps: true });

// Compound index for fast lookup by state & industry (legacy)
GovernmentSchemeSchema.index({ state: 1, industry: 1 });
// Phase 1 indexes
GovernmentSchemeSchema.index({ category: 1 });
GovernmentSchemeSchema.index({ provider: 1 });
GovernmentSchemeSchema.index({ isActive: 1 });

module.exports = mongoose.model('GovernmentScheme', GovernmentSchemeSchema);
