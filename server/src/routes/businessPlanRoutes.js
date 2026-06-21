const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
router.use(protect);
const {
  generatePlan,
  getPlan,
  getCostEstimate,
  getRevenueProjection,
} = require('../controllers/businessPlanController');

// POST   /api/business-plan/generate/:businessIdeaId
router.post('/generate/:businessIdeaId', generatePlan);

// GET    /api/business-plan/cost/:businessIdeaId
router.get('/cost/:businessIdeaId', getCostEstimate);

// GET    /api/business-plan/revenue/:businessIdeaId
router.get('/revenue/:businessIdeaId', getRevenueProjection);

// GET    /api/business-plan/:businessIdeaId
router.get('/:businessIdeaId', getPlan);

module.exports = router;
