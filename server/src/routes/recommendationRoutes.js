const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getRecommendations, getRecommendationDetails } = require('../controllers/recommendationController');

const router = express.Router();

// GET /api/recommendations - get top recommendations for logged-in user
router.get('/', protect, getRecommendations);

// GET /api/recommendations/:id - get recommendation detail for a specific business idea
router.get('/:id', protect, getRecommendationDetails);

module.exports = router;
