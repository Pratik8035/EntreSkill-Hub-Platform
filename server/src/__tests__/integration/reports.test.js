'use strict';

/**
 * Integration Tests — Reports API (Sprint 9 Phase 3)
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
  const email = `reports_${Date.now()}@test.com`;
  const reg = await request(app).post('/api/auth/register').send({
    name: 'Report Test User', email, password: 'password123',
  });
  const token = reg.body.data.token;
  const jwt   = require('jsonwebtoken');
  const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);
  return { token, userId };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Reports API (Sprint 9)', () => {
  let token;
  let userId;

  beforeEach(async () => {
    ({ token, userId } = await registerAndLogin());
  });

  // ── GET /api/reports ───────────────────────────────────────────────────────

  describe('GET /api/reports', () => {
    it('returns 200 with the list of report types', async () => {
      const res = await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('includes expected report type keys', async () => {
      const res = await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${token}`);

      const types = res.body.data.map((r) => r.type);
      expect(types).toContain('business_summary');
      expect(types).toContain('goal_report');
      expect(types).toContain('kpi_report');
      expect(types).toContain('execution_report');
      expect(types).toContain('analytics_report');
      expect(types).toContain('monthly_report');
      expect(types).toContain('weekly_report');
    });

    it('each report type has type, label, and description', async () => {
      const res = await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${token}`);

      for (const entry of res.body.data) {
        expect(entry).toHaveProperty('type');
        expect(entry).toHaveProperty('label');
        expect(entry).toHaveProperty('description');
      }
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/reports');
      expect(res.status).toBe(401);
    });
  });

  // ── GET /api/reports/:type — business_summary ─────────────────────────────

  describe('GET /api/reports/business_summary', () => {
    it('returns 200 with business_summary report structure', async () => {
      const res = await request(app)
        .get('/api/reports/business_summary')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.type).toBe('business_summary');
      expect(res.body.data).toHaveProperty('businessHealthScore');
      expect(res.body.data).toHaveProperty('businessReadinessScore');
      expect(res.body.data).toHaveProperty('goalCompletionRate');
      expect(res.body.data).toHaveProperty('taskCompletionRate');
      expect(res.body.data).toHaveProperty('generatedAt');
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/reports/business_summary');
      expect(res.status).toBe(401);
    });
  });

  // ── GET /api/reports/goal_report ─────────────────────────────────────────

  describe('GET /api/reports/goal_report', () => {
    it('returns empty goal report when user has no goals', async () => {
      const res = await request(app)
        .get('/api/reports/goal_report')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.type).toBe('goal_report');
      expect(res.body.data.totalGoals).toBe(0);
      expect(Array.isArray(res.body.data.goals)).toBe(true);
    });

    it('returns goal data with progress', async () => {
      const goal = await BusinessGoal.create({
        userId, title: 'Test Goal', targetDate: new Date('2027-12-31'),
      });
      const ms = await Milestone.create({
        goalId: goal._id, title: 'M1', targetDate: new Date('2027-12-31'),
      });
      await Task.create({
        milestoneId: ms._id, title: 'T1', dueDate: new Date('2027-12-31'),
        status: 'Completed', completedAt: new Date(),
      });

      const res = await request(app)
        .get('/api/reports/goal_report')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalGoals).toBe(1);
      expect(res.body.data.goals[0]).toHaveProperty('progress');
      expect(res.body.data).toHaveProperty('byStatus');
    });
  });

  // ── GET /api/reports/kpi_report ──────────────────────────────────────────

  describe('GET /api/reports/kpi_report', () => {
    it('returns kpi_report structure', async () => {
      await KPI.create({
        userId, name: 'Monthly Revenue', targetValue: 50000, currentValue: 30000, unit: '₹',
      });

      const res = await request(app)
        .get('/api/reports/kpi_report')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.type).toBe('kpi_report');
      expect(res.body.data).toHaveProperty('totalKPIs');
      expect(res.body.data).toHaveProperty('onTrack');
      expect(res.body.data).toHaveProperty('belowTarget');
      expect(Array.isArray(res.body.data.kpis)).toBe(true);
      expect(res.body.data.totalKPIs).toBe(1);
    });
  });

  // ── GET /api/reports/execution_report ────────────────────────────────────

  describe('GET /api/reports/execution_report', () => {
    it('returns execution_report structure', async () => {
      const goal = await BusinessGoal.create({
        userId, title: 'G1', targetDate: new Date('2027-12-31'),
      });
      const ms = await Milestone.create({
        goalId: goal._id, title: 'M1', targetDate: new Date('2027-12-31'),
      });
      await Task.create({
        milestoneId: ms._id, title: 'T1', dueDate: new Date('2027-12-31'),
        status: 'Completed', completedAt: new Date(),
      });
      await Task.create({
        milestoneId: ms._id, title: 'T2', dueDate: new Date('2027-12-31'),
        status: 'Pending',
      });

      const res = await request(app)
        .get('/api/reports/execution_report')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.type).toBe('execution_report');
      expect(res.body.data).toHaveProperty('milestones');
      expect(res.body.data).toHaveProperty('tasks');
      expect(res.body.data.tasks.total).toBe(2);
      expect(res.body.data.tasks.completed).toBe(1);
    });
  });

  // ── GET /api/reports/analytics_report ────────────────────────────────────

  describe('GET /api/reports/analytics_report', () => {
    it('returns analytics_report with full analytics payload', async () => {
      const res = await request(app)
        .get('/api/reports/analytics_report')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.type).toBe('analytics_report');
      expect(res.body.data).toHaveProperty('goalCompletionRate');
      expect(res.body.data).toHaveProperty('taskCompletionRate');
      expect(res.body.data).toHaveProperty('businessHealthScore');
    });
  });

  // ── GET /api/reports/weekly_report ───────────────────────────────────────

  describe('GET /api/reports/weekly_report', () => {
    it('returns weekly_report structure', async () => {
      const res = await request(app)
        .get('/api/reports/weekly_report')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.type).toBe('weekly_report');
      expect(res.body.data).toHaveProperty('period');
      expect(res.body.data).toHaveProperty('from');
      expect(res.body.data).toHaveProperty('to');
      expect(res.body.data).toHaveProperty('tasksCompleted');
      expect(res.body.data).toHaveProperty('milestonesCompleted');
      expect(Array.isArray(res.body.data.tasks)).toBe(true);
    });
  });

  // ── GET /api/reports/monthly_report ──────────────────────────────────────

  describe('GET /api/reports/monthly_report', () => {
    it('returns monthly_report structure', async () => {
      const res = await request(app)
        .get('/api/reports/monthly_report')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.type).toBe('monthly_report');
      expect(res.body.data.period).toBe('monthly');
      expect(res.body.data).toHaveProperty('tasksCompleted');
      expect(res.body.data).toHaveProperty('milestonesCompleted');
    });
  });

  // ── GET /api/reports/:type — unknown type ─────────────────────────────────

  describe('GET /api/reports/:type — unknown type', () => {
    it('returns 400 for unknown report type', async () => {
      const res = await request(app)
        .get('/api/reports/unknown_type')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
    });
  });
});
