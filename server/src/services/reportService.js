'use strict';

/**
 * reportService.js — Sprint 9 Phase 3
 *
 * Generates structured JSON reports — no PDF, no email.
 *
 * Public API
 * ──────────
 *   ReportService.listReports()             → report type registry
 *   ReportService.getReport(type, userId)   → structured report object
 *
 * Supported types:
 *   business_summary | goal_report | kpi_report |
 *   execution_report | analytics_report | monthly_report | weekly_report
 */

const BusinessGoal = require('../models/BusinessGoal');
const Milestone    = require('../models/Milestone');
const Task         = require('../models/Task');
const KPI          = require('../models/KPI');
const ExecutionAnalyticsService = require('./executionAnalyticsService');
const ProgressEngine            = require('./progressEngine');
const AppError                  = require('../utils/AppError');

const REPORT_TYPES = [
  { type: 'business_summary', label: 'Business Summary',  description: 'High-level overview of business execution status.' },
  { type: 'goal_report',      label: 'Goal Report',       description: 'Detailed status of all business goals.' },
  { type: 'kpi_report',       label: 'KPI Report',        description: 'Current KPI values vs targets.' },
  { type: 'execution_report', label: 'Execution Report',  description: 'Tasks, milestones and completion metrics.' },
  { type: 'analytics_report', label: 'Analytics Report',  description: 'Full analytics with monthly/weekly trends.' },
  { type: 'monthly_report',   label: 'Monthly Report',    description: 'Tasks and milestones completed this month.' },
  { type: 'weekly_report',    label: 'Weekly Report',     description: 'Tasks and milestones completed this week.' },
];

class ReportService {

  static listReports() {
    return REPORT_TYPES;
  }

  static async getReport(type, userId) {
    switch (type) {
      case 'business_summary': return ReportService._businessSummary(userId);
      case 'goal_report':      return ReportService._goalReport(userId);
      case 'kpi_report':       return ReportService._kpiReport(userId);
      case 'execution_report': return ReportService._executionReport(userId);
      case 'analytics_report': return ReportService._analyticsReport(userId);
      case 'monthly_report':   return ReportService._periodReport(userId, 'monthly');
      case 'weekly_report':    return ReportService._periodReport(userId, 'weekly');
      default:
        throw new AppError(`Unknown report type: ${type}`, 400);
    }
  }

  // ── Report generators ──────────────────────────────────────────────────────

  static async _businessSummary(userId) {
    const [analytics, summary] = await Promise.all([
      ExecutionAnalyticsService.getAnalytics(userId),
      ProgressEngine.getDashboardSummary(userId),
    ]);
    return {
      type: 'business_summary',
      label: 'Business Summary',
      generatedAt: new Date(),
      businessHealthScore:    analytics.businessHealthScore,
      businessReadinessScore: analytics.businessReadinessScore,
      goalCompletionRate:      analytics.goalCompletionRate,
      taskCompletionRate:      analytics.taskCompletionRate,
      milestoneCompletionRate: analytics.milestoneCompletionRate,
      totalGoals:       analytics.totalGoals,
      completedGoals:   analytics.completedGoals,
      totalTasks:       analytics.totalTasks,
      completedTasks:   analytics.completedTasks,
      overdueTasks:     summary.overdueTasks?.length ?? 0,
      upcomingDeadlines:summary.upcomingDeadlines?.length ?? 0,
      topKPIs:          analytics.topKPIs,
    };
  }

  static async _goalReport(userId) {
    const goals = await BusinessGoal.find({ userId }).lean();
    const goalDetails = await Promise.all(
      goals.map(async (g) => {
        const prog = await ProgressEngine.calculateGoalProgress(g._id);
        return { ...g, progress: prog.progress, totalTasks: prog.totalTasks, completedTasks: prog.completedTasks };
      })
    );
    return {
      type: 'goal_report', label: 'Goal Report', generatedAt: new Date(),
      totalGoals: goals.length,
      byStatus: {
        notStarted: goals.filter((g) => g.status === 'Not Started').length,
        inProgress: goals.filter((g) => g.status === 'In Progress').length,
        completed:  goals.filter((g) => g.status === 'Completed').length,
      },
      goals: goalDetails,
    };
  }

  static async _kpiReport(userId) {
    const kpis = await KPI.find({ userId }).lean();
    const kpiDetails = kpis.map((k) => ({
      ...k,
      ...ProgressEngine.calculateKPIProgress(k),
    }));
    return {
      type: 'kpi_report', label: 'KPI Report', generatedAt: new Date(),
      totalKPIs:   kpis.length,
      onTrack:     kpiDetails.filter((k) => k.onTrack).length,
      belowTarget: kpiDetails.filter((k) => !k.onTrack).length,
      kpis: kpiDetails,
    };
  }

  static async _executionReport(userId) {
    const goals = await BusinessGoal.find({ userId }).lean();
    const goalIds = goals.map((g) => g._id);
    const milestones = await Milestone.find({ goalId: { $in: goalIds } }).lean();
    const milestoneIds = milestones.map((m) => m._id);
    const tasks = await Task.find({ milestoneId: { $in: milestoneIds } }).lean();

    return {
      type: 'execution_report', label: 'Execution Report', generatedAt: new Date(),
      milestones: {
        total:     milestones.length,
        completed: milestones.filter((m) => m.completed).length,
        pending:   milestones.filter((m) => !m.completed).length,
      },
      tasks: {
        total:      tasks.length,
        completed:  tasks.filter((t) => t.status === 'Completed').length,
        inProgress: tasks.filter((t) => t.status === 'In Progress').length,
        pending:    tasks.filter((t) => t.status === 'Pending').length,
        overdue:    tasks.filter((t) => t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) < new Date()).length,
      },
      recentActivity: tasks
        .filter((t) => t.status === 'Completed' && t.completedAt)
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        .slice(0, 10)
        .map((t) => ({ id: t._id, title: t.title, completedAt: t.completedAt })),
    };
  }

  static async _analyticsReport(userId) {
    const analytics = await ExecutionAnalyticsService.getAnalytics(userId);
    return { type: 'analytics_report', label: 'Analytics Report', generatedAt: new Date(), ...analytics };
  }

  static async _periodReport(userId, period) {
    const now = new Date();
    const cutoff = period === 'weekly'
      ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      : new Date(now.getFullYear(), now.getMonth(), 1);

    const goals = await BusinessGoal.find({ userId }).lean();
    const goalIds = goals.map((g) => g._id);
    const milestones = await Milestone.find({ goalId: { $in: goalIds } }).lean();
    const milestoneIds = milestones.map((m) => m._id);
    const tasks = await Task.find({
      milestoneId: { $in: milestoneIds },
      status: 'Completed',
      completedAt: { $gte: cutoff },
    }).lean();

    const completedMilestones = milestones.filter(
      (m) => m.completed && m.completedAt && new Date(m.completedAt) >= cutoff
    );

    const label = period === 'weekly' ? 'Weekly Report' : 'Monthly Report';
    return {
      type: `${period}_report`, label, generatedAt: new Date(),
      period,
      from: cutoff,
      to: now,
      tasksCompleted:      tasks.length,
      milestonesCompleted: completedMilestones.length,
      tasks:      tasks.map((t) => ({ id: t._id, title: t.title, completedAt: t.completedAt })),
      milestones: completedMilestones.map((m) => ({ id: m._id, title: m.title, completedAt: m.completedAt })),
    };
  }
}

module.exports = ReportService;
