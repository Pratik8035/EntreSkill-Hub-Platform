const mongoose = require('mongoose');

/**
 * FundingProgram stores information about a funding program or loan offering.
 */
const FundingProgramSchema = new mongoose.Schema({
  name: { type: String, required: true },
  provider: { type: String },
  amount: { type: Number },
  interestRate: { type: Number },
  eligibility: { type: String },
  industry: { type: String },
  applicationLink: { type: String },
}, { timestamps: true });

FundingProgramSchema.index({ industry: 1 });

module.exports = mongoose.model('FundingProgram', FundingProgramSchema);
