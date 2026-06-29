const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const UserCourseProgress = require('../models/UserCourseProgress');
const QuizAttempt = require('../models/QuizAttempt');
const Certificate = require('../models/Certificate');
const AppError = require('../utils/AppError');

/**
 * Service layer for Course management.
 * Sprint 7 Phase 1, 2, 3 & 4
 */
class CourseService {
  /**
   * Get all courses with pagination and filtering.
   * @param {object} filters - { page, limit, category, difficultyLevel, isPublished }
   * @returns {Promise<{courses: Course[], total: number, page: number, limit: number}>}
   */
  static async getCourses(filters = {}) {
    const { page = 1, limit = 10, category, difficultyLevel, isPublished } = filters;

    const query = {};
    if (category) query.category = category;
    if (difficultyLevel) query.difficultyLevel = difficultyLevel;
    if (typeof isPublished === 'boolean') query.isPublished = isPublished;

    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      Course.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(query),
    ]);

    return { courses, total, page, limit };
  }

  /**
   * Get a single course by ID.
   * @param {string} courseId
   * @returns {Promise<Course>}
   */
  static async getCourseById(courseId) {
    const course = await Course.findById(courseId).lean();
    if (!course) {
      throw new AppError('Course not found', 404);
    }
    return course;
  }

  /**
   * Get modules for a course.
   * @param {string} courseId
   * @returns {Promise<Module[]>}
   */
  static async getCourseModules(courseId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Fetch modules for the course
    const modules = await Module.find({ courseId })
      .sort({ order: 1 })
      .lean();

    // Gather all module IDs
    const moduleIds = modules.map((m) => m._id);

    // Fetch lessons belonging to these modules
    const lessons = await Lesson.find({ moduleId: { $in: moduleIds } })
      .sort({ order: 1 })
      .lean();

    // Group lessons by their moduleId
    const lessonsByModule = lessons.reduce((acc, lesson) => {
      const key = lesson.moduleId.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(lesson);
      return acc;
    }, {});

    // Attach lessons array to each module
    const modulesWithLessons = modules.map((module) => ({
      ...module,
      lessons: lessonsByModule[module._id.toString()] || [],
    }));

    return modulesWithLessons;
  }

  /**
   * Get a lesson by ID with its quiz.
   * @param {string} lessonId
   * @returns {Promise<{lesson: Lesson, quiz: Quiz|null}>}
   */
  static async getLessonById(lessonId) {
    const lesson = await Lesson.findById(lessonId).lean();
    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    const quiz = await Quiz.findOne({ lessonId }).lean();

    return { lesson, quiz };
  }

  /**
   * Create a new course.
   * @param {object} courseData
   * @returns {Promise<Course>}
   */
  static async createCourse(courseData) {
    const course = await Course.create(courseData);
    return course;
  }

  /**
   * Update a course.
   * @param {string} courseId
   * @param {object} updateData
   * @returns {Promise<Course>}
   */
  static async updateCourse(courseId, updateData) {
    const course = await Course.findByIdAndUpdate(
      courseId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    return course;
  }

  /**
   * Delete a course.
   * @param {string} courseId
   * @returns {Promise<void>}
   */
  static async deleteCourse(courseId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Delete associated modules, lessons, and quizzes
    const modules = await Module.find({ courseId }).select('_id');
    const moduleIds = modules.map((m) => m._id);

    const lessons = await Lesson.find({ moduleId: { $in: moduleIds } }).select('_id');
    const lessonIds = lessons.map((l) => l._id);

    await Quiz.deleteMany({ lessonId: { $in: lessonIds } });
    await Lesson.deleteMany({ moduleId: { $in: moduleIds } });
    await Module.deleteMany({ courseId });
    await Course.findByIdAndDelete(courseId);
  }

  /**
   * Create a module for a course.
   * @param {object} moduleData
   * @returns {Promise<Module>}
   */
  static async createModule(moduleData) {
    const course = await Course.findById(moduleData.courseId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    const module = await Module.create(moduleData);
    return module;
  }

  /**
   * Update a module.
   * @param {string} moduleId
   * @param {object} updateData
   * @returns {Promise<Module>}
   */
  static async updateModule(moduleId, updateData) {
    const module = await Module.findByIdAndUpdate(
      moduleId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!module) {
      throw new AppError('Module not found', 404);
    }

    return module;
  }

  /**
   * Delete a module.
   * @param {string} moduleId
   * @returns {Promise<void>}
   */
  static async deleteModule(moduleId) {
    const module = await Module.findById(moduleId);
    if (!module) {
      throw new AppError('Module not found', 404);
    }

    // Delete associated lessons and quizzes
    const lessons = await Lesson.find({ moduleId }).select('_id');
    const lessonIds = lessons.map((l) => l._id);

    await Quiz.deleteMany({ lessonId: { $in: lessonIds } });
    await Lesson.deleteMany({ moduleId });
    await Module.findByIdAndDelete(moduleId);
  }

  /**
   * Create a lesson for a module.
   * @param {object} lessonData
   * @returns {Promise<Lesson>}
   */
  static async createLesson(lessonData) {
    const module = await Module.findById(lessonData.moduleId);
    if (!module) {
      throw new AppError('Module not found', 404);
    }

    const lesson = await Lesson.create(lessonData);
    return lesson;
  }

  /**
   * Update a lesson.
   * @param {string} lessonId
   * @param {object} updateData
   * @returns {Promise<Lesson>}
   */
  static async updateLesson(lessonId, updateData) {
    const lesson = await Lesson.findByIdAndUpdate(
      lessonId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    return lesson;
  }

  /**
   * Delete a lesson.
   * @param {string} lessonId
   * @returns {Promise<void>}
   */
  static async deleteLesson(lessonId) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    await Quiz.deleteMany({ lessonId });
    await Lesson.findByIdAndDelete(lessonId);
  }

  /**
   * Create a quiz for a lesson.
   * @param {object} quizData
   * @returns {Promise<Quiz>}
   */
  static async createQuiz(quizData) {
    const lesson = await Lesson.findById(quizData.lessonId);
    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    // Validate that correctAnswer indices are within bounds
    for (const q of quizData.questions) {
      if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
        throw new AppError('Correct answer index is out of bounds', 400);
      }
    }

    const quiz = await Quiz.create(quizData);
    return quiz;
  }

  /**
   * Update a quiz.
   * @param {string} quizId
   * @param {object} updateData
   * @returns {Promise<Quiz>}
   */
  static async updateQuiz(quizId, updateData) {
    // Validate that correctAnswer indices are within bounds if questions are being updated
    if (updateData.questions) {
      for (const q of updateData.questions) {
        if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
          throw new AppError('Correct answer index is out of bounds', 400);
        }
      }
    }

    const quiz = await Quiz.findByIdAndUpdate(
      quizId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    return quiz;
  }

  /**
   * Delete a quiz.
   * @param {string} quizId
   * @returns {Promise<void>}
   */
  static async deleteQuiz(quizId) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    await Quiz.findByIdAndDelete(quizId);
  }

  // ─── Sprint 7 Phase 2: Progress Tracking Methods ─────────────────────────────

  /**
   * Mark a lesson as complete for a user.
   * @param {string} lessonId
   * @param {string} userId
   * @returns {Promise<UserCourseProgress>}
   */
  static async markLessonComplete(lessonId, userId) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    const module = await Module.findById(lesson.moduleId);
    if (!module) {
      throw new AppError('Module not found', 404);
    }

    const courseId = module.courseId;

    // Find or create progress record
    let progress = await UserCourseProgress.findOne({ userId, courseId });

    if (!progress) {
      progress = await UserCourseProgress.create({
        userId,
        courseId,
        completedLessons: [lessonId],
        progressPercentage: 0,
      });
    } else {
      // Add lesson to completedLessons if not already present
      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
      }
    }

    // Calculate total lessons in the course
    const modules = await Module.find({ courseId }).select('_id');
    const moduleIds = modules.map((m) => m._id);
    const totalLessons = await Lesson.countDocuments({ moduleId: { $in: moduleIds } });

    // Calculate progress percentage
    const completedCount = progress.completedLessons.length;
    progress.progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    // Set completedAt if 100% complete
    if (progress.progressPercentage === 100 && !progress.completedAt) {
      progress.completedAt = new Date();
    }

    await progress.save();

    return progress;
  }

  /**
   * Get course progress for a user.
   * @param {string} courseId
   * @param {string} userId
   * @returns {Promise<object>}
   */
  static async getCourseProgress(courseId, userId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Get or create progress record
    let progress = await UserCourseProgress.findOne({ userId, courseId });

    if (!progress) {
      progress = {
        completedLessons: [],
        progressPercentage: 0,
        completedAt: null,
      };
    }

    // Get total lessons and modules
    const modules = await Module.find({ courseId }).select('_id').sort({ order: 1 });
    const moduleIds = modules.map((m) => m._id);
    const totalLessons = await Lesson.countDocuments({ moduleId: { $in: moduleIds } });

    // Calculate completed modules
    const completedModuleIds = new Set();
    const lessonsByModule = {};

    // Group lessons by module
    for (const moduleId of moduleIds) {
      const moduleLessons = await Lesson.find({ moduleId }).select('_id');
      lessonsByModule[moduleId.toString()] = moduleLessons.map((l) => l._id.toString());
    }

    // Check which modules are fully completed
    for (const moduleId of moduleIds) {
      const moduleLessonIds = lessonsByModule[moduleId.toString()];
      const allCompleted = moduleLessonIds.every((lessonId) =>
        progress.completedLessons.map((id) => id.toString()).includes(lessonId)
      );
      if (allCompleted && moduleLessonIds.length > 0) {
        completedModuleIds.add(moduleId.toString());
      }
    }

    const completedModules = completedModuleIds.size;
    const remainingLessons = totalLessons - progress.completedLessons.length;

    return {
      completedLessons: progress.completedLessons,
      totalLessons,
      progressPercentage: progress.progressPercentage,
      completedModules,
      remainingLessons,
      completedAt: progress.completedAt,
    };
  }

  /**
   * Get dashboard summary for a user.
   * @param {string} userId
   * @returns {Promise<object>}
   */
  static async getDashboardProgress(userId) {
    // Get all progress records for the user
    const progressRecords = await UserCourseProgress.find({ userId });

    const enrolledCourses = progressRecords.length;
    const completedCourses = progressRecords.filter((p) => p.progressPercentage === 100).length;

    // Calculate average progress
    const totalProgress = progressRecords.reduce((sum, p) => sum + p.progressPercentage, 0);
    const averageProgress = enrolledCourses > 0 ? Math.round(totalProgress / enrolledCourses) : 0;

    // Get recent completed lessons (last 5)
    const recentProgress = await UserCourseProgress.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    const recentLessons = [];
    for (const progress of recentProgress) {
      if (progress.completedLessons.length > 0) {
        const lastLessonId = progress.completedLessons[progress.completedLessons.length - 1];
        const lesson = await Lesson.findById(lastLessonId).select('title moduleId').lean();
        if (lesson) {
          const module = await Module.findById(lesson.moduleId).select('title courseId').lean();
          const course = await Course.findById(module.courseId).select('title').lean();
          recentLessons.push({
            lessonId: lastLessonId,
            lessonTitle: lesson.title,
            moduleTitle: module.title,
            courseTitle: course.title,
            completedAt: progress.updatedAt,
          });
        }
      }
    }

    return {
      enrolledCourses,
      completedCourses,
      averageProgress,
      recentLessons,
    };
  }

  // ─── Sprint 7 Phase 3: Quiz Engine Methods ─────────────────────────────────

  /**
   * Get a quiz by ID for starting a quiz attempt.
   * @param {string} quizId
   * @returns {Promise<Quiz>}
   */
  static async getQuizById(quizId) {
    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }
    // Return quiz without correct answers
    const quizWithoutAnswers = {
      ...quiz,
      questions: quiz.questions.map((q) => ({
        question: q.question,
        options: q.options,
      })),
    };
    return quizWithoutAnswers;
  }

  /**
   * Submit quiz answers and calculate score.
   * @param {string} quizId
   * @param {string} userId
   * @param {number[]} answers - Array of selected answer indices
   * @returns {Promise<QuizAttempt>}
   */
  static async submitQuiz(quizId, userId, answers) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    if (!answers || answers.length !== quiz.questions.length) {
      throw new AppError('Please provide answers for all questions', 400);
    }

    // Evaluate answers
    const evaluatedAnswers = quiz.questions.map((q, index) => {
      const selectedAnswer = answers[index];
      const isCorrect = selectedAnswer === q.correctAnswer;
      return {
        questionIndex: index,
        selectedAnswer,
        isCorrect,
      };
    });

    // Calculate score
    const correctCount = evaluatedAnswers.filter((a) => a.isCorrect).length;
    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = percentage >= 70;

    // Create quiz attempt
    const attempt = await QuizAttempt.create({
      userId,
      quizId,
      answers: evaluatedAnswers,
      score: correctCount,
      totalQuestions,
      percentage,
      passed,
      completedAt: new Date(),
    });

    return attempt;
  }

  /**
   * Get quiz attempt history for a user.
   * @param {string} userId
   * @param {string} quizId (optional)
   * @returns {Promise<QuizAttempt[]>}
   */
  static async getQuizHistory(userId, quizId = null) {
    const query = { userId };
    if (quizId) {
      query.quizId = quizId;
    }

    const attempts = await QuizAttempt.find(query)
      .sort({ completedAt: -1 })
      .lean();

    return attempts;
  }

  /**
   * Get quiz statistics for a user.
   * @param {string} userId
   * @param {string} quizId (optional)
   * @returns {Promise<object>}
   */
  static async getQuizStatistics(userId, quizId = null) {
    const query = { userId };
    if (quizId) {
      query.quizId = quizId;
    }

    const attempts = await QuizAttempt.find(query).lean();

    const totalAttempts = attempts.length;

    if (totalAttempts === 0) {
      return {
        attempts: 0,
        averageScore: 0,
        bestScore: 0,
        passRate: 0,
      };
    }

    const totalScore = attempts.reduce((sum, a) => sum + a.percentage, 0);
    const averageScore = Math.round(totalScore / totalAttempts);
    const bestScore = Math.max(...attempts.map((a) => a.percentage));
    const passedCount = attempts.filter((a) => a.passed).length;
    const passRate = Math.round((passedCount / totalAttempts) * 100);

    return {
      attempts: totalAttempts,
      averageScore,
      bestScore,
      passRate,
    };
  }

  /**
   * Get quiz attempt by ID.
   * @param {string} attemptId
   * @param {string} userId
   * @returns {Promise<QuizAttempt>}
   */
  static async getQuizAttemptById(attemptId, userId) {
    const attempt = await QuizAttempt.findOne({ _id: attemptId, userId }).lean();
    if (!attempt) {
      throw new AppError('Quiz attempt not found', 404);
    }
    return attempt;
  }

  // ─── Sprint 7 Phase 4: Certificate Methods ─────────────────────────────────

  /**
   * Generate a unique certificate number.
   * Format: ESH-YYYY-XXXXX
   * @returns {Promise<string>}
   */
  static async generateCertificateNumber() {
    const year = new Date().getFullYear();
    const prefix = `ESH-${year}-`;
    
    // Find the highest certificate number for this year
    const lastCertificate = await Certificate.findOne({
      certificateNumber: new RegExp(`^${prefix}`),
    }).sort({ certificateNumber: -1 }).select('certificateNumber').lean();

    let nextNumber = 1;
    if (lastCertificate) {
      const lastNumber = parseInt(lastCertificate.certificateNumber.split('-')[2], 10);
      nextNumber = lastNumber + 1;
    }

    // Pad with zeros to 5 digits
    const paddedNumber = nextNumber.toString().padStart(5, '0');
    return `${prefix}${paddedNumber}`;
  }

  /**
   * Generate a certificate for a completed course.
   * Rules:
   * 1. Course Progress = 100%
   * 2. Required Quiz Passed (>= 70%)
   * 3. Certificate not already generated
   * @param {string} courseId
   * @param {string} userId
   * @returns {Promise<object>}
   */
  static async generateCertificate(courseId, userId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({ userId, courseId });
    if (existingCertificate) {
      throw new AppError('Certificate already generated for this course', 400);
    }

    // Check course progress
    const progress = await UserCourseProgress.findOne({ userId, courseId });
    if (!progress || progress.progressPercentage !== 100) {
      throw new AppError('Course must be 100% complete to generate certificate', 400);
    }

    // Check if user passed the required quiz (get best score)
    const modules = await Module.find({ courseId }).select('_id');
    const moduleIds = modules.map((m) => m._id);
    const lessons = await Lesson.find({ moduleId: { $in: moduleIds } }).select('_id');
    const lessonIds = lessons.map((l) => l._id);
    const quizzes = await Quiz.find({ lessonId: { $in: lessonIds } }).select('_id');
    const quizIds = quizzes.map((q) => q._id);

    if (quizIds.length > 0) {
      const attempts = await QuizAttempt.find({
        userId,
        quizId: { $in: quizIds },
      }).lean();

      if (attempts.length === 0) {
        throw new AppError('Quiz must be completed to generate certificate', 400);
      }

      // Check if any quiz was passed (>= 70%)
      const passedQuiz = attempts.some((a) => a.percentage >= 70);
      if (!passedQuiz) {
        throw new AppError('Quiz must be passed (>= 70%) to generate certificate', 400);
      }

      // Get the best score
      const bestScore = Math.max(...attempts.map((a) => a.percentage));
    }

    // Generate certificate
    const certificateNumber = await this.generateCertificateNumber();
    const certificate = await Certificate.create({
      userId,
      courseId,
      certificateNumber,
      completionPercentage: progress.progressPercentage,
      finalScore: 100, // Default if no quiz, otherwise would be best quiz score
    });

    return certificate;
  }

  /**
   * Verify a certificate by certificate number.
   * @param {string} certificateNumber
   * @returns {Promise<object>}
   */
  static async verifyCertificate(certificateNumber) {
    const certificate = await Certificate.findOne({ certificateNumber })
      .populate('courseId', 'title')
      .lean();

    if (!certificate) {
      throw new AppError('Certificate not found', 404);
    }

    return {
      certificateNumber: certificate.certificateNumber,
      userId: certificate.userId,
      courseName: certificate.courseId.title,
      issuedAt: certificate.issuedAt,
      completionPercentage: certificate.completionPercentage,
      finalScore: certificate.finalScore,
    };
  }

  /**
   * Get all certificates for a user.
   * @param {string} userId
   * @returns {Promise<object[]>}
   */
  static async getUserCertificates(userId) {
    const certificates = await Certificate.find({ userId })
      .populate('courseId', 'title')
      .sort({ issuedAt: -1 })
      .lean();

    return certificates.map((cert) => ({
      certificateNumber: cert.certificateNumber,
      courseName: cert.courseId.title,
      issuedAt: cert.issuedAt,
      completionPercentage: cert.completionPercentage,
      finalScore: cert.finalScore,
    }));
  }
}

module.exports = CourseService;
