const express = require('express');
const router = express.Router();
const { getLessonById, markLessonComplete } = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

// ─── Public Routes ─────────────────────────────────────────────────────────
router.get('/:id', getLessonById);

// ─── Protected Routes ─────────────────────────────────────────────────────
router.post('/:id/complete', protect, markLessonComplete);

module.exports = router;
