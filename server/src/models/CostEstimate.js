const mongoose = require('mongoose');

const CostEstimateSchema = new mongoose.Schema({
  businessIdeaId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessIdea', required: true },
  equipmentCost: { type: Number, default: 0 },
  marketingCost: { type: Number, default: 0 },
  operationalCost: { type: Number, default: 0 },
  miscCost: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('CostEstimate', CostEstimateSchema);
