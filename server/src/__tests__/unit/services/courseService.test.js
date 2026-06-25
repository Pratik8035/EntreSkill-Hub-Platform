'use strict';

/**
 * Unit Tests — CourseService (Sprint 7 Phase 1, 2, 3 & 4)
 */

require('../../setup');
const mongoose = require('mongoose');
const Course = require('../../../models/Course');
const Module = require('../../../models/Module');
const Lesson = require('../../../models/Lesson');
const Quiz = require('../../../models/Quiz');
const UserCourseProgress = require('../../../models/UserCourseProgress');
const QuizAttempt = require('../../../models/QuizAttempt');
const Certificate = require('../../../models/Certificate');
const CourseService = require('../../../services/courseService');

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function createCourse(overrides = {}) {
  return Course.create({
    title: 'Test Course',
    description: 'Test course description',
    category: 'Entrepreneurship',
    difficultyLevel: 'Beginner',
    estimatedDuration: 60,
    isPublished: true,
    ...overrides,
  });
}

async function createModule(courseId, overrides = {}) {
  return Module.create({
    courseId,
    title: 'Test Module',
    description: 'Test module description',
    order: 1,
    ...overrides,
  });
}

async function createLesson(moduleId, overrides = {}) {
  return Lesson.create({
    moduleId,
    title: 'Test Lesson',
    content: 'Test lesson content',
    duration: 15,
    order: 1,
    ...overrides,
  });
}

async function createQuiz(lessonId, overrides = {}) {
  return Quiz.create({
    lessonId,
    title: 'Test Quiz',
    questions: [
      {
        question: 'Test question?',
        options: ['Option A', 'Option B', 'Option C'],
        correctAnswer: 0,
      },
    ],
    ...overrides,
  });
}

// ─── getCourses ──────────────────────────────────────────────────────────────

