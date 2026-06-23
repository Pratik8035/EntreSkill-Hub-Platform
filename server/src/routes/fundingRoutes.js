'use strict';

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getFundingPrograms,
  getFundingById,
  getRecommendedFunding,
  getEligibility,
  getFundingRecommendations,
  getFundingAdvisor,
} = require('../controllers/fundingController');

// Specific named routes MUST be declared before /:id to avoid route shadowing
router.get('/recommended',      protect, getRecommendedFunding);      // legacy
router.get('/eligibility',      protect, getEligibility);             // Phase 2
router.get('/recommendations',  protect, getFundingRecommendations);  // Phase 3
router.get('/advisor',          protect, getFundingAdvisor);          // Phase 4

// Sprint 5 Phase 1 routes
router.get('/',    protect, getFundingPrograms);
router.get('/:id', protect, getFundingById);

module.exports = router;
