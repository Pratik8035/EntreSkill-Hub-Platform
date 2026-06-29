'use strict';
// FinancialGoal.js — Sprint 12 Phase 1

const mongoose = require('mongoose');

const FinancialGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [0, 'Target amount cannot be negative'],
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount cannot be negative'],
  },
  type: {
    type: String,
    enum: ['Savings', 'Revenue', 'Investment', 'Debt Reduction', 'Emergency Fund', 'Expansion', 'Other'],
    default: 'Savings',
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Paused', 'Cancelled'],
    default: 'Active',
  },
  targetDate: {
    type: Date,
    required: [true, 'Target date is required'],
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

FinancialGoalSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

FinancialGoalSchema.index({ userId: 1, status: 1 });
FinancialGoalSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('FinancialGoal', FinancialGoalSchema);
