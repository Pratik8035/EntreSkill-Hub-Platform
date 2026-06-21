const mongoose = require('mongoose');

const RevenueProjectionSchema = new mongoose.Schema({
  businessIdeaId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessIdea', required: true },
  monthlyRevenue: { type: Number, default: 0 },
  monthlyExpense: { type: Number, default: 0 },
  monthlyProfit: { type: Number, default: 0 },
  yearlyProfit: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('RevenueProjection', RevenueProjectionSchema);
