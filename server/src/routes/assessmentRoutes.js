const express = require('express');
const router = express.Router();
const {
  submitAssessment,
  getAssessment,
  updateAssessment,
  getAssessmentStatus,
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const { SubmitAssessmentSchema, UpdateAssessmentSchema } = require('../validations/assessment.validation');

// Submit full assessment (new or complete)
router.post('/', protect, validateRequest(SubmitAssessmentSchema), submitAssessment);

// Get full assessment data
router.get('/', protect, getAssessment);

// Partial update – all fields optional (supports skills-only, interests-only, or experience-only updates)
router.put('/', protect, validateRequest(UpdateAssessmentSchema), updateAssessment);

// Lightweight status endpoint for UI redirect logic
router.get('/status', protect, getAssessmentStatus);

module.exports = router;
