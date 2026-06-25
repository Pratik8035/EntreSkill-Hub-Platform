const mongoose = require('mongoose');

/**
 * Quiz — Sprint 7 Phase 1
 * Stores information about a quiz associated with a lesson.
 * Fields: lessonId, title, questions
 * Question Structure: { question, options, correctAnswer }
 */
const QuizSchema = new mongoose.Schema({
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: [true, 'Please add a lesson ID'],
  },
  title: {
    type: String,
    required: [true, 'Please add a quiz title'],
    trim: true,
  },
  questions: [{
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: [{
      type: String,
      required: true,
      trim: true,
    }],
    correctAnswer: {
      type: Number, // Index of the correct option in options array
      required: true,
    },
  }],
}, { timestamps: true });

// Indexes for efficient queries
QuizSchema.index({ lessonId: 1 });

module.exports = mongoose.model('Quiz', QuizSchema);
