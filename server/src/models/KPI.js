// src/models/KPI.js
// KPI — Sprint 8 Phase 1
// Stores information about Key Performance Indicators

const mongoose = require('mongoose');

const KPISchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a user ID'],
  },
  name: {
    type: String,
    required: [true, 'Please add a KPI name'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters'],
  },
  targetValue: {
    type: Number,
    required: [true, 'Please add a target value'],
  },
  currentValue: {
    type: Number,
    default: 0,
  },
  unit: {
    type: String,
    trim: true,
    maxlength: [50, 'Unit cannot exceed 50 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
KPISchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
KPISchema.index({ userId: 1 });

module.exports = mongoose.model('KPI', KPISchema);
