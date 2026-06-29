// src/models/BusinessGoal.js
// BusinessGoal — Sprint 8 Phase 1
// Stores information about business goals for execution tracking

const mongoose = require('mongoose');

const BusinessGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a user ID'],
  },
  title: {
    type: String,
    required: [true, 'Please add a goal title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannon exceed 1000 characters'],
  },
  targetDate: {
    type: Date,
    required: [true, 'Please add a target date'],
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
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
BusinessGoalSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
BusinessGoalSchema.index({ userId: 1, status: 1 });
BusinessGoalSchema.index({ userId: 1, priority: 1 });

module.exports = mongoose.model('BusinessGoal', BusinessGoalSchema);
