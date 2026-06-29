/**
 * Integration Tests — Admin API Routes (Sprint 10)
 * Tests authentication, authorization, CRUD, pagination,
 * filtering, searching, sorting, and analytics endpoints.
 *
 * Run: npm test -- --testPathPattern=admin
 */

require('../setup');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.JWT_ACCESS_EXPIRES = '15m';
process.env.JWT_REFRESH_EXPIRES = '7d';

const app = require('../../app');

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function registerUser(overrides = {}) {
  const defaults = { name: 'Test User', email: `user_${Date.now()}@test.com`, password: 'password123' };
  const payload = { ...defaults, ...overrides };
  const res = await request(app).post('/api/auth/register').send(payload);
  return { token: res.body.data?.token, user: res.body.data };
}

async function createAdminToken() {
  // Register a regular user then directly promote to admin via the User model
  const User = require('../../models/User');
  const { token, user } = await registerUser({ name: 'Admin User', email: `admin_${Date.now()}@test.com` });
  await User.findOneAndUpdate({ email: user.email }, { role: 'admin' });

  // Re-login to get a fresh token reflecting admin role
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password: 'password123' });
  return loginRes.body.data?.token;
}

// ─── Phase 1: Authentication & Authorization ─────────────────────────────────

describe('Admin Auth & Authorization (Phase 1)', () => {
  it('should return 401 when no token is provided', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });

  it('should return 403 when a regular user tries to access admin routes', async () => {
    const { token } = await registerUser();
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('should allow admin to access admin routes', async () => {
    const adminToken = await createAdminToken();
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 403 when a mentor tries to access admin routes', async () => {
    const User = require('../../models/User');
    const { token, user } = await registerUser({ email: `mentor_${Date.now()}@test.com` });
    await User.findOneAndUpdate({ email: user.email }, { role: 'mentor' });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'password123' });
    const mentorToken = loginRes.body.data?.token;

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${mentorToken}`);
    expect(res.status).toBe(403);
  });
});

// ─── Phase 2: Dashboard Stats ─────────────────────────────────────────────────

describe('GET /api/admin/dashboard (Phase 2)', () => {
  let adminToken;

  beforeEach(async () => {
    adminToken = await createAdminToken();
  });

  it('should return dashboard stats with required fields', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalUsers');
    expect(res.body.data).toHaveProperty('activeUsers');
    expect(res.body.data).toHaveProperty('totalCourses');
    expect(res.body.data).toHaveProperty('totalBusinessIdeas');
    expect(res.body.data).toHaveProperty('totalGoals');
    expect(res.body.data).toHaveProperty('totalCertificates');
    expect(res.body.data).toHaveProperty('totalNotifications');
  });

  it('should include weeklyGrowth and monthlyGrowth', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.body.data).toHaveProperty('weeklyGrowth');
    expect(res.body.data).toHaveProperty('monthlyGrowth');
    expect(res.body.data.weeklyGrowth).toHaveProperty('newUsers');
    expect(res.body.data.weeklyGrowth).toHaveProperty('growthPercent');
    expect(res.body.data.monthlyGrowth).toHaveProperty('newUsers');
    expect(res.body.data.monthlyGrowth).toHaveProperty('growthPercent');
  });

  it('should return 401 without auth token', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    expect(res.status).toBe(401);
  });
});

// ─── Phase 3: User Management ─────────────────────────────────────────────────

describe('User Management (Phase 3)', () => {
  let adminToken;

  beforeEach(async () => {
    adminToken = await createAdminToken();
  });

  describe('GET /api/admin/users', () => {
    it('should return paginated user list', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('users');
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('pages');
      expect(Array.isArray(res.body.data.users)).toBe(true);
    });

    it('should filter users by role', async () => {
      const res = await request(app)
        .get('/api/admin/users?role=admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      res.body.data.users.forEach(u => {
        expect(u.role).toBe('admin');
      });
    });

    it('should search users by name', async () => {
      await registerUser({ name: 'SearchableUser Alpha', email: `searchable_${Date.now()}@test.com` });

      const res = await request(app)
        .get('/api/admin/users?search=SearchableUser')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.users.length).toBeGreaterThan(0);
      expect(res.body.data.users[0].name).toContain('SearchableUser');
    });

    it('should respect pagination limit', async () => {
      const res = await request(app)
        .get('/api/admin/users?limit=2&page=1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.users.length).toBeLessThanOrEqual(2);
    });
  });

  describe('GET /api/admin/users/:id', () => {
    it('should return a single user by ID', async () => {
      // Get a user ID from the list first
      const listRes = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      const userId = listRes.body.data.users[0]?._id;

      if (!userId) return; // skip if no users yet

      const res = await request(app)
        .get(`/api/admin/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(userId);
    });

    it('should return 404 for a non-existent user ID', async () => {
      const res = await request(app)
        .get('/api/admin/users/000000000000000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/admin/users/:id', () => {
    it('should update a user name and role', async () => {
      const { token: userToken, user } = await registerUser({ email: `editme_${Date.now()}@test.com` });
      const User = require('../../models/User');
      const dbUser = await User.findOne({ email: user.email });

      const res = await request(app)
        .put(`/api/admin/users/${dbUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name', role: 'mentor' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Name');
      expect(res.body.data.role).toBe('mentor');
    });

    it('should return 404 for a non-existent user', async () => {
      const res = await request(app)
        .put('/api/admin/users/000000000000000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Ghost' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
    it('should delete a regular user', async () => {
      const { user } = await registerUser({ email: `deleteme_${Date.now()}@test.com` });
      const User = require('../../models/User');
      const dbUser = await User.findOne({ email: user.email });

      const res = await request(app)
        .delete(`/api/admin/users/${dbUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should prevent admin from deleting their own account', async () => {
      const User = require('../../models/User');
      // Find the admin user that corresponds to the adminToken
      const adminRes = await request(app)
        .get('/api/admin/users?role=admin')
        .set('Authorization', `Bearer ${adminToken}`);
      const adminUser = adminRes.body.data.users[0];
      if (!adminUser) return;

      const res = await request(app)
        .delete(`/api/admin/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });

    it('should return 404 for a non-existent user', async () => {
      const res = await request(app)
        .delete('/api/admin/users/000000000000000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});

// ─── Phase 4: Content Management ─────────────────────────────────────────────

describe('Content Management — Business Ideas (Phase 4)', () => {
  let adminToken;

  beforeEach(async () => {
    adminToken = await createAdminToken();
  });

  it('should create a new business idea', async () => {
    const res = await request(app)
      .post('/api/admin/business-ideas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Business Idea',
        description: 'A description',
        category: 'Technology',
        difficultyLevel: 'Beginner',
        startupCostRange: '₹0 - ₹1L',
        estimatedMonthlyIncome: '₹10K - ₹50K',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Test Business Idea');
  });

  it('should list business ideas with pagination', async () => {
    const res = await request(app)
      .get('/api/admin/business-ideas')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('ideas');
    expect(res.body.data).toHaveProperty('total');
  });

  it('should update a business idea', async () => {
    // Create first
    const createRes = await request(app)
      .post('/api/admin/business-ideas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Old Name',
        description: 'desc',
        category: 'Technology',
        difficultyLevel: 'Beginner',
        startupCostRange: '₹0 - ₹1L',
        estimatedMonthlyIncome: '₹10K - ₹50K',
      });
    const ideaId = createRes.body.data._id;

    const updateRes = await request(app)
      .put(`/api/admin/business-ideas/${ideaId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'New Name' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.name).toBe('New Name');
  });

  it('should delete a business idea', async () => {
    const createRes = await request(app)
      .post('/api/admin/business-ideas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Delete Me',
        description: 'desc',
        category: 'Technology',
        difficultyLevel: 'Beginner',
        startupCostRange: '₹0 - ₹1L',
        estimatedMonthlyIncome: '₹10K - ₹50K',
      });
    const ideaId = createRes.body.data._id;

    const deleteRes = await request(app)
      .delete(`/api/admin/business-ideas/${ideaId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
  });
});

describe('Content Management — Courses (Phase 4)', () => {
  let adminToken;

  beforeEach(async () => {
    adminToken = await createAdminToken();
  });

  it('should create a course', async () => {
    const res = await request(app)
      .post('/api/admin/courses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Test Course', category: 'Entrepreneurship', difficultyLevel: 'Beginner' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Test Course');
  });

  it('should return 400 when course title is missing', async () => {
    const res = await request(app)
      .post('/api/admin/courses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ category: 'Entrepreneurship' });

    expect(res.status).toBe(400);
  });

  it('should list courses with pagination', async () => {
    const res = await request(app)
      .get('/api/admin/courses')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('courses');
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('pages');
  });

  it('should filter courses by isPublished', async () => {
    // Create a published course
    await request(app)
      .post('/api/admin/courses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Published Course', isPublished: true });

    const res = await request(app)
      .get('/api/admin/courses?isPublished=true')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    res.body.data.courses.forEach(c => {
      expect(c.isPublished).toBe(true);
    });
  });

  it('should update a course', async () => {
    const createRes = await request(app)
      .post('/api/admin/courses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Update Me' });
    const courseId = createRes.body.data._id;

    const updateRes = await request(app)
      .put(`/api/admin/courses/${courseId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Updated Title', isPublished: true });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.title).toBe('Updated Title');
    expect(updateRes.body.data.isPublished).toBe(true);
  });

  it('should delete a course', async () => {
    const createRes = await request(app)
      .post('/api/admin/courses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Delete Me' });
    const courseId = createRes.body.data._id;

    const deleteRes = await request(app)
      .delete(`/api/admin/courses/${courseId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
  });
});

describe('Content Management — Schemes & Funding (Phase 4)', () => {
  let adminToken;

  beforeEach(async () => {
    adminToken = await createAdminToken();
  });

  it('should create and list a government scheme', async () => {
    const createRes = await request(app)
      .post('/api/admin/schemes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Scheme', category: 'Technology', state: 'National' });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.name).toBe('Test Scheme');

    const listRes = await request(app)
      .get('/api/admin/schemes')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data).toHaveProperty('schemes');
  });

  it('should create and list a funding program', async () => {
    const createRes = await request(app)
      .post('/api/admin/funding')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Loan', provider: 'Test Bank', industry: 'SaaS' });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.name).toBe('Test Loan');

    const listRes = await request(app)
      .get('/api/admin/funding')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data).toHaveProperty('programs');
  });

  it('should filter schemes by category', async () => {
    await request(app)
      .post('/api/admin/schemes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Agri Scheme', category: 'Agriculture' });

    const res = await request(app)
      .get('/api/admin/schemes?category=Agriculture')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    res.body.data.schemes.forEach(s => {
      expect(s.category).toBe('Agriculture');
    });
  });

  it('should search funding programs by name', async () => {
    await request(app)
      .post('/api/admin/funding')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'UniqueSearchableLoan', provider: 'SIDBI' });

    const res = await request(app)
      .get('/api/admin/funding?search=UniqueSearchableLoan')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.programs.length).toBeGreaterThan(0);
  });
});

// ─── Phase 5: Analytics ───────────────────────────────────────────────────────

describe('Analytics Endpoints (Phase 5)', () => {
  let adminToken;

  beforeEach(async () => {
    adminToken = await createAdminToken();
  });

  it('GET /api/admin/analytics should return basic analytics', async () => {
    const res = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalUsers');
    expect(res.body.data).toHaveProperty('totalMentors');
    expect(res.body.data).toHaveProperty('totalIdeas');
    expect(res.body.data).toHaveProperty('usersByRole');
    expect(Array.isArray(res.body.data.usersByRole)).toBe(true);
  });

  it('GET /api/admin/analytics/enhanced should return multi-domain analytics', async () => {
    const res = await request(app)
      .get('/api/admin/analytics/enhanced')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('userAnalytics');
    expect(res.body.data).toHaveProperty('learningAnalytics');
    expect(res.body.data).toHaveProperty('businessAnalytics');
    expect(res.body.data).toHaveProperty('fundingAnalytics');
    expect(res.body.data).toHaveProperty('executionAnalytics');
  });

  it('enhanced analytics should have correct user analytics structure', async () => {
    const res = await request(app)
      .get('/api/admin/analytics/enhanced')
      .set('Authorization', `Bearer ${adminToken}`);

    const { userAnalytics } = res.body.data;
    expect(userAnalytics).toHaveProperty('totalUsers');
    expect(userAnalytics).toHaveProperty('verifiedUsers');
    expect(userAnalytics).toHaveProperty('verificationRate');
    expect(userAnalytics).toHaveProperty('usersByRole');
    expect(userAnalytics).toHaveProperty('newUsersThisMonth');
  });

  it('enhanced analytics should have correct learning analytics structure', async () => {
    const res = await request(app)
      .get('/api/admin/analytics/enhanced')
      .set('Authorization', `Bearer ${adminToken}`);

    const { learningAnalytics } = res.body.data;
    expect(learningAnalytics).toHaveProperty('totalCourses');
    expect(learningAnalytics).toHaveProperty('publishedCourses');
    expect(learningAnalytics).toHaveProperty('totalEnrollments');
    expect(learningAnalytics).toHaveProperty('totalCertificates');
    expect(learningAnalytics).toHaveProperty('learningCompletionRate');
  });

  it('should return 403 for non-admin analytics request', async () => {
    const { token } = await registerUser();
    const res = await request(app)
      .get('/api/admin/analytics/enhanced')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
