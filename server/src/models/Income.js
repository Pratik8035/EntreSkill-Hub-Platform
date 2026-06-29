'use strict';
// Income.js — Sprint 12 Phase 1

const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Income title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  category: {
    type: String,
    enum: ['Sales', 'Service', 'Investment', 'Freelance', 'Rental', 'Grant', 'Loan', 'Other'],
    default: 'Other',
  },
  source: {
    type: String,
    trim: true,
    maxlength: [200, 'Source cannot exceed 200 characters'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  recurring: {
    type: Boolean,
    default: false,
  },
  recurringFrequency: {
    type: String,
    enum: ['Weekly', 'Monthly', 'Quarterly', 'Yearly', null],
    default: null,
  },
  tags: [{ type: String, trim: true, maxlength: 50 }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

IncomeSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

IncomeSchema.index({ userId: 1, date: -1 });
IncomeSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Income', IncomeSchema);
