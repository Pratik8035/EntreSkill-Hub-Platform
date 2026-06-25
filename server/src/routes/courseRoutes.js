const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourseById,
  getCourseModules,
  getLessonById,
  createCourse,
  updateCourse,
  deleteCourse,
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getCourseProgress,
  generateCertificate,
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const {
  CreateCourseSchema,
  UpdateCourseSchema,
  CreateModuleSchema,
  UpdateModuleSchema,
  CreateLessonSchema,
  UpdateLessonSchema,
  CreateQuizSchema,
  UpdateQuizSchema,
  CourseQuerySchema,
} = require('../validations/learning.validation');

// ─── Public Routes ─────────────────────────────────────────────────────────
router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.get('/:id/modules', getCourseModules);

// ─── Protected Routes (Admin only for create/update/delete) ────────────────
// Note: In a real application, you'd add an admin middleware check here
// For now, we'll use the protect middleware
router.post('/', protect, validateRequest(CreateCourseSchema), createCourse);
router.put('/:id', protect, validateRequest(UpdateCourseSchema), updateCourse);
router.delete('/:id', protect, deleteCourse);

router.post('/:courseId/modules', protect, validateRequest(CreateModuleSchema), createModule);
router.put('/modules/:id', protect, validateRequest(UpdateModuleSchema), updateModule);
router.delete('/modules/:id', protect, deleteModule);

router.post('/modules/:moduleId/lessons', protect, validateRequest(CreateLessonSchema), createLesson);
router.put('/lessons/:id', protect, validateRequest(UpdateLessonSchema), updateLesson);
router.delete('/lessons/:id', protect, deleteLesson);

router.post('/lessons/:lessonId/quiz', protect, validateRequest(CreateQuizSchema), createQuiz);
router.put('/quizzes/:id', protect, validateRequest(UpdateQuizSchema), updateQuiz);
router.delete('/quizzes/:id', protect, deleteQuiz);

// ─── Sprint 7 Phase 2: Progress Tracking Routes ───────────────────────────
router.get('/:id/progress', protect, getCourseProgress);

// ─── Sprint 7 Phase 4: Certificate Routes ─────────────────────────────────
router.get('/:id/certificate', protect, generateCertificate);

module.exports = router;
