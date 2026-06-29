'use strict';

/**
 * Unit Tests — notificationService (Sprint 9 Phase 2)
 */

require('../../setup');
const mongoose = require('mongoose');

process.env.NODE_ENV           = 'test';
process.env.JWT_SECRET         = 'test-jwt-secret-key';

const NotificationService = require('../../../services/notificationService');
const Notification        = require('../../../models/Notification');
const BusinessGoal        = require('../../../models/BusinessGoal');
const Milestone           = require('../../../models/Milestone');
const Task                = require('../../../models/Task');
const KPI                 = require('../../../models/KPI');

describe('NotificationService', () => {
  const userId = new mongoose.Types.ObjectId();

  // ── generateNotifications ─────────────────────────────────────────────────

  describe('generateNotifications', () => {
    it('creates weekly_reminder when user has no goals', async () => {
      const result = await NotificationService.generateNotifications(userId);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0].type).toBe('weekly_reminder');
    });

    it('creates overdue_task notification for overdue tasks', async () => {
      const goal = await BusinessGoal.create({
        userId, title: 'Goal', targetDate: new Date('2027-12-31'), status: 'In Progress',
      });
      const ms = await Milestone.create({
        goalId: goal._id, title: 'M1', targetDate: new Date('2027-12-31'),
      });
      await Task.create({
        milestoneId: ms._id,
        title: 'Overdue Task',
        dueDate: new Date('2020-01-01'),
        status: 'Pending',
      });

      const result = await NotificationService.generateNotifications(userId);
      const types = result.map((n) => n.type);
      expect(types).toContain('overdue_task');
    });

    it('creates kpi_decline notification when KPI is below 50%', async () => {
      await BusinessGoal.create({
        userId, title: 'G1', targetDate: new Date('2027-12-31'), status: 'In Progress',
      });
      await KPI.create({
        userId, name: 'Revenue', targetValue: 100, currentValue: 20, unit: '₹',
      });

      const result = await NotificationService.generateNotifications(userId);
      const types = result.map((n) => n.type);
      expect(types).toContain('kpi_decline');
    });

    it('creates missed_deadline notification for overdue goal', async () => {
      await BusinessGoal.create({
        userId,
        title: 'Old Goal',
        targetDate: new Date('2020-01-01'),
        status: 'In Progress',
      });

      const result = await NotificationService.generateNotifications(userId);
      const types = result.map((n) => n.type);
      expect(types).toContain('missed_deadline');
    });

    it('does not create duplicate notifications within dedup window', async () => {
      const first  = await NotificationService.generateNotifications(userId);
      const second = await NotificationService.generateNotifications(userId);

      expect(first.length).toBeGreaterThan(0);
      expect(second.length).toBe(0);
    });
  });

  // ── listNotifications ─────────────────────────────────────────────────────

  describe('listNotifications', () => {
    it('returns empty array when no notifications exist', async () => {
      const result = await NotificationService.listNotifications(userId);
      expect(result).toEqual([]);
    });

    it('returns notifications for the given user', async () => {
      await Notification.create({
        userId,
        type:    'weekly_reminder',
        title:   'Test',
        message: 'Hello',
      });

      const result = await NotificationService.listNotifications(userId);
      expect(result.length).toBe(1);
      expect(result[0].userId.toString()).toBe(userId.toString());
    });

    it('does not return another user\'s notifications', async () => {
      const otherId = new mongoose.Types.ObjectId();
      await Notification.create({
        userId: otherId, type: 'weekly_reminder', title: 'Other', message: 'msg',
      });

      const result = await NotificationService.listNotifications(userId);
      expect(result.length).toBe(0);
    });

    it('returns at most 50 notifications', async () => {
      const docs = Array.from({ length: 60 }, (_, i) => ({
        userId,
        type:    'weekly_reminder',
        title:   `N${i}`,
        message: `msg ${i}`,
      }));
      await Notification.insertMany(docs);

      const result = await NotificationService.listNotifications(userId);
      expect(result.length).toBeLessThanOrEqual(50);
    });
  });

  // ── markRead ──────────────────────────────────────────────────────────────

  describe('markRead', () => {
    it('marks a notification as read', async () => {
      const notif = await Notification.create({
        userId, type: 'weekly_reminder', title: 'Test', message: 'msg', read: false,
      });

      const result = await NotificationService.markRead(notif._id, userId);
      expect(result.read).toBe(true);
    });

    it('throws 404 when notification does not exist', async () => {
      await expect(
        NotificationService.markRead(new mongoose.Types.ObjectId(), userId)
      ).rejects.toThrow('Notification not found');
    });

    it('throws 404 when notification belongs to another user', async () => {
      const otherId = new mongoose.Types.ObjectId();
      const notif = await Notification.create({
        userId: otherId, type: 'weekly_reminder', title: 'Other', message: 'msg',
      });

      await expect(
        NotificationService.markRead(notif._id, userId)
      ).rejects.toThrow('Notification not found');
    });
  });
});