describe('CourseService.getCourses', () => {
  it('returns all courses with default pagination', async () => {
    await createCourse({ title: 'Course A' });
    await createCourse({ title: 'Course B' });

    const result = await CourseService.getCourses();

    expect(result.courses.length).toBe(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it('filters by category', async () => {
    await createCourse({ title: 'Entrepreneurship Course', category: 'Entrepreneurship' });
    await createCourse({ title: 'Marketing Course', category: 'Digital Marketing' });

    const result = await CourseService.getCourses({ category: 'Entrepreneurship' });

    expect(result.courses.length).toBe(1);
    expect(result.courses[0].title).toBe('Entrepreneurship Course');
  });

  it('filters by difficultyLevel', async () => {
    await createCourse({ title: 'Beginner Course', difficultyLevel: 'Beginner' });
    await createCourse({ title: 'Advanced Course', difficultyLevel: 'Advanced' });

    const result = await CourseService.getCourses({ difficultyLevel: 'Beginner' });

    expect(result.courses.length).toBe(1);
    expect(result.courses[0].title).toBe('Beginner Course');
  });

  it('filters by isPublished', async () => {
    await createCourse({ title: 'Published Course', isPublished: true });
    await createCourse({ title: 'Draft Course', isPublished: false });

    const result = await CourseService.getCourses({ isPublished: true });

    expect(result.courses.length).toBe(1);
    expect(result.courses[0].title).toBe('Published Course');
  });

  it('paginates results correctly', async () => {
    for (let i = 1; i <= 7; i++) {
      await createCourse({ title: `Course ${i}` });
    }

    const page1 = await CourseService.getCourses({ page: 1, limit: 3 });
    const page2 = await CourseService.getCourses({ page: 2, limit: 3 });
    const page3 = await CourseService.getCourses({ page: 3, limit: 3 });

    expect(page1.courses.length).toBe(3);
    expect(page2.courses.length).toBe(3);
    expect(page3.courses.length).toBe(1);
    expect(page1.total).toBe(7);
  });

  it('returns empty result when no courses exist', async () => {
    const result = await CourseService.getCourses();
    expect(result.courses).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});

// ─── getCourseById ─────────────────────────────────────────────────────────────

describe('CourseService.getCourseById', () => {
  it('returns course when found', async () => {
    const course = await createCourse({ title: 'Startup Basics' });
    const found = await CourseService.getCourseById(course._id.toString());
    expect(found.title).toBe('Startup Basics');
  });

  it('throws 404 AppError when course does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(CourseService.getCourseById(fakeId)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// ─── getCourseModules ─────────────────────────────────────────────────────────

describe('CourseService.getCourseModules', () => {
  it('returns modules for a course sorted by order', async () => {
    const course = await createCourse();
    await createModule(course._id, { title: 'Module 2', order: 2 });
    await createModule(course._id, { title: 'Module 1', order: 1 });

    const modules = await CourseService.getCourseModules(course._id.toString());

    expect(modules.length).toBe(2);
    expect(modules[0].title).toBe('Module 1');
    expect(modules[1].title).toBe('Module 2');
  });

  it('throws 404 when course does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(CourseService.getCourseModules(fakeId)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('returns empty array when course has no modules', async () => {
    const course = await createCourse();
    const modules = await CourseService.getCourseModules(course._id.toString());
    expect(modules).toHaveLength(0);
  });
});

// ─── getLessonById ─────────────────────────────────────────────────────────────

describe('CourseService.getLessonById', () => {
  it('returns lesson with quiz when found', async () => {
    const course = await createCourse();
    const module = await createModule(course._id);
    const lesson = await createLesson(module._id);
    const quiz = await createQuiz(lesson._id);

    const result = await CourseService.getLessonById(lesson._id.toString());

    expect(result.lesson.title).toBe('Test Lesson');
    expect(result.quiz).toBeTruthy();
    expect(result.quiz.title).toBe('Test Quiz');
  });

  it('returns lesson without quiz when quiz does not exist', async () => {
    const course = await createCourse();
    const module = await createModule(course._id);
    const lesson = await createLesson(module._id);

    const result = await CourseService.getLessonById(lesson._id.toString());

    expect(result.lesson.title).toBe('Test Lesson');
    expect(result.quiz).toBeNull();
  });

  it('throws 404 when lesson does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(CourseService.getLessonById(fakeId)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// ─── createCourse ───────────────────────────────────────────────────────────────

describe('CourseService.createCourse', () => {
  it('creates a new course', async () => {
    const courseData = {
      title: 'New Course',
      description: 'New description',
      category: 'Business Planning',
      difficultyLevel: 'Intermediate',
      estimatedDuration: 120,
      isPublished: true,
    };

    const course = await CourseService.createCourse(courseData);

    expect(course.title).toBe('New Course');
    expect(course.category).toBe('Business Planning');
    expect(course.isPublished).toBe(true);
  });
});

// ─── updateCourse ───────────────────────────────────────────────────────────────

describe('CourseService.updateCourse', () => {
  it('updates an existing course', async () => {
    const course = await createCourse({ title: 'Old Title' });

    const updated = await CourseService.updateCourse(course._id.toString(), {
      title: 'New Title',
      isPublished: false,
    });

    expect(updated.title).toBe('New Title');
    expect(updated.isPublished).toBe(false);
  });

  it('throws 404 when course does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(
      CourseService.updateCourse(fakeId, { title: 'New Title' })
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// ─── deleteCourse ───────────────────────────────────────────────────────────────

describe('CourseService.deleteCourse', () => {
  it('deletes course and associated modules, lessons, and quizzes', async () => {
    const course = await createCourse();
    const module = await createModule(course._id);
    const lesson = await createLesson(module._id);
    await createQuiz(lesson._id);

    await CourseService.deleteCourse(course._id.toString());

    const deletedCourse = await Course.findById(course._id);
    const deletedModule = await Module.findById(module._id);
    const deletedLesson = await Lesson.findById(lesson._id);
    const deletedQuiz = await Quiz.findOne({ lessonId: lesson._id });

    expect(deletedCourse).toBeNull();
    expect(deletedModule).toBeNull();
    expect(deletedLesson).toBeNull();
    expect(deletedQuiz).toBeNull();
  });

  it('throws 404 when course does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(CourseService.deleteCourse(fakeId)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// ─── createModule ──────────────────────────────────────────────────────────────

describe('CourseService.createModule', () => {
  it('creates a new module for a course', async () => {
    const course = await createCourse();

    const moduleData = {
      courseId: course._id,
      title: 'New Module',
      description: 'New module description',
      order: 1,
    };

    const module = await CourseService.createModule(moduleData);

    expect(module.title).toBe('New Module');
    expect(module.courseId.toString()).toBe(course._id.toString());
  });

  it('throws 404 when course does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(
      CourseService.createModule({
        courseId: fakeId,
        title: 'Test Module',
        order: 1,
      })
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// ─── createLesson ──────────────────────────────────────────────────────────────

describe('CourseService.createLesson', () => {
  it('creates a new lesson for a module', async () => {
    const course = await createCourse();
    const module = await createModule(course._id);

    const lessonData = {
      moduleId: module._id,
      title: 'New Lesson',
      content: 'New lesson content',
      duration: 20,
      order: 1,
    };

    const lesson = await CourseService.createLesson(lessonData);

    expect(lesson.title).toBe('New Lesson');
    expect(lesson.moduleId.toString()).toBe(module._id.toString());
  });

  it('throws 404 when module does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(
      CourseService.createLesson({
        moduleId: fakeId,
        title: 'Test Lesson',
        order: 1,
      })
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// ─── createQuiz ────────────────────────────────────────────────────────────────

describe('CourseService.createQuiz', () => {
  it('creates a new quiz for a lesson', async () => {
    const course = await createCourse();
    const module = await createModule(course._id);
    const lesson = await createLesson(module._id);

    const quizData = {
      lessonId: lesson._id,
      title: 'New Quiz',
      questions: [
        {
          question: 'Test question?',
          options: ['A', 'B', 'C'],
          correctAnswer: 1,
        },
      ],
    };

    const quiz = await CourseService.createQuiz(quizData);

    expect(quiz.title).toBe('New Quiz');
    expect(quiz.lessonId.toString()).toBe(lesson._id.toString());
    expect(quiz.questions.length).toBe(1);
  });

  it('throws 400 when correctAnswer is out of bounds', async () => {
    const course = await createCourse();
    const module = await createModule(course._id);
    const lesson = await createLesson(module._id);

    const quizData = {
      lessonId: lesson._id,
      title: 'Invalid Quiz',
      questions: [
        {
          question: 'Test question?',
          options: ['A', 'B'],
          correctAnswer: 5, // Out of bounds
        },
      ],
    };

    await expect(CourseService.createQuiz(quizData)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('throws 404 when lesson does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(
      CourseService.createQuiz({
        lessonId: fakeId,
        title: 'Test Quiz',
        questions: [
          {
            question: 'Test?',
            options: ['A', 'B'],
            correctAnswer: 0,
          },
        ],
      })
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// ─── Sprint 7 Phase 2: Progress Tracking Tests ───────────────────────────────

describe('CourseService.markLessonComplete', () => {
  it('creates a new progress record and marks lesson complete', async () => {
    const course = await createCourse();
    const module = await createModule(course._id);
    const lesson = await createLesson(module._id);
    const userId = new mongoose.Types.ObjectId();

    const progress = await CourseService.markLessonComplete(lesson._id.toString(), userId.toString());

    expect(progress.userId.toString()).toBe(userId.toString());
    expect(progress.courseId.toString()).toBe(course._id.toString());
    expect(progress.completedLessons).toContainEqual(lesson._id);
    expect(progress.progressPercentage).toBe(100);
    expect(progress.completedAt).toBeTruthy();
  });

  it('adds lesson to existing progress record', async () => {
    const course = await createCourse();
    const module = await createModule(course._id);
    const lesson1 = await createLesson(module._id, { order: 1 });
    const lesson2 = await createLesson(module._id, { order: 2 });
    const userId = new mongoose.Types.ObjectId();

    await CourseService.markLessonComplete(lesson1._id.toString(), userId.toString());
    const progress = await CourseService.markLessonComplete(lesson2._id.toString(), userId.toString());

    expect(progress.completedLessons.length).toBe(2);
    expect(progress.progressPercentage).toBe(100);
  });

  it('does not duplicate completed lessons', async () => {
    const course = await createCourse();
    const module = await createModule(course._id);
    const lesson = await createLesson(module._id);
    const userId = new mongoose.Types.ObjectId();

    await CourseService.markLessonComplete(lesson._id.toString(), userId.toString());
    const progress = await CourseService.markLessonComplete(lesson._id.toString(), userId.toString());

    expect(progress.completedLessons.length).toBe(1);
  });

  it('throws 404 when lesson does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const userId = new mongoose.Types.ObjectId();

    await expect(
      CourseService.markLessonComplete(fakeId, userId.toString())
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe('CourseService.getCourseProgress', () => {
  it('returns progress for a user with completed lessons', async () => {
    const course = await createCourse();
    const module = await createModule(course._id);
    const lesson1 = await createLesson(module._id, { order: 1 });
    const lesson2 = await createLesson(module._id, { order: 2 });
    const userId = new mongoose.Types.ObjectId();

    await CourseService.markLessonComplete(lesson1._id.toString(), userId.toString());

    const progress = await CourseService.getCourseProgress(course._id.toString(), userId.toString());

    expect(progress.completedLessons.length).toBe(1);
    expect(progress.totalLessons).toBe(2);
    expect(progress.progressPercentage).toBe(50);
    expect(progress.remainingLessons).toBe(1);
  });

  it('returns zero progress for new user', async () => {
    const course = await createCourse();
    const module = await createModule(course._id);
    await createLesson(module._id);
    const userId = new mongoose.Types.ObjectId();

    const progress = await CourseService.getCourseProgress(course._id.toString(), userId.toString());

    expect(progress.completedLessons).toHaveLength(0);
    expect(progress.progressPercentage).toBe(0);
  });

  it('calculates completed modules correctly', async () => {
    const course = await createCourse();
    const module1 = await createModule(course._id, { order: 1 });
    const module2 = await createModule(course._id, { order: 2 });
    const lesson1 = await createLesson(module1._id, { order: 1 });
    const lesson2 = await createLesson(module2._id, { order: 1 });
    const userId = new mongoose.Types.ObjectId();

    await CourseService.markLessonComplete(lesson1._id.toString(), userId.toString());

    const progress = await CourseService.getCourseProgress(course._id.toString(), userId.toString());

    expect(progress.completedModules).toBe(1);
  });

  it('throws 404 when course does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const userId = new mongoose.Types.ObjectId();

    await expect(
      CourseService.getCourseProgress(fakeId, userId.toString())
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe('CourseService.getDashboardProgress', () => {
  it('returns dashboard summary for user', async () => {
    const course1 = await createCourse({ title: 'Course 1' });
    const course2 = await createCourse({ title: 'Course 2' });
    const module1 = await createModule(course1._id);
    const module2 = await createModule(course2._id);
    const lesson1 = await createLesson(module1._id);
    const lesson2 = await createLesson(module2._id);
    const userId = new mongoose.Types.ObjectId();

    await CourseService.markLessonComplete(lesson1._id.toString(), userId.toString());
    await CourseService.markLessonComplete(lesson2._id.toString(), userId.toString());

    const summary = await CourseService.getDashboardProgress(userId.toString());

    expect(summary.enrolledCourses).toBe(2);
    expect(summary.completedCourses).toBe(2);
    expect(summary.averageProgress).toBe(100);
    expect(summary.recentLessons).toBeInstanceOf(Array);
  });

  it('returns empty summary for user with no progress', async () => {
    const userId = new mongoose.Types.ObjectId();

    const summary = await CourseService.getDashboardProgress(userId.toString());

    expect(summary.enrolledCourses).toBe(0);
    expect(summary.completedCourses).toBe(0);
    expect(summary.averageProgress).toBe(0);
    expect(summary.recentLessons).toHaveLength(0);
  });

  it('calculates average progress correctly', async () => {
    const course1 = await createCourse({ title: 'Course 1' });
    const course2 = await createCourse({ title: 'Course 2' });
    const module1 = await createModule(course1._id);
    const module2 = await createModule(course2._id);
    const lesson1 = await createLesson(module1._id);
    const lesson2 = await createLesson(module2._id);
    const lesson3 = await createLesson(module2._id, { order: 2 });
    const userId = new mongoose.Types.ObjectId();

    await CourseService.markLessonComplete(lesson1._id.toString(), userId.toString());
    await CourseService.markLessonComplete(lesson2._id.toString(), userId.toString());

    const summary = await CourseService.getDashboardProgress(userId.toString());

    expect(summary.enrolledCourses).toBe(2);
    expect(summary.averageProgress).toBe(75); // (100 + 50) / 2
  });
});

// ─── Sprint 7 Phase 3: Quiz Engine Tests ─────────────────────────────────────

describe('CourseService.getQuizById', () => {
  it('returns quiz without correct answers', async () => {
    const course = await createCourse();
    const module = await createModule(course._id);
    const lesson = await createLesson(module._id);
    const quiz = await createQuiz(lesson._id);

    const quizWithoutAnswers = await CourseService.getQuizById(quiz._id.toString());

    expect(quizWithoutAnswers.title).toBe('Test Quiz');
    expect(quizWithoutAnswers.questions.length).toBe(1);
    expect(quizWithoutAnswers.questions[0]).toHaveProperty('question');
    expect(quizWithoutAnswers.questions[0]).toHaveProperty('options');
    expect(quizWithoutAnswers.questions[0]).not.toHaveProperty('correctAnswer');
  });

  it('throws 404 when quiz does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(CourseService.getQuizById(fakeId)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe('CourseService.submitQuiz', () => {
  it('evaluates quiz answers and creates attempt', async () => {
    const course = await createCourse();
    const module = await createModule(course._id);
    const lesson = await createLesson(module._id);
    const quiz = await createQuiz(lesson._id);
    const userId = new mongoose.Types.ObjectId();

    const answers = [0]; // Correct answer
    const attempt = await CourseService.submitQuiz(quiz._id.toString(), userId.toString(), answers);

    expect(attempt.userId.toString()).toBe(userId.toString());
    expect(attempt.quizId.toString()).toBe(quiz._id.toString());
    expect(attempt.score).toBe(1);
    expect(attempt.percentage).toBe(100);
    expect(attempt.passed).toBe(true);
    expect(attempt.answers[0].isCorrect).toBe(true);
  });

  it('calculates percentage correctly for partial score', async () => {
    const course = await createCourse();
    const module = await createModule(course._id);
    const lesson = await createLesson(module._id);
    const quiz = await Quiz.create({
      lessonId: lesson._id,
      title: 'Test Quiz',
      questions: [
        { question: 'Q1?', options: ['A', 'B', 'C'], correctAnswer: 0 },
        { question: 'Q2?', options: ['A', 'B', 'C'], correctAnswer: 1 },
      ],
    });
    const userId = new mongoose.Types.ObjectId();

    const answers = [0, 0]; // One correct, one wrong
    const attempt = await CourseService.submitQuiz(quiz._id.toString(), userId.toString(), answers);

    expect(attempt.score).toBe(1);
    expect(attempt.percentage).toBe(50);
    expect(attempt.passed).toBe(false);
  });

  it('sets passed to false when percentage < 70', async () => {
    const course = await createCourse();
    const module = await createModule(course._id);
    const lesson = await createLesson(module._id);
    const quiz = await Quiz.create({
      lessonId: lesson._id,
      title: 'Test Quiz',
      questions: [
        { question: 'Q1?', options: ['A', 'B', 'C'], correctAnswer: 0 },
        { question: 'Q2?', options: ['A', 'B', 'C'], correctAnswer: 1 },
        { question: 'Q3?', options: ['A', 'B', 'C'], correctAnswer: 2 },
      ],
    });
    const userId = new mongoose.Types.ObjectId();

    const answers = [0, 0, 0]; // Only 1 correct out of 3 = 33%
    const attempt = await CourseService.submitQuiz(quiz._id.toString(), userId.toString(), answers);

    expect(attempt.percentage).toBe(33);
    expect(attempt.passed).toBe(false);
  });

  it('throws 400 when answers length does not match questions', async () => {
    const course = await createCourse();
    const module = await createModule(course._id);
    const lesson = await createLesson(module._id);
    const quiz = await createQuiz(lesson._id);
    const userId = new mongoose.Types.ObjectId();

    const answers = []; // Empty array
    await expect(
      CourseService.submitQuiz(quiz._id.toString(), userId.toString(), answers)
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('throws 404 when quiz does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const userId = new mongoose.Types.ObjectId();

    await expect(
      CourseService.submitQuiz(fakeId, userId.toString(), [0])
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe('CourseService.getQuizHistory', () => {
  it('returns quiz attempts for a user', async () => {
    const course = await createCourse();
    const module = await createModule(course._id);
    const lesson = await createLesson(module._id);
    const quiz = await createQuiz(lesson._id);
    const userId = new mongoose.Types.ObjectId();

    await CourseService.submitQuiz(quiz._id.toString(), userId.toString(), [0]);
    await CourseService.submitQuiz(quiz._id.toString(), userId.toString(), [0]);

    const history = await CourseService.getQuizHistory(userId.toString());

    expect(history.length).toBe(2);
  });

  it('returns empty array for user with no attempts', async () => {
    const userId = new mongoose.Types.ObjectId();

    const history = await CourseService.getQuizHistory(userId.toString());

    expect(history).toHaveLength(0);
  });

  it('filters by quizId when provided', async () => {
    const course = await createCourse();
    const module = await createModule(course._id);
    const lesson = await createLesson(module._id);
    const lesson2 = await createLesson(module._id, { order: 2 });
    const quiz1 = await createQuiz(lesson._id);
    const quiz2 = await createQuiz(lesson2._id);
    const userId = new mongoose.Types.ObjectId();

    await CourseService.submitQuiz(quiz1._id.toString(), userId.toString(), [0]);
    await CourseService.submitQuiz(quiz2._id.toString(), userId.toString(), [0]);

    const history = await CourseService.getQuizHistory(userId.toString(), quiz1._id.toString());

    expect(history.length).toBe(1);
    expect(history[0].quizId.toString()).toBe(quiz1._id.toString());
  });
});

describe('CourseService.getQuizStatistics', () => {
  it('returns statistics for user with attempts', async () => {
    const course = await createCourse();
    const module = await createModule(course._id);
    const lesson = await createLesson(module._id);
    const quiz = await createQuiz(lesson._id);
    const userId = new mongoose.Types.ObjectId();

    await CourseService.submitQuiz(quiz._id.toString(), userId.toString(), [0]); // 100%
    await CourseService.submitQuiz(quiz._id.toString(), userId.toString(), [1]); // 0%

    const stats = await CourseService.getQuizStatistics(userId.toString());

    expect(stats.attempts).toBe(2);
    expect(stats.averageScore).toBe(50);
    expect(stats.bestScore).toBe(100);
    expect(stats.passRate).toBe(50);
  });

  it('returns zero stats for user with no attempts', async () => {
    const userId = new mongoose.Types.ObjectId();

    const stats = await CourseService.getQuizStatistics(userId.toString());

    expect(stats.attempts).toBe(0);
    expect(stats.averageScore).toBe(0);
    expect(stats.bestScore).toBe(0);
    expect(stats.passRate).toBe(0);
  });
});

describe('CourseService.getQuizAttemptById', () => {
  it('returns attempt for valid id and user', async () => {
    const course = await createCourse();
    const module = await createModule(course._id);
    const lesson = await createLesson(module._id);
    const quiz = await createQuiz(lesson._id);
    const userId = new mongoose.Types.ObjectId();

    const attempt = await CourseService.submitQuiz(quiz._id.toString(), userId.toString(), [0]);
    const found = await CourseService.getQuizAttemptById(attempt._id.toString(), userId.toString());

    expect(found._id.toString()).toBe(attempt._id.toString());
  });

  it('throws 404 when attempt does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const userId = new mongoose.Types.ObjectId();

    await expect(
      CourseService.getQuizAttemptById(fakeId, userId.toString())
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// ─── Sprint 7 Phase 4: Certificate Tests ─────────────────────────────────────

describe('CourseService.generateCertificateNumber', () => {
  it('generates certificate number in correct format', async () => {
    const certNumber = await CourseService.generateCertificateNumber();
    const year = new Date().getFullYear();
    const regex = new RegExp(`^ESH-${year}-\\d{5}$`);
    expect(certNumber).toMatch(regex);
  });

  it('increments certificate number for subsequent calls', async () => {
    const course = await createCourse();
    const userId = new mongoose.Types.ObjectId();
    
    // Create a certificate with the first number
    const first = await CourseService.generateCertificateNumber();
    await Certificate.create({
      userId,
      courseId: course._id,
      certificateNumber: first,
      completionPercentage: 100,
      finalScore: 100,
    });
    
    const second = await CourseService.generateCertificateNumber();
    const firstNum = parseInt(first.split('-')[2], 10);
    const secondNum = parseInt(second.split('-')[2], 10);
    expect(secondNum).toBe(firstNum + 1);
  });
});

describe('CourseService.generateCertificate', () => {
  it('generates certificate when course is 100% complete and quiz passed', async () => {
    const course = await createCourse();
    const module = await createModule(course._id);
    const lesson = await createLesson(module._id);
    const quiz = await createQuiz(lesson._id);
    const userId = new mongoose.Types.ObjectId();

    // Mark lesson complete (100% progress)
    await CourseService.markLessonComplete(lesson._id.toString(), userId.toString());
    // Pass quiz
    await CourseService.submitQuiz(quiz._id.toString(), userId.toString(), [0]);

    const certificate = await CourseService.generateCertificate(course._id.toString(), userId.toString());

    expect(certificate.userId.toString()).toBe(userId.toString());
    expect(certificate.courseId.toString()).toBe(course._id.toString());
    expect(certificate.certificateNumber).toMatch(/^ESH-\d{4}-\d{5}$/);
    expect(certificate.completionPercentage).toBe(100);
  });

  it('throws 400 when certificate already exists', async () => {
    const course = await createCourse();
    const module = await createModule(course._id);
    const lesson = await createLesson(module._id);
    const quiz = await createQuiz(lesson._id);
    const userId = new mongoose.Types.ObjectId();

    await CourseService.markLessonComplete(lesson._id.toString(), userId.toString());
    await CourseService.submitQuiz(quiz._id.toString(), userId.toString(), [0]);
    await CourseService.generateCertificate(course._id.toString(), userId.toString());

    await expect(
      CourseService.generateCertificate(course._id.toString(), userId.toString())
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('throws 400 when course is not 100% complete', async () => {
    const course = await createCourse();
    const module = await createModule(course._id);
    const lesson = await createLesson(module._id);
    const lesson2 = await createLesson(module._id, { order: 2 });
    const quiz = await createQuiz(lesson._id);
    const userId = new mongoose.Types.ObjectId();

    // Only complete one lesson (50% progress)
    await CourseService.markLessonComplete(lesson._id.toString(), userId.toString());
    await CourseService.submitQuiz(quiz._id.toString(), userId.toString(), [0]);

    await expect(
      CourseService.generateCertificate(course._id.toString(), userId.toString())
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('throws 400 when quiz is not passed', async () => {
    const course = await createCourse();
    const module = await createModule(course._id);
    const lesson = await createLesson(module._id);
    const quiz = await createQuiz(lesson._id);
    const userId = new mongoose.Types.ObjectId();

    await CourseService.markLessonComplete(lesson._id.toString(), userId.toString());
    // Fail quiz (wrong answer)
    await CourseService.submitQuiz(quiz._id.toString(), userId.toString(), [1]);

    await expect(
      CourseService.generateCertificate(course._id.toString(), userId.toString())
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('throws 404 when course does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const userId = new mongoose.Types.ObjectId();

    await expect(
      CourseService.generateCertificate(fakeId, userId.toString())
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe('CourseService.verifyCertificate', () => {
  it('returns certificate data for valid certificate number', async () => {
    const course = await createCourse({ title: 'Test Course Title' });
    const module = await createModule(course._id);
    const lesson = await createLesson(module._id);
    const quiz = await createQuiz(lesson._id);
    const userId = new mongoose.Types.ObjectId();

    await CourseService.markLessonComplete(lesson._id.toString(), userId.toString());
    await CourseService.submitQuiz(quiz._id.toString(), userId.toString(), [0]);
    const certificate = await CourseService.generateCertificate(course._id.toString(), userId.toString());

    const verified = await CourseService.verifyCertificate(certificate.certificateNumber);

    expect(verified.certificateNumber).toBe(certificate.certificateNumber);
    expect(verified.courseName).toBe('Test Course Title');
    expect(verified.completionPercentage).toBe(100);
    expect(verified.userId.toString()).toBe(userId.toString());
  });

  it('throws 404 for invalid certificate number', async () => {
    await expect(
      CourseService.verifyCertificate('ESH-2026-00000')
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe('CourseService.getUserCertificates', () => {
  it('returns user certificates', async () => {
    const course1 = await createCourse({ title: 'Course 1' });
    const course2 = await createCourse({ title: 'Course 2' });
    const module1 = await createModule(course1._id);
    const module2 = await createModule(course2._id);
    const lesson1 = await createLesson(module1._id);
    const lesson2 = await createLesson(module2._id);
    const quiz1 = await createQuiz(lesson1._id);
    const quiz2 = await createQuiz(lesson2._id);
    const userId = new mongoose.Types.ObjectId();

    await CourseService.markLessonComplete(lesson1._id.toString(), userId.toString());
    await CourseService.submitQuiz(quiz1._id.toString(), userId.toString(), [0]);
    await CourseService.generateCertificate(course1._id.toString(), userId.toString());

    await CourseService.markLessonComplete(lesson2._id.toString(), userId.toString());
    await CourseService.submitQuiz(quiz2._id.toString(), userId.toString(), [0]);
    await CourseService.generateCertificate(course2._id.toString(), userId.toString());

    const certificates = await CourseService.getUserCertificates(userId.toString());

    expect(certificates.length).toBe(2);
    expect(certificates[0].courseName).toBe('Course 2'); // Most recent first
    expect(certificates[1].courseName).toBe('Course 1');
  });

  it('returns empty array for user with no certificates', async () => {
    const userId = new mongoose.Types.ObjectId();

    const certificates = await CourseService.getUserCertificates(userId.toString());

    expect(certificates).toHaveLength(0);
  });
});
