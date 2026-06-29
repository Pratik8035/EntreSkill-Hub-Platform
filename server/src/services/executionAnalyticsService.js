'use strict';

/**
 * executionAnalyticsService.js — Sprint 8 Phase 3
 *
 * Analytics engine for business execution data.
 *
 * Public API
 * ──────────
 *   ExecutionAnalyticsService.getAnalytics(userId)
 *     → full analytics payload
 */

const BusinessGoal = require('../models/BusinessGoal');
const Milestone    = require('../models/Milestone');
const Task         = require('../models/Task');
const KPI          = require('../models/KPI');
const ProgressEngine = require('./progressEngine');

class ExecutionAnalyticsService {

  /**
   * Generate comprehensive execution analytics for a user.
   *
   * @param {string|ObjectId} userId
   * @returns {Promise<ExecutionAnalytics>}
   */
  static async getAnalytics(userId) {
    const now  = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // ── 1. Load all data in parallel ────────────────────────────────────────
    const goals = await BusinessGoal.find({ userId }).lean();
    const goalIds = goals.map((g) => g._id);

    const [milestones, kpis] = await Promise.all([
      Milestone.find({ goalId: { $in: goalIds } }).lean(),
      KPI.find({ userId }).lean(),
    ]);

    const milestoneIds = milestones.map((m) => m._id);
    const tasks = await Task.find({ milestoneId: { $in: milestoneIds } }).lean();

    // ── 2. Completion rates ──────────────────────────────────────────────────
    const completedGoals      = goals.filter((g) => g.status === 'Completed').length;
    const completedMilestones = milestones.filter((m) => m.completed).length;
    const completedTasks      = tasks.filter((t) => t.status === 'Completed').length;

    const goalCompletionRate      = goals.length      > 0 ? Math.round((completedGoals      / goals.length)      * 100) : 0;
    const milestoneCompletionRate = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;
    const taskCompletionRate      = tasks.length      > 0 ? Math.round((completedTasks      / tasks.length)      * 100) : 0;

    // ── 3. Monthly progress — tasks completed per month (last 6 months) ──────
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyProgress = ExecutionAnalyticsService._groupByMonth(
      tasks.filter((t) => t.status === 'Completed' && t.completedAt && t.completedAt >= sixMonthsAgo),
      'completedAt'
    );

    // ── 4. Weekly progress — tasks completed per week (last 4 weeks) ─────────
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    const weeklyProgress = ExecutionAnalyticsService._groupByWeek(
      tasks.filter((t) => t.status === 'Completed' && t.completedAt && t.completedAt >= fourWeeksAgo),
      'completedAt'
    );

    // ── 5. Top KPIs by percentage ─────────────────────────────────────────────
    const topKPIs = kpis
      .map((kpi) => ({
        id:           kpi._id,
        name:         kpi.name,
        currentValue: kpi.currentValue,
        targetValue:  kpi.targetValue,
        unit:         kpi.unit,
        ...ProgressEngine.calculateKPIProgress(kpi),
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 4);

    // ── 6. Recent activity — last 10 completed tasks ──────────────────────────
    const recentActivity = tasks
      .filter((t) => t.status === 'Completed' && t.completedAt)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 10)
      .map((t) => ({
        id:          t._id,
        title:       t.title,
        type:        'task_completed',
        completedAt: t.completedAt,
      }));

    // ── 7. Upcoming tasks — due in next 7 days, not completed ────────────────
    const upcomingTasks = tasks
      .filter((t) => t.status !== 'Completed' && t.dueDate && t.dueDate >= now && t.dueDate <= sevenDaysFromNow)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 10)
      .map((t) => ({
        id:      t._id,
        title:   t.title,
        dueDate: t.dueDate,
        status:  t.status,
      }));

    // ── 8. Business Health Score (0-100) ─────────────────────────────────────
    const businessHealthScore = ExecutionAnalyticsService._calculateHealthScore({
      goalCompletionRate,
      taskCompletionRate,
      milestoneCompletionRate,
      kpiAvgPercentage: topKPIs.length > 0
        ? Math.round(topKPIs.reduce((s, k) => s + k.percentage, 0) / topKPIs.length)
        : 0,
      hasGoals:      goals.length > 0,
      hasTasks:      tasks.length > 0,
    });

    // ── 9. Business Readiness Score (0-100) ───────────────────────────────────
    const businessReadinessScore = ExecutionAnalyticsService._calculateReadinessScore({
      goals,
      milestones,
      tasks,
      kpis,
      taskCompletionRate,
      goalCompletionRate,
    });

    return {
      // Completion rates
      goalCompletionRate,
      taskCompletionRate,
      milestoneCompletionRate,
      // Counts
      totalGoals:           goals.length,
      completedGoals,
      totalMilestones:      milestones.length,
      completedMilestones,
      totalTasks:           tasks.length,
      completedTasks,
      // Time series
      monthlyProgress,
      weeklyProgress,
      // KPIs
      topKPIs,
      // Activity
      recentActivity,
      upcomingTasks,
      // Scores
      businessHealthScore,
      businessReadinessScore,
    };
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Group items by calendar month, return [{month, count}] for last 6 months.
   */
  static _groupByMonth(items, dateField) {
    const now = new Date();
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      const count = items.filter((item) => {
        const date = new Date(item[dateField]);
        return date.getFullYear() === d.getFullYear() && date.getMonth() === d.getMonth();
      }).length;
      result.push({ month: label, count });
    }
    return result;
  }

  /**
   * Group items by ISO week number (last 4 weeks).
   */
  static _groupByWeek(items, dateField) {
    const now = new Date();
    const result = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd   = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const label     = `W${4 - i}`;
      const count     = items.filter((item) => {
        const date = new Date(item[dateField]);
        return date >= weekStart && date < weekEnd;
      }).length;
      result.push({ week: label, count });
    }
    return result;
  }

  /**
   * Business Health Score: weighted average of completion rates + KPI performance.
   * Tasks (35%) + Goals (25%) + Milestones (20%) + KPIs (20%)
   */
  static _calculateHealthScore({ goalCompletionRate, taskCompletionRate, milestoneCompletionRate, kpiAvgPercentage, hasGoals, hasTasks }) {
    if (!hasGoals && !hasTasks) return 0;
    const score =
      taskCompletionRate      * 0.35 +
      goalCompletionRate      * 0.25 +
      milestoneCompletionRate * 0.20 +
      kpiAvgPercentage        * 0.20;
    return Math.round(score);
  }

  /**
   * Business Readiness Score: evaluates structural completeness of the execution plan.
   * Has goals (+20), has milestones (+20), has tasks (+20), has KPIs (+20), progress (+20)
   */
  static _calculateReadinessScore({ goals, milestones, tasks, kpis, taskCompletionRate, goalCompletionRate }) {
    let score = 0;
    if (goals.length >= 1)      score += 20;
    if (milestones.length >= 3) score += 20;
    if (tasks.length >= 5)      score += 20;
    if (kpis.length >= 1)       score += 20;
    // Progress bonus: up to 20 pts based on combined completion
    const progressPct = Math.round((taskCompletionRate + goalCompletionRate) / 2);
    score += Math.round(progressPct * 0.20);
    return Math.min(100, score);
  }
}

module.exports = ExecutionAnalyticsService;
