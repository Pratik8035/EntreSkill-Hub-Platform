'use strict';

/**
 * Unit Tests — ExecutionAnalyticsService (Sprint 8 Phase 3)
 */

require('../../setup');
const mongoose     = require('mongoose');
const BusinessGoal = require('../../../models/BusinessGoal');
const Milestone    = require('../../../models/Milestone');
const Task         = require('../../../models/Task');
const KPI          = require('../../../models/KPI');
const ExecutionAnalyticsService = require('../../../services/executionAnalyticsService');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => new mongoose.Types.ObjectId();

async function scaffoldData(userId) {
  const goal = await BusinessGoal.create({
    userId, title: 'Launch Product', targetDate: new Date('2027-06-30'), status: 'In Progress',
  });
  const ms = await Milestone.create({
    goalId: goal._id, title: 'Build MVP', targetDate: new Date('2027-03-31'), completed: false,
  });
  const completedTask = await Task.create({
    milestoneId: ms._id, title: 'Design UI', dueDate: new Date('2027-02-28'),
    status: 'Completed', completedAt: new Date(),
  });
  const pendingTask = await Task.create({
    milestoneId: ms._id, title: 'Write tests', dueDate: new Date('2027-03-15'), status: 'Pending',
  });
  const kpi = await KPI.create({
    userId, name: 'Monthly Revenue', targetValue: 50000, currentValue: 20000, unit: '₹',
  });
  return { goal, ms, completedTask, pendingTask, kpi };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ExecutionAnalyticsService.getAnalytics', () => {
  it('returns all required top-level keys', async () => {
    const userId = uid();
    await scaffoldData(userId);

    const result = await ExecutionAnalyticsService.getAnalytics(userId);

    expect(result).toHaveProperty('goalCompletionRate');
    expect(result).toHaveProperty('taskCompletionRate');
    expect(result).toHaveProperty('milestoneCompletionRate');
    expect(result).toHaveProperty('monthlyProgress');
    expect(result).toHaveProperty('weeklyProgress');
    expect(result).toHaveProperty('topKPIs');
    expect(result).toHaveProperty('recentActivity');
    expect(result).toHaveProperty('upcomingTasks');
    expect(result).toHaveProperty('businessHealthScore');
    expect(result).toHaveProperty('businessReadinessScore');
  });

  it('returns zeros safely when user has no data', async () => {
    const userId = uid();
    const result = await ExecutionAnalyticsService.getAnalytics(userId);

    expect(result.goalCompletionRate).toBe(0);
    expect(result.taskCompletionRate).toBe(0);
    expect(result.milestoneCompletionRate).toBe(0);
    expect(result.businessHealthScore).toBe(0);
    expect(result.topKPIs).toHaveLength(0);
    expect(result.recentActivity).toHaveLength(0);
  });

  it('calculates task completion rate correctly', async () => {
    const userId = uid();
    const goal = await BusinessGoal.create({ userId, title: 'G', targetDate: new Date('2027-12-31') });
    const ms   = await Milestone.create({ goalId: goal._id, title: 'M', targetDate: new Date('2027-12-31') });
    await Task.create({ milestoneId: ms._id, title: 'T1', dueDate: new Date('2027-12-31'), status: 'Completed', completedAt: new Date() });
    await Task.create({ milestoneId: ms._id, title: 'T2', dueDate: new Date('2027-12-31'), status: 'Completed', completedAt: new Date() });
    await Task.create({ milestoneId: ms._id, title: 'T3', dueDate: new Date('2027-12-31'), status: 'Pending' });
    await Task.create({ milestoneId: ms._id, title: 'T4', dueDate: new Date('2027-12-31'), status: 'Pending' });

    const result = await ExecutionAnalyticsService.getAnalytics(userId);
    expect(result.taskCompletionRate).toBe(50);
    expect(result.totalTasks).toBe(4);
    expect(result.completedTasks).toBe(2);
  });

  it('includes recently completed tasks in recentActivity', async () => {
    const userId = uid();
    await scaffoldData(userId);

    const result = await ExecutionAnalyticsService.getAnalytics(userId);
    expect(result.recentActivity.length).toBeGreaterThanOrEqual(1);
    expect(result.recentActivity[0]).toHaveProperty('type', 'task_completed');
  });

  it('returns 6 months of monthly progress data', async () => {
    const userId = uid();
    const result = await ExecutionAnalyticsService.getAnalytics(userId);
    expect(result.monthlyProgress).toHaveLength(6);
    result.monthlyProgress.forEach((m) => {
      expect(m).toHaveProperty('month');
      expect(m).toHaveProperty('count');
    });
  });

  it('returns 4 weeks of weekly progress data', async () => {
    const userId = uid();
    const result = await ExecutionAnalyticsService.getAnalytics(userId);
    expect(result.weeklyProgress).toHaveLength(4);
    result.weeklyProgress.forEach((w) => {
      expect(w).toHaveProperty('week');
      expect(w).toHaveProperty('count');
    });
  });

  it('topKPIs sorted by percentage descending', async () => {
    const userId = uid();
    await KPI.create({ userId, name: 'KPI A', targetValue: 100, currentValue: 30 });
    await KPI.create({ userId, name: 'KPI B', targetValue: 100, currentValue: 80 });
    await KPI.create({ userId, name: 'KPI C', targetValue: 100, currentValue: 50 });

    const result = await ExecutionAnalyticsService.getAnalytics(userId);
    const pcts   = result.topKPIs.map((k) => k.percentage);
    for (let i = 0; i < pcts.length - 1; i++) {
      expect(pcts[i]).toBeGreaterThanOrEqual(pcts[i + 1]);
    }
  });

  it('businessHealthScore is between 0 and 100', async () => {
    const userId = uid();
    await scaffoldData(userId);

    const result = await ExecutionAnalyticsService.getAnalytics(userId);
    expect(result.businessHealthScore).toBeGreaterThanOrEqual(0);
    expect(result.businessHealthScore).toBeLessThanOrEqual(100);
  });

  it('businessReadinessScore increases with more data', async () => {
    const userId1 = uid();
    const userId2 = uid();

    // User 1 — no data
    const r1 = await ExecutionAnalyticsService.getAnalytics(userId1);

    // User 2 — scaffolded data
    await scaffoldData(userId2);
    const r2 = await ExecutionAnalyticsService.getAnalytics(userId2);

    expect(r2.businessReadinessScore).toBeGreaterThan(r1.businessReadinessScore);
  });

  it('goal completion rate is 100 when all goals completed', async () => {
    const userId = uid();
    await BusinessGoal.create({ userId, title: 'G1', targetDate: new Date('2027-12-31'), status: 'Completed' });
    await BusinessGoal.create({ userId, title: 'G2', targetDate: new Date('2027-12-31'), status: 'Completed' });

    const result = await ExecutionAnalyticsService.getAnalytics(userId);
    expect(result.goalCompletionRate).toBe(100);
  });
});
