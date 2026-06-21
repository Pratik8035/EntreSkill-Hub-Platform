const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getFundingPrograms, getRecommendedFunding } = require('../controllers/fundingController');

router.get('/', protect, getFundingPrograms);
router.get('/recommended', protect, getRecommendedFunding);

module.exports = router;
