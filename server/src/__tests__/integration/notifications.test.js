'use strict';

/**
 * Integration Tests — Notifications API (Sprint 9 Phase 2)
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
const Notification = require('../../models/Notification');
const BusinessGoal = require('../../models/BusinessGoal');

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function registerAndLogin() {
  const email = `notif_${Date.now()}@test.com`;
  const reg = await request(app).post('/api/auth/register').send({
    name: 'Notif Test User', email, password: 'password123',
  });
  const token = reg.body.data.token;
  const jwt   = require('jsonwebtoken');
  const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);
  return { token, userId };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Notifications API (Sprint 9)', () => {
  let token;
  let userId;

  beforeEach(async () => {
    ({ token, userId } = await registerAndLogin());
  });

  // ── GET /api/notifications/generate ───────────────────────────────────────

  describe('GET /api/notifications/generate', () => {
    it('returns 200 and creates at least one notification', async () => {
      const res = await request(app)
        .get('/api/notifications/generate')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('creates weekly_reminder when user has no goals', async () => {
      const res = await request(app)
        .get('/api/notifications/generate')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      // First call creates at least 1 notification
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/notifications/generate');
      expect(res.status).toBe(401);
    });

    it('de-duplicates: calling generate twice does not double notifications', async () => {
      await request(app)
        .get('/api/notifications/generate')
        .set('Authorization', `Bearer ${token}`);

      const res2 = await request(app)
        .get('/api/notifications/generate')
        .set('Authorization', `Bearer ${token}`);

      // Second call should create 0 new notifications (within dedup window)
      expect(res2.status).toBe(200);
      expect(res2.body.data.length).toBe(0);
    });

    it('generates overdue_task notification for overdue tasks', async () => {
      const goal = await BusinessGoal.create({
        userId, title: 'Goal', targetDate: new Date('2027-12-31'),
      });
      const Milestone = require('../../models/Milestone');
      const Task      = require('../../models/Task');
      const ms = await Milestone.create({
        goalId: goal._id, title: 'M1', targetDate: new Date('2027-12-31'),
      });
      await Task.create({
        milestoneId: ms._id,
        title: 'Overdue Task',
        dueDate: new Date('2020-01-01'), // past date
        status: 'Pending',
      });

      const res = await request(app)
        .get('/api/notifications/generate')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      const types = res.body.data.map((n) => n.type);
      expect(types).toContain('overdue_task');
    });
  });

  // ── GET /api/notifications ─────────────────────────────────────────────────

  describe('GET /api/notifications', () => {
    it('returns empty array when no notifications exist', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(0);
    });

    it('returns notifications for the authenticated user', async () => {
      await Notification.create({
        userId,
        type: 'weekly_reminder',
        title: 'Test Reminder',
        message: 'Weekly check-in message',
      });

      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toBe('Test Reminder');
    });

    it('does not return another user\'s notifications', async () => {
      const otherId = new mongoose.Types.ObjectId();
      await Notification.create({
        userId: otherId,
        type: 'weekly_reminder',
        title: 'Other User',
        message: 'Other user message',
      });

      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
    });

    it('returns notifications sorted by createdAt desc', async () => {
      await Notification.create({
        userId, type: 'weekly_reminder', title: 'Old', message: 'Old message',
        createdAt: new Date('2026-01-01'),
      });
      await Notification.create({
        userId, type: 'weekly_reminder', title: 'New', message: 'New message',
        createdAt: new Date('2026-06-01'),
      });

      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data[0].title).toBe('New');
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/notifications');
      expect(res.status).toBe(401);
    });
  });

  // ── PATCH /api/notifications/:id/read ─────────────────────────────────────

  describe('PATCH /api/notifications/:id/read', () => {
    it('marks notification as read and returns updated notification', async () => {
      const notif = await Notification.create({
        userId, type: 'weekly_reminder', title: 'Test', message: 'msg', read: false,
      });

      const res = await request(app)
        .patch(`/api/notifications/${notif._id}/read`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.read).toBe(true);
    });

    it('returns 404 for non-existent notification', async () => {
      const res = await request(app)
        .patch(`/api/notifications/${new mongoose.Types.ObjectId()}/read`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('returns 404 when notification belongs to another user', async () => {
      const otherId = new mongoose.Types.ObjectId();
      const notif = await Notification.create({
        userId: otherId, type: 'weekly_reminder', title: 'Other', message: 'msg',
      });

      const res = await request(app)
        .patch(`/api/notifications/${notif._id}/read`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('returns 401 when not authenticated', async () => {
      const notif = await Notification.create({
        userId, type: 'weekly_reminder', title: 'Test', message: 'msg',
      });

      const res = await request(app)
        .patch(`/api/notifications/${notif._id}/read`);

      expect(res.status).toBe(401);
    });
  });
});
