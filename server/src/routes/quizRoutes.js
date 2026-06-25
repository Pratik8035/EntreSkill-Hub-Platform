const express = require('express');
const router = express.Router();
const {
  getQuizById,
  submitQuiz,
  getQuizHistory,
  getQuizStatistics,
  getQuizAttemptById,
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

// ─── Protected Routes ─────────────────────────────────────────────────────
// Specific routes must come before dynamic :id routes
router.get('/history', protect, getQuizHistory);
router.get('/statistics', protect, getQuizStatistics);
router.get('/attempts/:id', protect, getQuizAttemptById);
router.get('/:id', protect, getQuizById);
router.post('/:id/submit', protect, submitQuiz);

module.exports = router;
