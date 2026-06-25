const express = require('express');
const router = express.Router();
const { getDashboardProgress } = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

// ─── Protected Routes ─────────────────────────────────────────────────────────
router.get('/progress', protect, getDashboardProgress);

module.exports = router;
