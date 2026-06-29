'use strict';

/**
 * notificationService.js — Sprint 9 Phase 2
 *
 * Detects execution events and persists Notification documents.
 * No email or SMS — in-app only.
 *
 * Public API
 * ──────────
 *   NotificationService.generateNotifications(userId) → Notification[]
 *   NotificationService.listNotifications(userId)     → Notification[]
 *   NotificationService.markRead(notificationId, userId) → Notification
 */

const BusinessGoal = require('../models/BusinessGoal');
const Milestone    = require('../models/Milestone');
const Task         = require('../models/Task');
const KPI          = require('../models/KPI');
const Notification = require('../models/Notification');
const AppError     = require('../utils/AppError');

// De-dupe window — don't re-create the same notification within 24 h
const DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000;

class NotificationService {

  // ── Public API ─────────────────────────────────────────────────────────────

  static async generateNotifications(userId) {
    const now = new Date();
    const created = [];

    const [goals, kpis] = await Promise.all([
      BusinessGoal.find({ userId }).lean(),
      KPI.find({ userId }).lean(),
    ]);

    if (goals.length === 0) {
      // Weekly reminder to create goals
      await NotificationService._upsert(userId, {
        type:    'weekly_reminder',
        title:   'Get Started on Your Business Goals',
        message: 'You have no business goals yet. Create your first goal to start tracking execution progress.',
      }, created);
      return created;
    }

    const goalIds      = goals.map((g) => g._id);
    const milestones   = await Milestone.find({ goalId: { $in: goalIds } }).lean();
    const milestoneIds = milestones.map((m) => m._id);
    const tasks        = await Task.find({ milestoneId: { $in: milestoneIds } }).lean();

    // ── Overdue tasks ───────────────────────────────────────────────────────
    const overdueTasks = tasks.filter(
      (t) => t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) < now
    );
    for (const t of overdueTasks.slice(0, 5)) {
      await NotificationService._upsert(userId, {
        type:    'overdue_task',
        title:   'Overdue Task',
        message: `Task "${t.title}" is overdue. Complete it to keep your goal on track.`,
        refId:   t._id,
        refType: 'task',
      }, created);
    }

    // ── Overdue milestones ──────────────────────────────────────────────────
    const overdueMilestones = milestones.filter(
      (m) => !m.completed && m.targetDate && new Date(m.targetDate) < now
    );
    for (const m of overdueMilestones.slice(0, 3)) {
      await NotificationService._upsert(userId, {
        type:    'overdue_milestone',
        title:   'Overdue Milestone',
        message: `Milestone "${m.title}" is overdue. Review and update its tasks.`,
        refId:   m._id,
        refType: 'milestone',
      }, created);
    }

    // ── Stalled goals (In Progress but no task completed in 7 days) ────────
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    for (const g of goals.filter((g) => g.status === 'In Progress')) {
      const gMilestoneIds = milestones.filter((m) => m.goalId.toString() === g._id.toString()).map((m) => m._id);
      const recentDone    = tasks.some(
        (t) => gMilestoneIds.some((id) => id.toString() === t.milestoneId?.toString()) &&
               t.status === 'Completed' && t.completedAt && new Date(t.completedAt) >= sevenDaysAgo
      );
      if (!recentDone) {
        await NotificationService._upsert(userId, {
          type:    'stalled_goal',
          title:   'Goal May Be Stalling',
          message: `No tasks have been completed for goal "${g.title}" in the last 7 days. Review your priorities.`,
          refId:   g._id,
          refType: 'goal',
        }, created);
      }
    }

    // ── KPI decline (currentValue < 50% of target) ─────────────────────────
    for (const kpi of kpis) {
      const pct = kpi.targetValue > 0 ? (kpi.currentValue / kpi.targetValue) * 100 : 0;
      if (pct < 50) {
        await NotificationService._upsert(userId, {
          type:    'kpi_decline',
          title:   'KPI Below Target',
          message: `KPI "${kpi.name}" is at ${Math.round(pct)}% of target. Update your current value or review strategy.`,
          refId:   kpi._id,
          refType: 'kpi',
        }, created);
      }
    }

    // ── Missed deadlines (goals past targetDate, not completed) ───────────
    for (const g of goals.filter((g) => g.status !== 'Completed' && g.targetDate && new Date(g.targetDate) < now)) {
      await NotificationService._upsert(userId, {
        type:    'missed_deadline',
        title:   'Goal Deadline Missed',
        message: `Goal "${g.title}" passed its target date without being completed. Update the deadline or adjust your plan.`,
        refId:   g._id,
        refType: 'goal',
      }, created);
    }

    // ── Low progress (goals In Progress with 0 tasks completed) ───────────
    for (const g of goals.filter((g) => g.status === 'Not Started' && g.createdAt && new Date(g.createdAt) < sevenDaysAgo)) {
      await NotificationService._upsert(userId, {
        type:    'low_progress',
        title:   'Goal Not Yet Started',
        message: `Goal "${g.title}" was created over a week ago but has no progress. Add milestones and tasks to begin.`,
        refId:   g._id,
        refType: 'goal',
      }, created);
    }

    // ── Goal completed ─────────────────────────────────────────────────────
    const recentlyCompleted = goals.filter(
      (g) => g.status === 'Completed' && g.updatedAt && new Date(g.updatedAt) >= sevenDaysAgo
    );
    for (const g of recentlyCompleted.slice(0, 2)) {
      await NotificationService._upsert(userId, {
        type:    'goal_completed',
        title:   '🎉 Goal Completed!',
        message: `Congratulations! You completed the goal "${g.title}". Keep the momentum going!`,
        refId:   g._id,
        refType: 'goal',
      }, created);
    }

    // ── Weekly reminder (if no notifications were just created) ───────────
    if (created.length === 0) {
      const pendingTasks = tasks.filter((t) => t.status !== 'Completed').length;
      await NotificationService._upsert(userId, {
        type:    'weekly_reminder',
        title:   'Weekly Execution Check-In',
        message: `You have ${pendingTasks} pending task(s) across your goals. Stay focused and complete 3 tasks this week.`,
      }, created);
    }

    return created;
  }

  static async listNotifications(userId) {
    return Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  }

  static async markRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true },
      { new: true }
    );
    if (!notification) throw new AppError('Notification not found', 404);
    return notification;
  }

  // ── Private ────────────────────────────────────────────────────────────────

  /**
   * Create notification only if an identical type+refId hasn't been created
   * within the de-duplication window.
   */
  static async _upsert(userId, data, bucket) {
    const cutoff = new Date(Date.now() - DEDUP_WINDOW_MS);
    const existing = await Notification.findOne({
      userId,
      type:   data.type,
      refId:  data.refId || null,
      createdAt: { $gte: cutoff },
    });
    if (existing) return;

    const notification = await Notification.create({ userId, ...data });
    bucket.push(notification);
  }
}

module.exports = NotificationService;
