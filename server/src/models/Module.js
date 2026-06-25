const mongoose = require('mongoose');

/**
 * Module — Sprint 7 Phase 1
 * Stores information about a course module.
 * Fields: courseId, title, description, order
 */
const ModuleSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Please add a course ID'],
  },
  title: {
    type: String,
    required: [true, 'Please add a module title'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  order: {
    type: Number,
    required: [true, 'Please add an order number'],
  },
}, { timestamps: true });

// Indexes for efficient queries
ModuleSchema.index({ courseId: 1 });
ModuleSchema.index({ courseId: 1, order: 1 });

module.exports = mongoose.model('Module', ModuleSchema);
