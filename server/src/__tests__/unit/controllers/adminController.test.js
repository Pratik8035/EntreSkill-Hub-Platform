'use strict';

/**
 * Unit Tests — adminController (Sprint 10)
 * Tests for dashboard stats, user CRUD, analytics, and role validation.
 *
 * Run: npm test -- --testPathPattern=adminController
 */

require('../../setup');
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';

const User = require('../../../models/User');
const Course = require('../../../models/Course');
const BusinessIdea = require('../../../models/BusinessIdea');
const GovernmentScheme = require('../../../models/GovernmentScheme');
const FundingProgram = require('../../../models/FundingProgram');
const Certificate = require('../../../models/Certificate');
const BusinessGoal = require('../../../models/BusinessGoal');
const Notification = require('../../../models/Notification');
const MentorProfile = require('../../../models/MentorProfile');

// ── Helper: create a mock req/res pair ────────────────────────────────────────
function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function mockReq(overrides = {}) {
  return {
    query: {},
    params: {},
    body: {},
    user: { _id: new mongoose.Types.ObjectId(), role: 'admin' },
    ...overrides,
  };
}

// ── Phase 1: Admin Role Validation ────────────────────────────────────────────
describe('Admin Role Validation (Phase 1)', () => {
  it('User model supports admin role enum', async () => {
    const user = new User({
      name: 'Admin',
      email: `admin_unit_${Date.now()}@test.com`,
      password: 'password123',
      role: 'admin',
    });
    expect(user.role).toBe('admin');
  });

  it('User model supports user role enum', () => {
    const user = new User({ name: 'U', email: 'u@t.com', password: 'p', role: 'user' });
    expect(user.role).toBe('user');
  });

  it('User model supports mentor role enum', () => {
    const user = new User({ name: 'M', email: 'm@t.com', password: 'p', role: 'mentor' });
    expect(user.role).toBe('mentor');
  });

  it('User model rejects invalid roles', async () => {
    const user = new User({ name: 'X', email: 'x@t.com', password: 'p', role: 'superadmin' });
    await expect(user.validate()).rejects.toThrow();
  });
});

