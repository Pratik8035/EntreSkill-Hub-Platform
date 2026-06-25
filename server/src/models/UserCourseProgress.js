const mongoose = require('mongoose');

/**
 * UserCourseProgress — Sprint 7 Phase 1
 * Stores user progress for a course.
 * Fields: userId, courseId, completedLessons, progressPercentage, completedAt
 */
const UserCourseProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add a user ID'],
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Please add a course ID'],
  },
  completedLessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
  }],
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  completedAt: {
    type: Date,
  },
}, { timestamps: true });

// Compound index to ensure one progress record per user per course
UserCourseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
UserCourseProgressSchema.index({ userId: 1 });
UserCourseProgressSchema.index({ courseId: 1 });

module.exports = mongoose.model('UserCourseProgress', UserCourseProgressSchema);
