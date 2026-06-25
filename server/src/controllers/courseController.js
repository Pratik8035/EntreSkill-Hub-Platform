const CourseService = require('../services/courseService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// ─── Get All Courses ──────────────────────────────────────────────────────────

// @desc    Get all courses with pagination and filtering
// @route   GET /api/courses
// @access  Public
const getAllCourses = async (req, res, next) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      category: req.query.category,
      difficultyLevel: req.query.difficultyLevel,
      isPublished: req.query.isPublished === 'true' || req.query.isPublished === true ? true : req.query.isPublished === 'false' || req.query.isPublished === false ? false : undefined,
    };

    const result = await CourseService.getCourses(filters);
    return sendSuccess(res, result, 'Courses retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// ─── Get Course By ID ─────────────────────────────────────────────────────────

// @desc    Get a single course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res, next) => {
  try {
    const course = await CourseService.getCourseById(req.params.id);
    return sendSuccess(res, course, 'Course retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// ─── Get Course Modules ───────────────────────────────────────────────────────

// @desc    Get all modules for a course
// @route   GET /api/courses/:id/modules
// @access  Public
const getCourseModules = async (req, res, next) => {
  try {
    const modules = await CourseService.getCourseModules(req.params.id);
    return sendSuccess(res, modules, 'Modules retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// ─── Get Lesson By ID ─────────────────────────────────────────────────────────

// @desc    Get a lesson by ID with its quiz
// @route   GET /api/lessons/:id
// @access  Public
const getLessonById = async (req, res, next) => {
  try {
    const result = await CourseService.getLessonById(req.params.id);
    return sendSuccess(res, result, 'Lesson retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// ─── Create Course ────────────────────────────────────────────────────────────

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Admin)
const createCourse = async (req, res, next) => {
  try {
    const course = await CourseService.createCourse(req.body);
    return sendSuccess(res, course, 'Course created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// ─── Update Course ────────────────────────────────────────────────────────────

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private (Admin)
const updateCourse = async (req, res, next) => {
  try {
    const course = await CourseService.updateCourse(req.params.id, req.body);
    return sendSuccess(res, course, 'Course updated successfully');
  } catch (error) {
    next(error);
  }
};

// ─── Delete Course ────────────────────────────────────────────────────────────

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private (Admin)
const deleteCourse = async (req, res, next) => {
  try {
    await CourseService.deleteCourse(req.params.id);
    return sendSuccess(res, null, 'Course deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ─── Create Module ───────────────────────────────────────────────────────────

// @desc    Create a new module for a course
// @route   POST /api/courses/:courseId/modules
// @access  Private (Admin)
const createModule = async (req, res, next) => {
  try {
    const moduleData = { ...req.body, courseId: req.params.courseId };
    const module = await CourseService.createModule(moduleData);
    return sendSuccess(res, module, 'Module created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// ─── Update Module ───────────────────────────────────────────────────────────

// @desc    Update a module
// @route   PUT /api/modules/:id
// @access  Private (Admin)
const updateModule = async (req, res, next) => {
  try {
    const module = await CourseService.updateModule(req.params.id, req.body);
    return sendSuccess(res, module, 'Module updated successfully');
  } catch (error) {
    next(error);
  }
};

// ─── Delete Module ───────────────────────────────────────────────────────────

// @desc    Delete a module
// @route   DELETE /api/modules/:id
// @access  Private (Admin)
const deleteModule = async (req, res, next) => {
  try {
    await CourseService.deleteModule(req.params.id);
    return sendSuccess(res, null, 'Module deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ─── Create Lesson ───────────────────────────────────────────────────────────

// @desc    Create a new lesson for a module
// @route   POST /api/modules/:moduleId/lessons
// @access  Private (Admin)
const createLesson = async (req, res, next) => {
  try {
    const lessonData = { ...req.body, moduleId: req.params.moduleId };
    const lesson = await CourseService.createLesson(lessonData);
    return sendSuccess(res, lesson, 'Lesson created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// ─── Update Lesson ───────────────────────────────────────────────────────────

// @desc    Update a lesson
// @route   PUT /api/lessons/:id
// @access  Private (Admin)
const updateLesson = async (req, res, next) => {
  try {
    const lesson = await CourseService.updateLesson(req.params.id, req.body);
    return sendSuccess(res, lesson, 'Lesson updated successfully');
  } catch (error) {
    next(error);
  }
};

// ─── Delete Lesson ───────────────────────────────────────────────────────────

// @desc    Delete a lesson
// @route   DELETE /api/lessons/:id
// @access  Private (Admin)
const deleteLesson = async (req, res, next) => {
  try {
    await CourseService.deleteLesson(req.params.id);
    return sendSuccess(res, null, 'Lesson deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ─── Create Quiz ─────────────────────────────────────────────────────────────

// @desc    Create a new quiz for a lesson
// @route   POST /api/lessons/:lessonId/quiz
// @access  Private (Admin)
const createQuiz = async (req, res, next) => {
  try {
    const quizData = { ...req.body, lessonId: req.params.lessonId };
    const quiz = await CourseService.createQuiz(quizData);
    return sendSuccess(res, quiz, 'Quiz created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// ─── Update Quiz ─────────────────────────────────────────────────────────────

// @desc    Update a quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Admin)
const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await CourseService.updateQuiz(req.params.id, req.body);
    return sendSuccess(res, quiz, 'Quiz updated successfully');
  } catch (error) {
    next(error);
  }
};

// ─── Delete Quiz ─────────────────────────────────────────────────────────────

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Admin)
const deleteQuiz = async (req, res, next) => {
  try {
    await CourseService.deleteQuiz(req.params.id);
    return sendSuccess(res, null, 'Quiz deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ─── Sprint 7 Phase 2: Progress Tracking Controllers ──────────────────────────

// @desc    Mark a lesson as complete
// @route   POST /api/lessons/:id/complete
// @access  Private
const markLessonComplete = async (req, res, next) => {
  try {
    const progress = await CourseService.markLessonComplete(req.params.id, req.user._id);
    return sendSuccess(res, progress, 'Lesson marked as complete');
  } catch (error) {
    next(error);
  }
};

// @desc    Get course progress for a user
// @route   GET /api/courses/:id/progress
// @access  Private
const getCourseProgress = async (req, res, next) => {
  try {
    const progress = await CourseService.getCourseProgress(req.params.id, req.user._id);
    return sendSuccess(res, progress, 'Course progress retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard summary for a user
// @route   GET /api/learning/progress
// @access  Private
const getDashboardProgress = async (req, res, next) => {
  try {
    const summary = await CourseService.getDashboardProgress(req.user._id);
    return sendSuccess(res, summary, 'Dashboard progress retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// ─── Sprint 7 Phase 3: Quiz Engine Controllers ───────────────────────────────

// @desc    Get a quiz by ID (without correct answers)
// @route   GET /api/quizzes/:id
// @access  Private
const getQuizById = async (req, res, next) => {
  try {
    const quiz = await CourseService.getQuizById(req.params.id);
    return sendSuccess(res, quiz, 'Quiz retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Submit quiz answers
// @route   POST /api/quizzes/:id/submit
// @access  Private
const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;
    const attempt = await CourseService.submitQuiz(req.params.id, req.user._id, answers);
    return sendSuccess(res, attempt, 'Quiz submitted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get quiz attempt history
// @route   GET /api/quizzes/history
// @access  Private
const getQuizHistory = async (req, res, next) => {
  try {
    const { quizId } = req.query;
    const history = await CourseService.getQuizHistory(req.user._id, quizId);
    return sendSuccess(res, history, 'Quiz history retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get quiz statistics
// @route   GET /api/quizzes/statistics
// @access  Private
const getQuizStatistics = async (req, res, next) => {
  try {
    const { quizId } = req.query;
    const stats = await CourseService.getQuizStatistics(req.user._id, quizId);
    return sendSuccess(res, stats, 'Quiz statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get quiz attempt by ID
// @route   GET /api/quizzes/attempts/:id
// @access  Private
const getQuizAttemptById = async (req, res, next) => {
  try {
    const attempt = await CourseService.getQuizAttemptById(req.params.id, req.user._id);
    return sendSuccess(res, attempt, 'Quiz attempt retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// ─── Sprint 7 Phase 4: Certificate Controllers ───────────────────────────────

// @desc    Generate certificate for completed course
// @route   GET /api/courses/:id/certificate
// @access  Private
const generateCertificate = async (req, res, next) => {
  try {
    const certificate = await CourseService.generateCertificate(req.params.id, req.user._id);
    return sendSuccess(res, certificate, 'Certificate generated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Verify certificate by number
// @route   GET /api/certificates/:certificateNumber
// @access  Public
const verifyCertificate = async (req, res, next) => {
  try {
    const certificate = await CourseService.verifyCertificate(req.params.certificateNumber);
    return sendSuccess(res, certificate, 'Certificate verified successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get user certificates
// @route   GET /api/certificates
// @access  Private
const getUserCertificates = async (req, res, next) => {
  try {
    const certificates = await CourseService.getUserCertificates(req.user._id);
    return sendSuccess(res, certificates, 'Certificates retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
  markLessonComplete,
  getCourseProgress,
  getDashboardProgress,
  getQuizById,
  submitQuiz,
  getQuizHistory,
  getQuizStatistics,
  getQuizAttemptById,
  generateCertificate,
  verifyCertificate,
  getUserCertificates,
};
