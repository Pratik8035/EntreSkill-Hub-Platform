const mongoose = require('mongoose');

/**
 * Course — Sprint 7 Phase 1
 * Stores information about a learning course.
 * Fields: title, description, category, difficultyLevel, thumbnail, estimatedDuration, isPublished
 */
const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
    enum: ['Entrepreneurship', 'Business Planning', 'Digital Marketing', 'Financial Management', 'Government Schemes', 'Other'],
  },
  difficultyLevel: {
    type: String,
    trim: true,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  thumbnail: {
    type: String,
    trim: true,
  },
  videoUrl: {
    type: String,
    trim: true,
  },
  estimatedDuration: {
    type: Number, // in minutes
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Indexes for filtering and search
CourseSchema.index({ category: 1 });
CourseSchema.index({ difficultyLevel: 1 });
CourseSchema.index({ isPublished: 1 });
CourseSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Course', CourseSchema);
