const mongoose = require('mongoose');

/**
 * QuizAttempt — Sprint 7 Phase 3
 * Stores user quiz attempts with answers and results.
 * Fields: userId, quizId, answers, score, percentage, completedAt
 */
const QuizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add a user ID'],
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Please add a quiz ID'],
  },
  answers: [{
    questionIndex: {
      type: Number,
      required: true,
    },
    selectedAnswer: {
      type: Number,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
  }],
  score: {
    type: Number, // Number of correct answers
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number, // Score percentage (0-100)
    required: true,
    min: 0,
    max: 100,
  },
  passed: {
    type: Boolean,
    required: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Indexes for efficient queries
QuizAttemptSchema.index({ userId: 1 });
QuizAttemptSchema.index({ quizId: 1 });
QuizAttemptSchema.index({ userId: 1, quizId: 1 });
QuizAttemptSchema.index({ userId: 1, completedAt: -1 });

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);
