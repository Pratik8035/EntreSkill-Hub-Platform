'use strict';

/**
 * progressEngine.js — Sprint 8 Phase 2
 *
 * Automatic progress and status calculations for Business Goals, Milestones, and KPIs.
 *
 * Public API
 * ──────────
 *   ProgressEngine.calculateGoalProgress(goalId)
 *   ProgressEngine.calculateMilestoneProgress(milestoneId)
 *   ProgressEngine.calculateKPIProgress(kpi)
 *   ProgressEngine.getDashboardSummary(userId)
 *   ProgressEngine.updateGoalStatus(goalId)
 */

const mongoose = require('mongoose');
const BusinessGoal = require('../models/BusinessGoal');
const Milestone    = require('../models/Milestone');
const Task         = require('../models/Task');
const KPI          = require('../models/KPI');

class ProgressEngine {

  // ── Goal Progress ─────────────────────────────────────────────────────────

  /**
   * Calculate a goal's progress as percentage of completed tasks vs total tasks
   * across all its milestones. Also derives and saves the appropriate status.
   *
   * @param {string|ObjectId} goalId
   * @returns {Promise<{ progress: number, status: string, totalTasks: number, completedTasks: number }>}
   */
  static async calculateGoalProgress(goalId) {
    const milestones = await Milestone.find({ goalId }).lean();

    if (milestones.length === 0) {
      return { progress: 0, status: 'Not Started', totalTasks: 0, completedTasks: 0 };
    }

    const milestoneIds = milestones.map((m) => m._id);
    const [totalTasks, completedTasks] = await Promise.all([
      Task.countDocuments({ milestoneId: { $in: milestoneIds } }),
      Task.countDocuments({ milestoneId: { $in: milestoneIds }, status: 'Completed' }),
    ]);

    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const status   = ProgressEngine._deriveGoalStatus(progress, completedTasks, totalTasks);

    // Persist status back to goal
    await BusinessGoal.findByIdAndUpdate(goalId, { status });

    return { progress, status, totalTasks, completedTasks };
  }

  /**
   * Derive goal status from progress percentage.
   * Not Started (0%) → In Progress (1-99%) → Completed (100%)
   */
  static _deriveGoalStatus(progress, completedTasks, totalTasks) {
    if (totalTasks === 0)       return 'Not Started';
    if (progress >= 100)        return 'Completed';
    if (completedTasks === 0)   return 'Not Started';
    return 'In Progress';
  }

  // ── Milestone Progress ────────────────────────────────────────────────────

  /**
   * Calculate a milestone's progress as percentage of its completed tasks.
   *
   * @param {string|ObjectId} milestoneId
   * @returns {Promise<{ progress: number, totalTasks: number, completedTasks: number }>}
   */
  static async calculateMilestoneProgress(milestoneId) {
    const [totalTasks, completedTasks] = await Promise.all([
      Task.countDocuments({ milestoneId }),
      Task.countDocuments({ milestoneId, status: 'Completed' }),
    ]);

    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Auto-complete milestone when all tasks are done
    if (totalTasks > 0 && completedTasks === totalTasks) {
      await Milestone.findByIdAndUpdate(milestoneId, {
        completed:   true,
        completedAt: new Date(),
      });
    }

    return { progress, totalTasks, completedTasks };
  }

  // ── KPI Progress ──────────────────────────────────────────────────────────

  /**
   * Calculate KPI progress as percentage of currentValue / targetValue.
   * Returns a categorized progress object covering all four KPI categories.
   *
   * @param {object} kpi  - KPI document (name, currentValue, targetValue, unit)
   * @returns {{ percentage: number, category: string, onTrack: boolean }}
   */
  static calculateKPIProgress(kpi) {
    const { currentValue = 0, targetValue = 1, name = '' } = kpi;
    const percentage = targetValue > 0
      ? Math.min(100, Math.round((currentValue / targetValue) * 100))
      : 0;

    const nameLower  = name.toLowerCase();
    let category = 'Business Growth';

    if (/revenue|sales|income|₹/.test(nameLower)) {
      category = 'Revenue Progress';
    } else if (/customer|client|user|subscriber/.test(nameLower)) {
      category = 'Customer Progress';
    } else if (/marketing|reach|conversion|rate|engagement/.test(nameLower)) {
      category = 'Marketing Progress';
    }

    return {
      percentage,
      category,
      onTrack: percentage >= 50,
    };
  }

  // ── Dashboard Summary ─────────────────────────────────────────────────────

  /**
   * Compute a full dashboard summary for a user.
   *
   * @param {string|ObjectId} userId
   * @returns {Promise<DashboardSummary>}
   */
  static async getDashboardSummary(userId) {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Parallel fetch
    const [goals, kpis] = await Promise.all([
      BusinessGoal.find({ userId }).lean(),
      KPI.find({ userId }).lean(),
    ]);

    if (goals.length === 0) {
      return {
        totalGoals:        0,
        completedGoals:    0,
        pendingGoals:      0,
        averageProgress:   0,
        upcomingDeadlines: [],
        overdueTasks:      [],
        kpiSummary:        [],
      };
    }

    // Calculate per-goal progress in parallel
    const goalProgresses = await Promise.all(
      goals.map((g) => ProgressEngine.calculateGoalProgress(g._id))
    );

    const totalGoals     = goals.length;
    const completedGoals = goalProgresses.filter((g) => g.status === 'Completed').length;
    const pendingGoals   = totalGoals - completedGoals;
    const averageProgress = Math.round(
      goalProgresses.reduce((sum, g) => sum + g.progress, 0) / totalGoals
    );

    // Upcoming deadlines — goals with target date within 7 days
    const upcomingDeadlines = goals
      .filter((g) => g.targetDate && g.targetDate > now && g.targetDate <= sevenDaysFromNow)
      .map((g) => ({
        id:         g._id,
        title:      g.title,
        targetDate: g.targetDate,
        type:       'goal',
      }))
      .slice(0, 5);

    // Overdue tasks — tasks past due date and not completed
    const allMilestoneIds = await Milestone.find({
      goalId: { $in: goals.map((g) => g._id) },
    }).distinct('_id');

    const overdueTasks = await Task.find({
      milestoneId: { $in: allMilestoneIds },
      dueDate:     { $lt: now },
      status:      { $ne: 'Completed' },
    })
      .sort({ dueDate: 1 })
      .limit(5)
      .lean();

    // KPI summary
    const kpiSummary = kpis.map((kpi) => ({
      id:           kpi._id,
      name:         kpi.name,
      currentValue: kpi.currentValue,
      targetValue:  kpi.targetValue,
      unit:         kpi.unit,
      ...ProgressEngine.calculateKPIProgress(kpi),
    }));

    return {
      totalGoals,
      completedGoals,
      pendingGoals,
      averageProgress,
      upcomingDeadlines,
      overdueTasks,
      kpiSummary,
    };
  }
}

module.exports = ProgressEngine;
