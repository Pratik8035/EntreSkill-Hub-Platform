'use strict';

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getSchemes,
  getSchemeById,
  getRecommendedSchemes,
  checkEligibility,
} = require('../controllers/schemeController');

// Specific named routes MUST be declared before /:id to avoid route shadowing
router.get('/recommended',                protect, getRecommendedSchemes);
router.get('/check-eligibility/:id',      protect, checkEligibility);

// Sprint 5 Phase 1 routes
router.get('/',    protect, getSchemes);
router.get('/:id', protect, getSchemeById);

module.exports = router;
