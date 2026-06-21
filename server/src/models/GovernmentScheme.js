const mongoose = require('mongoose');

/**
 * GovernmentScheme stores information about a public scheme that entrepreneurs can apply to.
 */
const GovernmentSchemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  eligibility: { type: String },
  category: { type: String },
  benefits: { type: String },
  officialLink: { type: String },
  state: { type: String },
  industry: { type: String },
  fundingAmount: { type: Number },
  deadline: { type: Date },
}, { timestamps: true });

// Compound index for fast lookup by state & industry
GovernmentSchemeSchema.index({ state: 1, industry: 1 });

module.exports = mongoose.model('GovernmentScheme', GovernmentSchemeSchema);
