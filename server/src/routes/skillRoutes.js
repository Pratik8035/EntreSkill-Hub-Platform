const express = require('express');
const router = express.Router();
const {
  getSkillCategories,
  getSkills,
  saveUserSkills,
  getUserSkills,
  updateUserSkills,
} = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const { SaveUserSkillsSchema } = require('../validations/assessment.validation');

// Public routes
router.get('/categories', getSkillCategories);
router.get('/', getSkills);

// Protected user-specific routes
router.post('/users', protect, validateRequest(SaveUserSkillsSchema), saveUserSkills);
router.get('/users', protect, getUserSkills);
router.put('/users', protect, validateRequest(SaveUserSkillsSchema), updateUserSkills);

module.exports = router;
