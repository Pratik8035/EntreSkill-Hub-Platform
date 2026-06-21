const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getAnalytics, getDashboard } = require('../controllers/analyticsController');

router.get('/dashboard', protect, getDashboard);
router.get('/user', protect, getAnalytics);

module.exports = router;
