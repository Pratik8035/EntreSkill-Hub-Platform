const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getRoadmap } = require('../controllers/roadmapController');

router.get('/:businessIdeaId', protect, getRoadmap);

module.exports = router;