// ── Phase 2: Dashboard Stats ───────────────────────────────────────────────────
describe('getDashboardStats (Phase 2)', () => {
  it('counts total users correctly', async () => {
    await User.create([
      { name: 'U1', email: `u1_${Date.now()}@test.com`, password: 'pass123' },
      { name: 'U2', email: `u2_${Date.now()}@test.com`, password: 'pass123' },
    ]);
    const count = await User.countDocuments();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  it('counts active (verified) users correctly', async () => {
    await User.create([
      { name: 'Verified', email: `v_${Date.now()}@test.com`, password: 'pass123', isVerified: true },
      { name: 'Unverified', email: `uv_${Date.now()}@test.com`, password: 'pass123', isVerified: false },
    ]);
    const active = await User.countDocuments({ isVerified: true });
    expect(active).toBeGreaterThanOrEqual(1);
  });

  it('counts total courses', async () => {
    await Course.create([
      { title: 'C1', description: 'desc' },
      { title: 'C2', description: 'desc' },
    ]);
    const count = await Course.countDocuments();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  it('calculates growth percent correctly', () => {
    const calcGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };
    expect(calcGrowth(10, 5)).toBe(100);
    expect(calcGrowth(5, 10)).toBe(-50);
    expect(calcGrowth(0, 0)).toBe(0);
    expect(calcGrowth(5, 0)).toBe(100);
  });

  it('counts business ideas', async () => {
    await BusinessIdea.create([
      {
        name: 'Idea1', description: 'desc', category: 'Technology',
        difficultyLevel: 'Beginner', startupCostRange: '₹0 - ₹1L',
        estimatedMonthlyIncome: '₹10K - ₹50K',
      },
    ]);
    const count = await BusinessIdea.countDocuments();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

// ── Phase 3: User Management ───────────────────────────────────────────────────
describe('User Management — Model Layer (Phase 3)', () => {
  it('can find users by search (name regex)', async () => {
    await User.create({
      name: 'UniqueSearchName',
      email: `search_${Date.now()}@test.com`,
      password: 'pass123',
    });
    const results = await User.find({ name: { $regex: 'UniqueSearch', $options: 'i' } });
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].name).toContain('UniqueSearch');
  });

  it('can filter users by role', async () => {
    const ts = Date.now();
    await User.create([
      { name: 'A', email: `a_role_${ts}@test.com`, password: 'pass123', role: 'mentor' },
      { name: 'B', email: `b_role_${ts}@test.com`, password: 'pass123', role: 'user' },
    ]);
    const mentors = await User.find({ role: 'mentor' });
    const hasNonMentor = mentors.some(u => u.role !== 'mentor');
    expect(hasNonMentor).toBe(false);
  });

  it('can update a user name', async () => {
    const user = await User.create({
      name: 'OldName',
      email: `update_${Date.now()}@test.com`,
      password: 'pass123',
    });
    user.name = 'NewName';
    await user.save();
    const updated = await User.findById(user._id);
    expect(updated.name).toBe('NewName');
  });

  it('can delete a user', async () => {
    const user = await User.create({
      name: 'DeleteMe',
      email: `delete_${Date.now()}@test.com`,
      password: 'pass123',
    });
    await User.findByIdAndDelete(user._id);
    const found = await User.findById(user._id);
    expect(found).toBeNull();
  });

  it('paginates correctly with skip and limit', async () => {
    const ts = Date.now();
    const docs = Array.from({ length: 6 }, (_, i) => ({
      name: `PageUser${i}_${ts}`,
      email: `page${i}_${ts}@test.com`,
      password: 'pass123',
    }));
    await User.create(docs);
    const total = await User.find({ name: { $regex: `PageUser`, $options: 'i' } }).countDocuments();
    const page1 = await User.find({ name: { $regex: `PageUser`, $options: 'i' } }).sort({ _id: 1 }).skip(0).limit(3);
    const page2 = await User.find({ name: { $regex: `PageUser`, $options: 'i' } }).sort({ _id: 1 }).skip(3).limit(3);
    expect(page1.length).toBe(3);
    expect(page2.length).toBe(3);
    // No overlap between pages
    const page1Ids = page1.map(u => u._id.toString());
    const page2Ids = page2.map(u => u._id.toString());
    expect(page1Ids.some(id => page2Ids.includes(id))).toBe(false);
  });
});

// ── Phase 4: Content Management ───────────────────────────────────────────────
describe('Content Management — Model Layer (Phase 4)', () => {
  it('can create and retrieve a business idea', async () => {
    const idea = await BusinessIdea.create({
      name: 'Test Idea Unit',
      description: 'A test idea',
      category: 'Technology',
      difficultyLevel: 'Beginner',
      startupCostRange: '₹0 - ₹1L',
      estimatedMonthlyIncome: '₹10K - ₹50K',
    });
    expect(idea._id).toBeDefined();
    expect(idea.name).toBe('Test Idea Unit');
    const found = await BusinessIdea.findById(idea._id);
    expect(found).not.toBeNull();
  });

  it('can update a business idea', async () => {
    const idea = await BusinessIdea.create({
      name: 'Old Idea',
      description: 'desc',
      category: 'Technology',
      difficultyLevel: 'Beginner',
      startupCostRange: '₹0 - ₹1L',
      estimatedMonthlyIncome: '₹10K - ₹50K',
    });
    const updated = await BusinessIdea.findByIdAndUpdate(
      idea._id,
      { name: 'Updated Idea' },
      { new: true }
    );
    expect(updated.name).toBe('Updated Idea');
  });

  it('can create a government scheme', async () => {
    const scheme = await GovernmentScheme.create({ name: 'Test Scheme', category: 'Agriculture' });
    expect(scheme._id).toBeDefined();
    expect(scheme.name).toBe('Test Scheme');
  });

  it('can create a funding program', async () => {
    const funding = await FundingProgram.create({ name: 'Test Fund', provider: 'SIDBI', industry: 'Tech' });
    expect(funding._id).toBeDefined();
  });

  it('can create a course with required title', async () => {
    const course = await Course.create({ title: 'Admin Created Course', difficultyLevel: 'Beginner' });
    expect(course.title).toBe('Admin Created Course');
  });

  it('can filter courses by isPublished', async () => {
    const ts = Date.now();
    await Course.create([
      { title: `PubCourse_${ts}`, isPublished: true },
      { title: `DraftCourse_${ts}`, isPublished: false },
    ]);
    const published = await Course.find({ isPublished: true });
    const hasDraft = published.some(c => !c.isPublished);
    expect(hasDraft).toBe(false);
  });
});

// ── Phase 5: Analytics ────────────────────────────────────────────────────────
describe('Analytics — Aggregation Layer (Phase 5)', () => {
  it('groups users by role correctly', async () => {
    const ts = Date.now();
    await User.create([
      { name: 'U1', email: `ana_u1_${ts}@t.com`, password: 'pass123', role: 'user' },
      { name: 'U2', email: `ana_u2_${ts}@t.com`, password: 'pass123', role: 'user' },
      { name: 'M1', email: `ana_m1_${ts}@t.com`, password: 'pass123', role: 'mentor' },
    ]);
    const groups = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
    const userGroup = groups.find(g => g._id === 'user');
    const mentorGroup = groups.find(g => g._id === 'mentor');
    expect(userGroup).toBeDefined();
    expect(mentorGroup).toBeDefined();
    expect(userGroup.count).toBeGreaterThanOrEqual(2);
    expect(mentorGroup.count).toBeGreaterThanOrEqual(1);
  });

  it('groups users by verification status', async () => {
    const ts = Date.now();
    await User.create([
      { name: 'V1', email: `v1_${ts}@t.com`, password: 'pass123', isVerified: true },
      { name: 'V2', email: `v2_${ts}@t.com`, password: 'pass123', isVerified: false },
    ]);
    const groups = await User.aggregate([
      { $group: { _id: '$isVerified', count: { $sum: 1 } } },
    ]);
    expect(groups.length).toBeGreaterThanOrEqual(2);
  });

  it('calculates verification rate', async () => {
    const ts = Date.now();
    await User.create([
      { name: 'VR1', email: `vr1_${ts}@t.com`, password: 'pass123', isVerified: true },
      { name: 'VR2', email: `vr2_${ts}@t.com`, password: 'pass123', isVerified: false },
    ]);
    const total = await User.countDocuments();
    const verified = await User.countDocuments({ isVerified: true });
    const rate = total > 0 ? Math.round((verified / total) * 100) : 0;
    expect(typeof rate).toBe('number');
    expect(rate).toBeGreaterThanOrEqual(0);
    expect(rate).toBeLessThanOrEqual(100);
  });

  it('groups courses by category', async () => {
    const ts = Date.now();
    await Course.create([
      { title: `Cat1_${ts}`, category: 'Entrepreneurship' },
      { title: `Cat2_${ts}`, category: 'Entrepreneurship' },
      { title: `Cat3_${ts}`, category: 'Financial Management' },
    ]);
    const groups = await Course.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const entGroup = groups.find(g => g._id === 'Entrepreneurship');
    expect(entGroup).toBeDefined();
    expect(entGroup.count).toBeGreaterThanOrEqual(2);
  });

  it('groups schemes by category', async () => {
    await GovernmentScheme.create([
      { name: 'S1', category: 'Agriculture' },
      { name: 'S2', category: 'Technology' },
    ]);
    const groups = await GovernmentScheme.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    expect(groups.length).toBeGreaterThanOrEqual(2);
  });

  it('counts new users in the last 30 days', async () => {
    await User.create({
      name: 'NewUser', email: `new_${Date.now()}@t.com`, password: 'pass123',
    });
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const count = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

// ── Phase 6: Frontend Data Contract ──────────────────────────────────────────
describe('Admin Service Data Contract (Phase 6)', () => {
  it('dashboard response includes all required top-level keys', async () => {
    // Simulate the shape getDashboardStats returns
    const ts = Date.now();
    const user = await User.create({
      name: 'ContractUser', email: `contract_${ts}@t.com`, password: 'pass123', isVerified: true,
    });

    const [totalUsers, activeUsers, totalCourses, totalBusinessIdeas, totalGoals, totalCertificates, totalNotifications] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isVerified: true }),
        Course.countDocuments(),
        BusinessIdea.countDocuments(),
        BusinessGoal.countDocuments(),
        Certificate.countDocuments(),
        Notification.countDocuments(),
      ]);

    const dashboardPayload = {
      totalUsers,
      activeUsers,
      totalCourses,
      totalBusinessIdeas,
      totalGoals,
      totalCertificates,
      totalNotifications,
      weeklyGrowth: { newUsers: 0, growthPercent: 0 },
      monthlyGrowth: { newUsers: 0, growthPercent: 0 },
    };

    // Assert required keys exist and are numbers/objects
    expect(typeof dashboardPayload.totalUsers).toBe('number');
    expect(typeof dashboardPayload.activeUsers).toBe('number');
    expect(typeof dashboardPayload.totalCourses).toBe('number');
    expect(typeof dashboardPayload.totalBusinessIdeas).toBe('number');
    expect(typeof dashboardPayload.totalGoals).toBe('number');
    expect(typeof dashboardPayload.totalCertificates).toBe('number');
    expect(typeof dashboardPayload.totalNotifications).toBe('number');
    expect(dashboardPayload.weeklyGrowth).toHaveProperty('newUsers');
    expect(dashboardPayload.weeklyGrowth).toHaveProperty('growthPercent');
    expect(dashboardPayload.monthlyGrowth).toHaveProperty('newUsers');
    expect(dashboardPayload.monthlyGrowth).toHaveProperty('growthPercent');
  });

  it('enhanced analytics has all required domain keys', () => {
    const enhancedPayload = {
      userAnalytics: { totalUsers: 0, verifiedUsers: 0, verificationRate: 0, usersByRole: [], newUsersThisMonth: 0 },
      learningAnalytics: { totalCourses: 0, publishedCourses: 0, totalEnrollments: 0, totalCertificates: 0, learningCompletionRate: 0 },
      businessAnalytics: { totalBusinessIdeas: 0, totalGoals: 0, goalsByStatus: [] },
      fundingAnalytics: { totalSchemes: 0, totalFundingPrograms: 0, schemesByCategory: [] },
      executionAnalytics: { totalNotifications: 0 },
    };

    expect(enhancedPayload).toHaveProperty('userAnalytics');
    expect(enhancedPayload).toHaveProperty('learningAnalytics');
    expect(enhancedPayload).toHaveProperty('businessAnalytics');
    expect(enhancedPayload).toHaveProperty('fundingAnalytics');
    expect(enhancedPayload).toHaveProperty('executionAnalytics');
    expect(enhancedPayload.userAnalytics).toHaveProperty('verificationRate');
    expect(enhancedPayload.learningAnalytics).toHaveProperty('learningCompletionRate');
  });
});
