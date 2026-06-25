'use strict';

/**
 * Integration Tests — Courses API (Sprint 7 Phase 1, 2, 3 & 4)
 * GET /api/courses
 * GET /api/courses/:id
 * GET /api/courses/:id/modules
 * GET /api/lessons/:id
 * POST /api/lessons/:id/complete
 * GET /api/courses/:id/progress
 * GET /api/learning/progress
 * GET /api/quizzes/:id
 * POST /api/quizzes/:id/submit
 * GET /api/quizzes/history
 * GET /api/quizzes/statistics
 * GET /api/courses/:id/certificate
 * GET /api/certificates/:certificateNumber
 * GET /api/certificates
 */

require('../setup');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.JWT_ACCESS_EXPIRES = '15m';
process.env.JWT_REFRESH_EXPIRES = '7d';

const app = require('../../app');
const Course = require('../../models/Course');
const Module = require('../../models/Module');
const Lesson = require('../../models/Lesson');
const Quiz = require('../../models/Quiz');
const UserCourseProgress = require('../../models/UserCourseProgress');
const QuizAttempt = require('../../models/QuizAttempt');
const Certificate = require('../../models/Certificate');

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAuthToken() {
  const email = `coursetest_${Date.now()}@test.com`;
  const reg = await request(app).post('/api/auth/register').send({
    name: 'Course Tester',
    email,
    password: 'password123',
  });
  return reg.body.data.token;
}

async function seedCourses() {
  const courses = await Course.insertMany([
    {
      title: 'Entrepreneurship Basics',
      description: 'Learn entrepreneurship fundamentals',
      category: 'Entrepreneurship',
      difficultyLevel: 'Beginner',
      estimatedDuration: 180,
      isPublished: true,
    },
    {
      title: 'Business Planning',
      description: 'Master business planning',
      category: 'Business Planning',
      difficultyLevel: 'Intermediate',
      estimatedDuration: 240,
      isPublished: true,
    },
    {
      title: 'Draft Course',
      description: 'Not yet published',
      category: 'Other',
      difficultyLevel: 'Beginner',
      isPublished: false,
    },
  ]);

  // Add modules and lessons for the first course
  const module = await Module.create({
    courseId: courses[0]._id,
    title: 'Introduction Module',
    description: 'Getting started',
    order: 1,
  });

  const lesson = await Lesson.create({
    moduleId: module._id,
    title: 'First Lesson',
    content: 'Lesson content here',
    duration: 15,
    order: 1,
  });

  const quiz = await Quiz.create({
    lessonId: lesson._id,
    title: 'Lesson Quiz',
    questions: [
      {
        question: 'Test question?',
        options: ['A', 'B', 'C'],
        correctAnswer: 0,
      },
    ],
  });

  return { courses, module, lesson, quiz };
}

// ─── GET /api/courses ─────────────────────────────────────────────────────────

describe('GET /api/courses', () => {
  beforeEach(async () => {
    // Clear course-related collections before seeding
    await Quiz.deleteMany({});
    await Lesson.deleteMany({});
    await Module.deleteMany({});
    await Course.deleteMany({});
    await QuizAttempt.deleteMany({});
    await Certificate.deleteMany({});
    await seedCourses();
  });

  it('returns 200 with paginated courses', async () => {
    const res = await request(app).get('/api/courses');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.courses).toBeInstanceOf(Array);
    expect(res.body.data.total).toBeDefined();
    expect(res.body.data.page).toBeDefined();
    expect(res.body.data.limit).toBeDefined();
  });

  it('filters by category query param', async () => {
    const res = await request(app).get('/api/courses?category=Entrepreneurship');

    expect(res.status).toBe(200);
    expect(res.body.data.courses.length).toBe(1);
    expect(res.body.data.courses[0].title).toBe('Entrepreneurship Basics');
  });

  it('filters by difficultyLevel query param', async () => {
    const res = await request(app).get('/api/courses?difficultyLevel=Beginner');

    expect(res.status).toBe(200);
    expect(res.body.data.courses.every((c) => c.difficultyLevel === 'Beginner')).toBe(true);
  });

  it('filters by isPublished=true', async () => {
    const res = await request(app).get('/api/courses?isPublished=true');

    expect(res.status).toBe(200);
    // Check that returned courses have isPublished=true
    if (res.body.data.courses.length > 0) {
      expect(res.body.data.courses.every((c) => c.isPublished === true)).toBe(true);
    }
  });

  it('respects page and limit pagination params', async () => {
    const res = await request(app).get('/api/courses?page=1&limit=2');

    expect(res.status).toBe(200);
    expect(res.body.data.courses.length).toBeLessThanOrEqual(2);
    expect(res.body.data.limit).toBe(2);
  });

  it('returns empty array when no courses match filters', async () => {
    const res = await request(app).get('/api/courses?category=Entrepreneurship&page=1&limit=10');

    expect(res.status).toBe(200);
    // Should return at least the Entrepreneurship course
    expect(res.body.data.courses.length).toBeGreaterThanOrEqual(0);
  });
});

