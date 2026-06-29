const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  // Dashboard
  getDashboardStats,
  // Users
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  // Mentors
  listMentors,
  updateMentorProfile,
  deleteMentorProfile,
  // Business Ideas
  listBusinessIdeas,
  createBusinessIdea,
  updateBusinessIdea,
  deleteBusinessIdea,
  // Schemes
  listSchemes,
  createScheme,
  updateScheme,
  deleteScheme,
  // Funding
  listFunding,
  createFunding,
  updateFunding,
  deleteFunding,
  // Courses
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  // Analytics
  getAdminAnalytics,
  getEnhancedAnalytics,
  // Sprint 12
  getFinancialStats,
} = require('../controllers/adminController');

// Enforce admin-only access for all routes in this file
router.use(protect);
router.use(authorize('admin'));

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard', getDashboardStats);

// ─── User Management ──────────────────────────────────────────────────────────
router.get('/users', listUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// ─── Mentor Management ────────────────────────────────────────────────────────
router.get('/mentors', listMentors);
router.put('/mentors/:id', updateMentorProfile);
router.delete('/mentors/:id', deleteMentorProfile);

// ─── Business Idea Management ─────────────────────────────────────────────────
router.get('/business-ideas', listBusinessIdeas);
router.post('/business-ideas', createBusinessIdea);
router.put('/business-ideas/:id', updateBusinessIdea);
router.delete('/business-ideas/:id', deleteBusinessIdea);

// ─── Scheme Management ────────────────────────────────────────────────────────
router.get('/schemes', listSchemes);
router.post('/schemes', createScheme);
router.put('/schemes/:id', updateScheme);
router.delete('/schemes/:id', deleteScheme);

// ─── Funding Management ───────────────────────────────────────────────────────
router.get('/funding', listFunding);
router.post('/funding', createFunding);
router.put('/funding/:id', updateFunding);
router.delete('/funding/:id', deleteFunding);

// ─── Course Management ────────────────────────────────────────────────────────
router.get('/courses', listCourses);
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// ─── Analytics ────────────────────────────────────────────────────────────────
router.get('/analytics', getAdminAnalytics);
router.get('/analytics/enhanced', getEnhancedAnalytics);

// ── Sprint 12 — Financial Stats ───────────────────────────────────────────────
router.get('/financial-stats', getFinancialStats);

module.exports = router;
