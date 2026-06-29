'use strict';

/**
 * Integration Tests — Business Execution API (Sprint 8 Phase 1 + 2 + 3)
 */

require('../setup');
const request  = require('supertest');
const mongoose = require('mongoose');

process.env.NODE_ENV           = 'test';
process.env.JWT_SECRET         = 'test-jwt-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.JWT_ACCESS_EXPIRES = '15m';
process.env.JWT_REFRESH_EXPIRES= '7d';

const app          = require('../../app');
const BusinessGoal = require('../../models/BusinessGoal');
const Milestone    = require('../../models/Milestone');
const Task         = require('../../models/Task');
const KPI          = require('../../models/KPI');

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function registerAndLogin() {
  const email = `biztest_${Date.now()}@test.com`;
  const reg = await request(app).post('/api/auth/register').send({
    name: 'Biz Test User', email, password: 'password123',
  });
  const token = reg.body.data.token;
  const jwt   = require('jsonwebtoken');
  const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);
  return { token, userId };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Business Execution API', () => {
  let token;
  let userId;

  beforeEach(async () => {
    ({ token, userId } = await registerAndLogin());
  });

  // ── Goals ──────────────────────────────────────────────────────────────────

  describe('POST /api/business-execution/goals', () => {
    it('creates a goal and returns 201', async () => {
      const res = await request(app)
        .post('/api/business-execution/goals')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Launch Business', targetDate: '2026-12-31', priority: 'High' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Launch Business');
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/business-execution/goals')
        .send({ title: 'Test', targetDate: '2026-12-31' });
      expect(res.status).toBe(401);
    });

    it('returns 400 when title is empty', async () => {
      const res = await request(app)
        .post('/api/business-execution/goals')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '', targetDate: '2026-12-31' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/business-execution/goals', () => {
    it('returns goals for authenticated user', async () => {
      await BusinessGoal.create({ userId, title: 'Goal A', targetDate: new Date('2026-12-31') });

      const res = await request(app)
        .get('/api/business-execution/goals')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/business-execution/goals');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/business-execution/goals/:id', () => {
    it('returns goal by id', async () => {
      const goal = await BusinessGoal.create({ userId, title: 'Goal A', targetDate: new Date('2026-12-31') });

      const res = await request(app)
        .get(`/api/business-execution/goals/${goal._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Goal A');
    });

    it('returns 404 for non-existent goal', async () => {
      const res = await request(app)
        .get(`/api/business-execution/goals/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });

    it('returns 401 when not authenticated', async () => {
      const goal = await BusinessGoal.create({ userId, title: 'Goal A', targetDate: new Date('2026-12-31') });
      const res  = await request(app).get(`/api/business-execution/goals/${goal._id}`);
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/business-execution/goals/:id', () => {
    it('updates goal and returns updated data', async () => {
      const goal = await BusinessGoal.create({ userId, title: 'Original', targetDate: new Date('2026-12-31') });

      const res = await request(app)
        .put(`/api/business-execution/goals/${goal._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated', status: 'In Progress' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated');
      expect(res.body.data.status).toBe('In Progress');
    });

    it('returns 404 for non-existent goal', async () => {
      const res = await request(app)
        .put(`/api/business-execution/goals/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated' });
      expect(res.status).toBe(404);
    });

    it('returns 401 when not authenticated', async () => {
      const goal = await BusinessGoal.create({ userId, title: 'Goal', targetDate: new Date('2026-12-31') });
      const res  = await request(app).put(`/api/business-execution/goals/${goal._id}`).send({ title: 'x' });
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/business-execution/goals/:id', () => {
    it('deletes a goal', async () => {
      const goal = await BusinessGoal.create({ userId, title: 'To Delete', targetDate: new Date('2026-12-31') });

      const res = await request(app)
        .delete(`/api/business-execution/goals/${goal._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const still = await BusinessGoal.findById(goal._id);
      expect(still).toBeNull();
    });

    it('returns 404 for non-existent goal', async () => {
      const res = await request(app)
        .delete(`/api/business-execution/goals/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });

  // ── Milestones ─────────────────────────────────────────────────────────────

  describe('POST /api/business-execution/milestones', () => {
    let goalId;

    beforeEach(async () => {
      const goal = await BusinessGoal.create({ userId, title: 'Goal', targetDate: new Date('2026-12-31') });
      goalId = goal._id;
    });

    it('creates a milestone and returns 201', async () => {
      const res = await request(app)
        .post('/api/business-execution/milestones')
        .set('Authorization', `Bearer ${token}`)
        .send({ goalId: goalId.toString(), title: 'M1', targetDate: '2026-12-31' });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('M1');
    });

    it('returns 404 when goal not found', async () => {
      const res = await request(app)
        .post('/api/business-execution/milestones')
        .set('Authorization', `Bearer ${token}`)
        .send({ goalId: new mongoose.Types.ObjectId().toString(), title: 'M1', targetDate: '2026-12-31' });
      expect(res.status).toBe(404);
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/business-execution/milestones')
        .send({ goalId: goalId.toString(), title: 'M1', targetDate: '2026-12-31' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/business-execution/milestones', () => {
    let goalId;

    beforeEach(async () => {
      const goal = await BusinessGoal.create({ userId, title: 'Goal', targetDate: new Date('2026-12-31') });
      goalId = goal._id;
    });

    it('returns milestones for a goal', async () => {
      await Milestone.create({ goalId, title: 'M1', targetDate: new Date('2026-12-31') });

      const res = await request(app)
        .get(`/api/business-execution/milestones?goalId=${goalId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get(`/api/business-execution/milestones?goalId=${goalId}`);
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/business-execution/milestones/:id', () => {
    it('updates a milestone', async () => {
      const goal = await BusinessGoal.create({ userId, title: 'Goal', targetDate: new Date('2026-12-31') });
      const ms   = await Milestone.create({ goalId: goal._id, title: 'Original', targetDate: new Date('2026-12-31') });

      const res = await request(app)
        .put(`/api/business-execution/milestones/${ms._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated');
    });
  });

  // ── Tasks ──────────────────────────────────────────────────────────────────

  describe('POST /api/business-execution/tasks', () => {
    let milestoneId;

    beforeEach(async () => {
      const goal = await BusinessGoal.create({ userId, title: 'Goal', targetDate: new Date('2026-12-31') });
      const ms   = await Milestone.create({ goalId: goal._id, title: 'M1', targetDate: new Date('2026-12-31') });
      milestoneId = ms._id;
    });

    it('creates a task and returns 201', async () => {
      const res = await request(app)
        .post('/api/business-execution/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ milestoneId: milestoneId.toString(), title: 'Task A', dueDate: '2026-12-31' });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Task A');
    });

    it('returns 404 when milestone not found', async () => {
      const res = await request(app)
        .post('/api/business-execution/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ milestoneId: new mongoose.Types.ObjectId().toString(), title: 'T', dueDate: '2026-12-31' });
      expect(res.status).toBe(404);
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/business-execution/tasks')
        .send({ milestoneId: milestoneId.toString(), title: 'T', dueDate: '2026-12-31' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/business-execution/tasks', () => {
    let milestoneId;

    beforeEach(async () => {
      const goal = await BusinessGoal.create({ userId, title: 'Goal', targetDate: new Date('2026-12-31') });
      const ms   = await Milestone.create({ goalId: goal._id, title: 'M1', targetDate: new Date('2026-12-31') });
      milestoneId = ms._id;
    });

    it('returns tasks for a milestone', async () => {
      await Task.create({ milestoneId, title: 'T1', dueDate: new Date('2026-12-31') });

      const res = await request(app)
        .get(`/api/business-execution/tasks?milestoneId=${milestoneId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get(`/api/business-execution/tasks?milestoneId=${milestoneId}`);
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/business-execution/tasks/:id', () => {
    it('updates a task', async () => {
      const goal = await BusinessGoal.create({ userId, title: 'Goal', targetDate: new Date('2026-12-31') });
      const ms   = await Milestone.create({ goalId: goal._id, title: 'M1', targetDate: new Date('2026-12-31') });
      const task = await Task.create({ milestoneId: ms._id, title: 'Original', dueDate: new Date('2026-12-31') });

      const res = await request(app)
        .put(`/api/business-execution/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated', status: 'In Progress' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated');
      expect(res.body.data.status).toBe('In Progress');
    });
  });

  // ── KPIs ───────────────────────────────────────────────────────────────────

  describe('POST /api/business-execution/kpis', () => {
    it('creates a KPI and returns 201', async () => {
      const res = await request(app)
        .post('/api/business-execution/kpis')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Monthly Revenue', targetValue: 20000, currentValue: 5000, unit: '₹' });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Monthly Revenue');
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/business-execution/kpis')
        .send({ name: 'KPI', targetValue: 100 });
      expect(res.status).toBe(401);
    });

    it('returns 400 when targetValue is negative', async () => {
      const res = await request(app)
        .post('/api/business-execution/kpis')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Bad KPI', targetValue: -100 });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/business-execution/kpis', () => {
    it('returns KPIs for authenticated user', async () => {
      await KPI.create({ userId, name: 'KPI A', targetValue: 100 });

      const res = await request(app)
        .get('/api/business-execution/kpis')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/business-execution/kpis');
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/business-execution/kpis/:id', () => {
    it('updates a KPI', async () => {
      const kpi = await KPI.create({ userId, name: 'KPI A', targetValue: 100, currentValue: 30 });

      const res = await request(app)
        .put(`/api/business-execution/kpis/${kpi._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ currentValue: 75 });

      expect(res.status).toBe(200);
      expect(res.body.data.currentValue).toBe(75);
    });

    it('returns 404 for another user\'s KPI', async () => {
      const otherKPI = await KPI.create({
        userId: new mongoose.Types.ObjectId(),
        name:   'Other KPI',
        targetValue: 100,
      });

      const res = await request(app)
        .put(`/api/business-execution/kpis/${otherKPI._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ currentValue: 50 });

      expect(res.status).toBe(404);
    });
  });

  // ── Phase 2 — Progress Engine ──────────────────────────────────────────────

  describe('GET /api/business-execution/goals/:id/progress', () => {
    it('returns goal progress object', async () => {
      const goal = await BusinessGoal.create({ userId, title: 'Goal', targetDate: new Date('2026-12-31') });
      const ms   = await Milestone.create({ goalId: goal._id, title: 'M1', targetDate: new Date('2026-12-31') });
      await Task.create({ milestoneId: ms._id, title: 'T1', dueDate: new Date('2026-12-31'), status: 'Completed', completedAt: new Date() });
      await Task.create({ milestoneId: ms._id, title: 'T2', dueDate: new Date('2026-12-31'), status: 'Pending' });

      const res = await request(app)
        .get(`/api/business-execution/goals/${goal._id}/progress`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('progress');
      expect(res.body.data).toHaveProperty('status');
      expect(res.body.data).toHaveProperty('totalTasks');
      expect(res.body.data).toHaveProperty('completedTasks');
      expect(res.body.data.progress).toBe(50);
    });

    it('returns 404 for non-existent goal', async () => {
      const res = await request(app)
        .get(`/api/business-execution/goals/${new mongoose.Types.ObjectId()}/progress`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/business-execution/dashboard', () => {
    it('returns dashboard summary with required fields', async () => {
      await BusinessGoal.create({ userId, title: 'G1', targetDate: new Date('2026-12-31') });
      await KPI.create({ userId, name: 'KPI A', targetValue: 100, currentValue: 60 });

      const res = await request(app)
        .get('/api/business-execution/dashboard')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('totalGoals');
      expect(res.body.data).toHaveProperty('completedGoals');
      expect(res.body.data).toHaveProperty('pendingGoals');
      expect(res.body.data).toHaveProperty('averageProgress');
      expect(res.body.data).toHaveProperty('upcomingDeadlines');
      expect(res.body.data).toHaveProperty('overdueTasks');
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/business-execution/dashboard');
      expect(res.status).toBe(401);
    });
  });

  // ── Phase 3 — Analytics Engine ─────────────────────────────────────────────

  describe('GET /api/business-execution/analytics', () => {
    it('returns analytics with required fields', async () => {
      const goal = await BusinessGoal.create({ userId, title: 'G1', targetDate: new Date('2026-12-31') });
      const ms   = await Milestone.create({ goalId: goal._id, title: 'M1', targetDate: new Date('2026-12-31') });
      await Task.create({ milestoneId: ms._id, title: 'T1', dueDate: new Date('2026-12-31'), status: 'Completed', completedAt: new Date() });
      await KPI.create({ userId, name: 'Revenue', targetValue: 50000, currentValue: 25000, unit: '₹' });

      const res = await request(app)
        .get('/api/business-execution/analytics')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('goalCompletionRate');
      expect(res.body.data).toHaveProperty('taskCompletionRate');
      expect(res.body.data).toHaveProperty('milestoneCompletionRate');
      expect(res.body.data).toHaveProperty('monthlyProgress');
      expect(res.body.data).toHaveProperty('weeklyProgress');
      expect(res.body.data).toHaveProperty('topKPIs');
      expect(res.body.data).toHaveProperty('recentActivity');
      expect(res.body.data).toHaveProperty('upcomingTasks');
      expect(res.body.data).toHaveProperty('businessHealthScore');
      expect(res.body.data).toHaveProperty('businessReadinessScore');
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/business-execution/analytics');
      expect(res.status).toBe(401);
    });

    it('returns empty-safe analytics when no data exists', async () => {
      const res = await request(app)
        .get('/api/business-execution/analytics')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.goalCompletionRate).toBe(0);
      expect(res.body.data.taskCompletionRate).toBe(0);
      expect(Array.isArray(res.body.data.topKPIs)).toBe(true);
    });
  });
});
