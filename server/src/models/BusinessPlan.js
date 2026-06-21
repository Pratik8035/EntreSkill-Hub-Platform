const mongoose = require('mongoose');

const BusinessPlanSchema = new mongoose.Schema({
  businessIdeaId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessIdea', required: true },
  executiveSummary: { type: String, required: true },
  targetMarket: { type: String, required: true },
  marketingStrategy: { type: String, required: true },
  operationsPlan: { type: String, required: true },
  financialPlan: { type: String, required: true },
  costEstimate: { type: mongoose.Schema.Types.ObjectId, ref: 'CostEstimate' },
  revenueProjection: { type: mongoose.Schema.Types.ObjectId, ref: 'RevenueProjection' },
  riskScore: { type: String, enum: ['Low', 'Medium', 'High'] },
}, { timestamps: true });

module.exports = mongoose.model('BusinessPlan', BusinessPlanSchema);
