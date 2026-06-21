const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  listUsers,
  updateUser,
  deleteUser,
  listMentors,
  updateMentorProfile,
  deleteMentorProfile,
  listBusinessIdeas,
  createBusinessIdea,
  updateBusinessIdea,
  deleteBusinessIdea,
  createScheme,
  updateScheme,
  deleteScheme,
  createFunding,
  updateFunding,
  deleteFunding,
  getAdminAnalytics
} = require('../controllers/adminController');

// Enforce admin-only access for all routes in this file
router.use(protect);
router.use(authorize('admin'));

// User Management
router.get('/users', listUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Mentor Management
router.get('/mentors', listMentors);
router.put('/mentors/:id', updateMentorProfile);
router.delete('/mentors/:id', deleteMentorProfile);

// Business Idea Management
router.get('/business-ideas', listBusinessIdeas);
router.post('/business-ideas', createBusinessIdea);
router.put('/business-ideas/:id', updateBusinessIdea);
router.delete('/business-ideas/:id', deleteBusinessIdea);

// Scheme Management
router.post('/schemes', createScheme);
router.put('/schemes/:id', updateScheme);
router.delete('/schemes/:id', deleteScheme);

// Funding Management
router.post('/funding', createFunding);
router.put('/funding/:id', updateFunding);
router.delete('/funding/:id', deleteFunding);

// Platform Analytics
router.get('/analytics', getAdminAnalytics);

module.exports = router;
