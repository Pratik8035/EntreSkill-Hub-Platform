const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getSchemes, getRecommendedSchemes, checkEligibility } = require('../controllers/schemeController');

router.get('/', protect, getSchemes);
router.get('/recommended', protect, getRecommendedSchemes);
router.get('/check-eligibility/:id', protect, checkEligibility);

module.exports = router;
