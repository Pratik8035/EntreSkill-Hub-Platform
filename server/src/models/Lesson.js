const mongoose = require('mongoose');

/**
 * Lesson — Sprint 7 Phase 1
 * Stores information about a lesson within a module.
 * Fields: moduleId, title, content, videoUrl, duration, order
 */
const LessonSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: [true, 'Please add a module ID'],
  },
  title: {
    type: String,
    required: [true, 'Please add a lesson title'],
    trim: true,
  },
  content: {
    type: String,
    trim: true,
  },
  videoUrl: {
    type: String,
    trim: true,
  },
  duration: {
    type: Number, // in minutes
  },
  order: {
    type: Number,
    required: [true, 'Please add an order number'],
  },
}, { timestamps: true });

// Indexes for efficient queries
LessonSchema.index({ moduleId: 1 });
LessonSchema.index({ moduleId: 1, order: 1 });

module.exports = mongoose.model('Lesson', LessonSchema);
