const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getProgress } = require('../controllers/profileController');

router.get('/progress', protect, getProgress);

module.exports = router;
