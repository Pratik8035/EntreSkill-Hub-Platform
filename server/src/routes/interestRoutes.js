const express = require('express');
const router = express.Router();
const {
  getInterestCategories,
  getInterests,
  saveUserInterests,
  getUserInterests,
  updateUserInterests,
} = require('../controllers/interestController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const { SaveUserInterestsSchema } = require('../validations/assessment.validation');

// Public routes
router.get('/categories', getInterestCategories);
router.get('/', getInterests);

// Protected user-specific routes
router.post('/users', protect, validateRequest(SaveUserInterestsSchema), saveUserInterests);
router.get('/users', protect, getUserInterests);
router.put('/users', protect, validateRequest(SaveUserInterestsSchema), updateUserInterests);

module.exports = router;
