'use strict';
// Budget.js — Sprint 12 Phase 1

const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Budget name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters'],
  },
  category: {
    type: String,
    enum: ['Operations', 'Marketing', 'Salaries', 'Rent', 'Utilities', 'Equipment', 'Raw Materials', 'Taxes', 'Insurance', 'Travel', 'General', 'Other'],
    default: 'General',
  },
  allocatedAmount: {
    type: Number,
    required: [true, 'Allocated amount is required'],
    min: [0, 'Allocated amount cannot be negative'],
  },
  period: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Yearly'],
    default: 'Monthly',
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  alertThreshold: {
    type: Number,
    min: 0,
    max: 100,
    default: 80, // alert when 80% utilized
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

BudgetSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

BudgetSchema.index({ userId: 1, isActive: 1 });
BudgetSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Budget', BudgetSchema);
