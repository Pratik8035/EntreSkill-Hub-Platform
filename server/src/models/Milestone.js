// src/models/Milestone.js
// Milestone — Sprint 8 Phase 1
// Stores information about milestones for business goals

const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusinessGoal',
    required: [true, 'Please provide a goal ID'],
  },
  title: {
    type: String,
    required: [true, 'Please add a milestone title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  targetDate: {
    type: Date,
    required: [true, 'Please add a target date'],
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
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
MilestoneSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
MilestoneSchema.index({ goalId: 1, completed: 1 });
MilestoneSchema.index({ goalId: 1, targetDate: 1 });

module.exports = mongoose.model('Milestone', MilestoneSchema);