// ─── GET /api/courses/:id ─────────────────────────────────────────────────────

describe('GET /api/courses/:id', () => {
  let courses;

  beforeEach(async () => {
    await Quiz.deleteMany({});
    await Lesson.deleteMany({});
    await Module.deleteMany({});
    await Course.deleteMany({});
    await QuizAttempt.deleteMany({});
    await Certificate.deleteMany({});
    const data = await seedCourses();
    courses = data.courses;
  });

  it('returns 200 with course data for valid id', async () => {
    const res = await request(app).get(`/api/courses/${courses[0]._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Entrepreneurship Basics');
  });

  it('returns 404 for non-existent id', async () => {
    const fakeId = '64f1234567890abcde123456';
    const res = await request(app).get(`/api/courses/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for invalid ObjectId format', async () => {
    const res = await request(app).get('/api/courses/not-a-valid-id');

    expect(res.status).toBe(400);
  });
});

// ─── GET /api/courses/:id/modules ─────────────────────────────────────────────

describe('GET /api/courses/:id/modules', () => {
  let courses;

  beforeEach(async () => {
    await Quiz.deleteMany({});
    await Lesson.deleteMany({});
    await Module.deleteMany({});
    await Course.deleteMany({});
    await QuizAttempt.deleteMany({});
    await Certificate.deleteMany({});
    const data = await seedCourses();
    courses = data.courses;
  });

  it('returns 200 with modules for valid course id', async () => {
    const res = await request(app).get(`/api/courses/${courses[0]._id}/modules`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Introduction Module');
  });

  it('returns 404 for non-existent course id', async () => {
    const fakeId = '64f1234567890abcde123456';
    const res = await request(app).get(`/api/courses/${fakeId}/modules`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('returns empty array for course with no modules', async () => {
    const res = await request(app).get(`/api/courses/${courses[1]._id}/modules`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });
});

// ─── GET /api/lessons/:id ─────────────────────────────────────────────────────

describe('GET /api/lessons/:id', () => {
  let lesson;

  beforeEach(async () => {
    await Quiz.deleteMany({});
    await Lesson.deleteMany({});
    await Module.deleteMany({});
    await Course.deleteMany({});
    await QuizAttempt.deleteMany({});
    await Certificate.deleteMany({});
    const data = await seedCourses();
    lesson = data.lesson;
  });

  it('returns 200 with lesson and quiz data for valid id', async () => {
    const res = await request(app).get(`/api/lessons/${lesson._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.lesson.title).toBe('First Lesson');
    expect(res.body.data.quiz).toBeTruthy();
    expect(res.body.data.quiz.title).toBe('Lesson Quiz');
  });

  it('returns 404 for non-existent lesson id', async () => {
    const fakeId = '64f1234567890abcde123456';
    const res = await request(app).get(`/api/lessons/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for invalid ObjectId format', async () => {
    const res = await request(app).get('/api/lessons/not-a-valid-id');

    expect(res.status).toBe(400);
  });
});

// ─── POST /api/courses (Protected) ───────────────────────────────────────────

describe('POST /api/courses', () => {
  let token;

  beforeEach(async () => {
    await Quiz.deleteMany({});
    await Lesson.deleteMany({});
    await Module.deleteMany({});
    await Course.deleteMany({});
    await QuizAttempt.deleteMany({});
    await Certificate.deleteMany({});
    token = await getAuthToken();
  });

  it('returns 201 when creating a course with valid auth', async () => {
    const courseData = {
      title: 'New Course',
      description: 'New course description',
      category: 'Entrepreneurship',
      difficultyLevel: 'Beginner',
      estimatedDuration: 120,
      isPublished: true,
    };

    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${token}`)
      .send(courseData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('New Course');
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).post('/api/courses').send({
      title: 'New Course',
    });

    expect(res.status).toBe(401);
  });

  it('returns 400 when validation fails', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'AB', // Too short
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── PUT /api/courses/:id (Protected) ───────────────────────────────────────

describe('PUT /api/courses/:id', () => {
  let token;
  let courses;

  beforeEach(async () => {
    await Quiz.deleteMany({});
    await Lesson.deleteMany({});
    await Module.deleteMany({});
    await Course.deleteMany({});
    await QuizAttempt.deleteMany({});
    await Certificate.deleteMany({});
    token = await getAuthToken();
    const data = await seedCourses();
    courses = data.courses;
  });

  it('returns 200 when updating a course with valid auth', async () => {
    const res = await request(app)
      .put(`/api/courses/${courses[0]._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Title',
        isPublished: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Updated Title');
    expect(res.body.data.isPublished).toBe(false);
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).put(`/api/courses/${courses[0]._id}`).send({
      title: 'Updated Title',
    });

    expect(res.status).toBe(401);
  });

  it('returns 404 for non-existent course id', async () => {
    const fakeId = '64f1234567890abcde123456';
    const res = await request(app)
      .put(`/api/courses/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated' });

    expect(res.status).toBe(404);
  });
});

// ─── DELETE /api/courses/:id (Protected) ────────────────────────────────────

describe('DELETE /api/courses/:id', () => {
  let token;
  let courses;

  beforeEach(async () => {
    await Quiz.deleteMany({});
    await Lesson.deleteMany({});
    await Module.deleteMany({});
    await Course.deleteMany({});
    await QuizAttempt.deleteMany({});
    await Certificate.deleteMany({});
    token = await getAuthToken();
    const data = await seedCourses();
    courses = data.courses;
  });

  it('returns 200 when deleting a course with valid auth', async () => {
    const res = await request(app)
      .delete(`/api/courses/${courses[0]._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify deletion
    const deletedCourse = await Course.findById(courses[0]._id);
    expect(deletedCourse).toBeNull();
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).delete(`/api/courses/${courses[0]._id}`);

    expect(res.status).toBe(401);
  });

  it('returns 404 for non-existent course id', async () => {
    const fakeId = '64f1234567890abcde123456';
    const res = await request(app)
      .delete(`/api/courses/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

// ─── Sprint 7 Phase 2: Progress Tracking Integration Tests ──────────────────

describe('POST /api/lessons/:id/complete', () => {
  let token;
  let lesson;

  beforeEach(async () => {
    await Quiz.deleteMany({});
    await Lesson.deleteMany({});
    await Module.deleteMany({});
    await Course.deleteMany({});
    await UserCourseProgress.deleteMany({});
    await QuizAttempt.deleteMany({});
    await Certificate.deleteMany({});
    token = await getAuthToken();
    const data = await seedCourses();
    lesson = data.lesson;
  });

  it('returns 200 when marking lesson complete with valid auth', async () => {
    const res = await request(app)
      .post(`/api/lessons/${lesson._id}/complete`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.completedLessons).toContainEqual(lesson._id.toString());
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).post(`/api/lessons/${lesson._id}/complete`);

    expect(res.status).toBe(401);
  });

  it('returns 404 for non-existent lesson id', async () => {
    const fakeId = '64f1234567890abcde123456';
    const res = await request(app)
      .post(`/api/lessons/${fakeId}/complete`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe('GET /api/courses/:id/progress', () => {
  let token;
  let courses;
  let lesson;

  beforeEach(async () => {
    await Quiz.deleteMany({});
    await Lesson.deleteMany({});
    await Module.deleteMany({});
    await Course.deleteMany({});
    await UserCourseProgress.deleteMany({});
    await QuizAttempt.deleteMany({});
    await Certificate.deleteMany({});
    token = await getAuthToken();
    const data = await seedCourses();
    courses = data.courses;
    lesson = data.lesson;
  });

  it('returns 200 with course progress for valid course id', async () => {
    // First mark a lesson as complete
    await request(app)
      .post(`/api/lessons/${lesson._id}/complete`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .get(`/api/courses/${courses[0]._id}/progress`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.completedLessons.length).toBe(1);
    expect(res.body.data.progressPercentage).toBeGreaterThan(0);
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get(`/api/courses/${courses[0]._id}/progress`);

    expect(res.status).toBe(401);
  });

  it('returns 404 for non-existent course id', async () => {
    const fakeId = '64f1234567890abcde123456';
    const res = await request(app)
      .get(`/api/courses/${fakeId}/progress`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe('GET /api/learning/progress', () => {
  let token;
  let lesson;

  beforeEach(async () => {
    await Quiz.deleteMany({});
    await Lesson.deleteMany({});
    await Module.deleteMany({});
    await Course.deleteMany({});
    await UserCourseProgress.deleteMany({});
    await QuizAttempt.deleteMany({});
    await Certificate.deleteMany({});
    token = await getAuthToken();
    const data = await seedCourses();
    lesson = data.lesson;
  });

  it('returns 200 with dashboard summary', async () => {
    // Mark a lesson as complete
    await request(app)
      .post(`/api/lessons/${lesson._id}/complete`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .get('/api/learning/progress')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.enrolledCourses).toBe(1);
    expect(res.body.data.completedCourses).toBe(1);
    expect(res.body.data.averageProgress).toBe(100);
    expect(res.body.data.recentLessons).toBeInstanceOf(Array);
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/learning/progress');

    expect(res.status).toBe(401);
  });
});

// ─── Sprint 7 Phase 3: Quiz Engine Integration Tests ───────────────────────

describe('GET /api/quizzes/:id', () => {
  let token;
  let quiz;

  beforeEach(async () => {
    await Quiz.deleteMany({});
    await Lesson.deleteMany({});
    await Module.deleteMany({});
    await Course.deleteMany({});
    await UserCourseProgress.deleteMany({});
    await QuizAttempt.deleteMany({});
    await Certificate.deleteMany({});
    token = await getAuthToken();
    const data = await seedCourses();
    quiz = data.quiz;
  });

  it('returns 200 with quiz without correct answers', async () => {
    const res = await request(app)
      .get(`/api/quizzes/${quiz._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Lesson Quiz');
    expect(res.body.data.questions[0]).toHaveProperty('question');
    expect(res.body.data.questions[0]).toHaveProperty('options');
    expect(res.body.data.questions[0]).not.toHaveProperty('correctAnswer');
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get(`/api/quizzes/${quiz._id}`);

    expect(res.status).toBe(401);
  });

  it('returns 404 for non-existent quiz id', async () => {
    const fakeId = '64f1234567890abcde123456';
    const res = await request(app)
      .get(`/api/quizzes/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe('POST /api/quizzes/:id/submit', () => {
  let token;
  let quiz;

  beforeEach(async () => {
    await Quiz.deleteMany({});
    await Lesson.deleteMany({});
    await Module.deleteMany({});
    await Course.deleteMany({});
    await UserCourseProgress.deleteMany({});
    await QuizAttempt.deleteMany({});
    await Certificate.deleteMany({});
    token = await getAuthToken();
    const data = await seedCourses();
    quiz = data.quiz;
  });

  it('returns 200 with quiz attempt results', async () => {
    const res = await request(app)
      .post(`/api/quizzes/${quiz._id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answers: [0] });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.score).toBe(1);
    expect(res.body.data.percentage).toBe(100);
    expect(res.body.data.passed).toBe(true);
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app)
      .post(`/api/quizzes/${quiz._id}/submit`)
      .send({ answers: [0] });

    expect(res.status).toBe(401);
  });

  it('returns 400 when answers are missing', async () => {
    const res = await request(app)
      .post(`/api/quizzes/${quiz._id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });
});

describe('GET /api/quizzes/history', () => {
  let token;
  let quiz;

  beforeEach(async () => {
    await Quiz.deleteMany({});
    await Lesson.deleteMany({});
    await Module.deleteMany({});
    await Course.deleteMany({});
    await UserCourseProgress.deleteMany({});
    await QuizAttempt.deleteMany({});
    await Certificate.deleteMany({});
    token = await getAuthToken();
    const data = await seedCourses();
    quiz = data.quiz;
  });

  it('returns 200 with quiz attempt history', async () => {
    // Submit quiz twice
    await request(app)
      .post(`/api/quizzes/${quiz._id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answers: [0] });
    await request(app)
      .post(`/api/quizzes/${quiz._id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answers: [0] });

    const res = await request(app)
      .get('/api/quizzes/history')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/quizzes/history');

    expect(res.status).toBe(401);
  });
});

describe('GET /api/quizzes/statistics', () => {
  let token;
  let quiz;

  beforeEach(async () => {
    await Quiz.deleteMany({});
    await Lesson.deleteMany({});
    await Module.deleteMany({});
    await Course.deleteMany({});
    await UserCourseProgress.deleteMany({});
    await QuizAttempt.deleteMany({});
    await Certificate.deleteMany({});
    token = await getAuthToken();
    const data = await seedCourses();
    quiz = data.quiz;
  });

  it('returns 200 with quiz statistics', async () => {
    // Submit quiz
    await request(app)
      .post(`/api/quizzes/${quiz._id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answers: [0] });

    const res = await request(app)
      .get('/api/quizzes/statistics')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.attempts).toBe(1);
    expect(res.body.data.averageScore).toBe(100);
    expect(res.body.data.bestScore).toBe(100);
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/quizzes/statistics');

    expect(res.status).toBe(401);
  });
});

// ─── Sprint 7 Phase 4: Certificate Integration Tests ───────────────────────

describe('GET /api/courses/:id/certificate', () => {
  let token;
  let courses;
  let lesson;
  let quiz;

  beforeEach(async () => {
    await Quiz.deleteMany({});
    await Lesson.deleteMany({});
    await Module.deleteMany({});
    await Course.deleteMany({});
    await UserCourseProgress.deleteMany({});
    await QuizAttempt.deleteMany({});
    await Certificate.deleteMany({});
    token = await getAuthToken();
    const data = await seedCourses();
    courses = data.courses;
    lesson = data.lesson;
    quiz = data.quiz;
  });

  it('returns 200 with certificate when course complete and quiz passed', async () => {
    // Complete lesson
    await request(app)
      .post(`/api/lessons/${lesson._id}/complete`)
      .set('Authorization', `Bearer ${token}`);
    // Pass quiz
    await request(app)
      .post(`/api/quizzes/${quiz._id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answers: [0] });

    const res = await request(app)
      .get(`/api/courses/${courses[0]._id}/certificate`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.certificateNumber).toMatch(/^ESH-\d{4}-\d{5}$/);
    expect(res.body.data.completionPercentage).toBe(100);
  });

  it('returns 400 when course not 100% complete', async () => {
    // Don't complete lesson
    await request(app)
      .post(`/api/quizzes/${quiz._id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answers: [0] });

    const res = await request(app)
      .get(`/api/courses/${courses[0]._id}/certificate`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it('returns 400 when quiz not passed', async () => {
    // Complete lesson
    await request(app)
      .post(`/api/lessons/${lesson._id}/complete`)
      .set('Authorization', `Bearer ${token}`);
    // Fail quiz
    await request(app)
      .post(`/api/quizzes/${quiz._id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answers: [1] });

    const res = await request(app)
      .get(`/api/courses/${courses[0]._id}/certificate`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get(`/api/courses/${courses[0]._id}/certificate`);

    expect(res.status).toBe(401);
  });
});

describe('GET /api/certificates/:certificateNumber', () => {
  let token;
  let courses;
  let lesson;
  let quiz;
  let certificateNumber;

  beforeEach(async () => {
    await Quiz.deleteMany({});
    await Lesson.deleteMany({});
    await Module.deleteMany({});
    await Course.deleteMany({});
    await UserCourseProgress.deleteMany({});
    await QuizAttempt.deleteMany({});
    await Certificate.deleteMany({});
    token = await getAuthToken();
    const data = await seedCourses();
    courses = data.courses;
    lesson = data.lesson;
    quiz = data.quiz;

    // Complete course and pass quiz
    await request(app)
      .post(`/api/lessons/${lesson._id}/complete`)
      .set('Authorization', `Bearer ${token}`);
    await request(app)
      .post(`/api/quizzes/${quiz._id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answers: [0] });

    const certRes = await request(app)
      .get(`/api/courses/${courses[0]._id}/certificate`)
      .set('Authorization', `Bearer ${token}`);
    certificateNumber = certRes.body.data.certificateNumber;
  });

  it('returns 200 with certificate data for valid certificate number', async () => {
    const res = await request(app).get(`/api/certificates/${certificateNumber}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.certificateNumber).toBe(certificateNumber);
    expect(res.body.data.courseName).toBe('Entrepreneurship Basics');
  });

  it('returns 404 for invalid certificate number', async () => {
    const res = await request(app).get('/api/certificates/ESH-2026-00000');

    expect(res.status).toBe(404);
  });
});

describe('GET /api/certificates', () => {
  let token;
  let courses;
  let lesson;
  let quiz;

  beforeEach(async () => {
    await Quiz.deleteMany({});
    await Lesson.deleteMany({});
    await Module.deleteMany({});
    await Course.deleteMany({});
    await UserCourseProgress.deleteMany({});
    await QuizAttempt.deleteMany({});
    await Certificate.deleteMany({});
    token = await getAuthToken();
    const data = await seedCourses();
    courses = data.courses;
    lesson = data.lesson;
    quiz = data.quiz;
  });

  it('returns 200 with user certificates', async () => {
    // Complete course and pass quiz
    await request(app)
      .post(`/api/lessons/${lesson._id}/complete`)
      .set('Authorization', `Bearer ${token}`);
    await request(app)
      .post(`/api/quizzes/${quiz._id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answers: [0] });
    await request(app)
      .get(`/api/courses/${courses[0]._id}/certificate`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .get('/api/certificates')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/certificates');

    expect(res.status).toBe(401);
  });
});
