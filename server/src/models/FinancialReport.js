'use strict';
// FinancialReport.js — Sprint 12 Phase 1

const mongoose = require('mongoose');

const FinancialReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  type: {
    type: String,
    enum: [
      'income_report',
      'expense_report',
      'profit_report',
      'loss_report',
      'cash_flow_report',
      'budget_report',
      'invoice_report',
      'monthly_report',
      'yearly_report',
    ],
    required: [true, 'Report type is required'],
  },
  label: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  period: {
    start: { type: Date },
    end: { type: Date },
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: { type: Date, default: Date.now },
});

FinancialReportSchema.index({ userId: 1, type: 1 });
FinancialReportSchema.index({ userId: 1, generatedAt: -1 });

module.exports = mongoose.model('FinancialReport', FinancialReportSchema);
