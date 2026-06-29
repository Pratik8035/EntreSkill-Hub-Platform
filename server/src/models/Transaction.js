'use strict';
// Transaction.js — Sprint 12 Phase 1

const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  type: {
    type: String,
    enum: ['Income', 'Expense'],
    required: [true, 'Transaction type is required'],
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
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
    trim: true,
    maxlength: 100,
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
  // Reference to source document (Income or Expense)
  refId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  refModel: {
    type: String,
    enum: ['Income', 'Expense', null],
    default: null,
  },
  tags: [{ type: String, trim: true, maxlength: 50 }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

TransactionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
