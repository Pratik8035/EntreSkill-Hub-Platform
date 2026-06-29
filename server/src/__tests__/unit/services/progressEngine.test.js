'use strict';

/**
 * Unit Tests — ProgressEngine (Sprint 8 Phase 2)
 */

require('../../setup');
const mongoose     = require('mongoose');
const BusinessGoal = require('../../../models/BusinessGoal');
const Milestone    = require('../../../models/Milestone');
const Task         = require('../../../models/Task');
const KPI          = require('../../../models/KPI');
const ProgressEngine = require('../../../services/progressEngine');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => new mongoose.Types.ObjectId();

async function makeGoal(userId, overrides = {}) {
  return BusinessGoal.create({ userId, title: 'Test Goal', targetDate: new Date('2027-12-31'), ...overrides });
}

async function makeMilestone(goalId, overrides = {}) {
  return Milestone.create({ goalId, title: 'Test MS', targetDate: new Date('2027-12-31'), ...overrides });
}

async function makeTask(milestoneId, status = 'Pending') {
  return Task.create({ milestoneId, title: 'Task', dueDate: new Date('2027-12-31'), status, completedAt: status === 'Completed' ? new Date() : null });
}

// ─── calculateGoalProgress ─────────────────────────────────────────────────────

describe('ProgressEngine.calculateGoalProgress', () => {
  it('returns 0 progress when no milestones/tasks', async () => {
    const goal = await makeGoal(uid());
    const result = await ProgressEngine.calculateGoalProgress(goal._id);
    expect(result.progress).toBe(0);
    expect(result.status).toBe('Not Started');
    expect(result.totalTasks).toBe(0);
    expect(result.completedTasks).toBe(0);
  });

  it('returns 50% when half tasks completed', async () => {
    const goal = await makeGoal(uid());
    const ms   = await makeMilestone(goal._id);
    await makeTask(ms._id, 'Completed');
    await makeTask(ms._id, 'Pending');

    const result = await ProgressEngine.calculateGoalProgress(goal._id);
    expect(result.progress).toBe(50);
    expect(result.totalTasks).toBe(2);
    expect(result.completedTasks).toBe(1);
  });

  it('returns 100% and Completed status when all tasks done', async () => {
    const goal = await makeGoal(uid());
    const ms   = await makeMilestone(goal._id);
    await makeTask(ms._id, 'Completed');
    await makeTask(ms._id, 'Completed');

    const result = await ProgressEngine.calculateGoalProgress(goal._id);
    expect(result.progress).toBe(100);
    expect(result.status).toBe('Completed');
  });

  it('returns In Progress when some tasks done', async () => {
    const goal = await makeGoal(uid());
    const ms   = await makeMilestone(goal._id);
    await makeTask(ms._id, 'Completed');
    await makeTask(ms._id, 'Pending');
    await makeTask(ms._id, 'Pending');

    const result = await ProgressEngine.calculateGoalProgress(goal._id);
    expect(result.status).toBe('In Progress');
  });

  it('persists computed status back to goal document', async () => {
    const goal = await makeGoal(uid());
    const ms   = await makeMilestone(goal._id);
    await makeTask(ms._id, 'Completed');

    await ProgressEngine.calculateGoalProgress(goal._id);

    const updated = await BusinessGoal.findById(goal._id).lean();
    expect(updated.status).toBe('Completed');
  });
});

// ─── calculateMilestoneProgress ───────────────────────────────────────────────

describe('ProgressEngine.calculateMilestoneProgress', () => {
  it('returns 0 when no tasks', async () => {
    const goal = await makeGoal(uid());
    const ms   = await makeMilestone(goal._id);

    const result = await ProgressEngine.calculateMilestoneProgress(ms._id);
    expect(result.progress).toBe(0);
    expect(result.totalTasks).toBe(0);
  });

  it('returns 100 and marks milestone complete when all tasks done', async () => {
    const goal = await makeGoal(uid());
    const ms   = await makeMilestone(goal._id);
    await makeTask(ms._id, 'Completed');
    await makeTask(ms._id, 'Completed');

    const result = await ProgressEngine.calculateMilestoneProgress(ms._id);
    expect(result.progress).toBe(100);

    const updated = await Milestone.findById(ms._id).lean();
    expect(updated.completed).toBe(true);
    expect(updated.completedAt).not.toBeNull();
  });

  it('does not auto-complete when tasks are partially done', async () => {
    const goal = await makeGoal(uid());
    const ms   = await makeMilestone(goal._id);
    await makeTask(ms._id, 'Completed');
    await makeTask(ms._id, 'Pending');

    await ProgressEngine.calculateMilestoneProgress(ms._id);
    const updated = await Milestone.findById(ms._id).lean();
    expect(updated.completed).toBe(false);
  });
});

// ─── calculateKPIProgress ─────────────────────────────────────────────────────

describe('ProgressEngine.calculateKPIProgress', () => {
  it('returns 0 when currentValue is 0', () => {
    const kpi = { name: 'Revenue', currentValue: 0, targetValue: 100 };
    const result = ProgressEngine.calculateKPIProgress(kpi);
    expect(result.percentage).toBe(0);
    expect(result.onTrack).toBe(false);
  });

  it('returns 100 when target is met', () => {
    const kpi = { name: 'Revenue', currentValue: 100, targetValue: 100 };
    const result = ProgressEngine.calculateKPIProgress(kpi);
    expect(result.percentage).toBe(100);
    expect(result.onTrack).toBe(true);
  });

  it('caps at 100 when currentValue exceeds target', () => {
    const kpi = { name: 'Revenue', currentValue: 200, targetValue: 100 };
    const result = ProgressEngine.calculateKPIProgress(kpi);
    expect(result.percentage).toBe(100);
  });

  it('categorises revenue KPIs correctly', () => {
    const kpi = { name: 'Monthly Revenue', currentValue: 5000, targetValue: 10000 };
    const result = ProgressEngine.calculateKPIProgress(kpi);
    expect(result.category).toBe('Revenue Progress');
  });

  it('categorises customer KPIs correctly', () => {
    const kpi = { name: 'Number of Customers', currentValue: 20, targetValue: 50 };
    const result = ProgressEngine.calculateKPIProgress(kpi);
    expect(result.category).toBe('Customer Progress');
  });

  it('categorises marketing KPIs correctly', () => {
    const kpi = { name: 'Conversion Rate', currentValue: 5, targetValue: 10 };
    const result = ProgressEngine.calculateKPIProgress(kpi);
    expect(result.category).toBe('Marketing Progress');
  });
});

// ─── getDashboardSummary ───────────────────────────────────────────────────────

describe('ProgressEngine.getDashboardSummary', () => {
  it('returns zeros when user has no data', async () => {
    const userId = uid();
    const result = await ProgressEngine.getDashboardSummary(userId);
    expect(result.totalGoals).toBe(0);
    expect(result.completedGoals).toBe(0);
    expect(result.averageProgress).toBe(0);
    expect(result.upcomingDeadlines).toHaveLength(0);
    expect(result.overdueTasks).toHaveLength(0);
  });

  it('returns correct totals and average progress', async () => {
    const userId = uid();
    const goal1  = await makeGoal(userId);
    const goal2  = await makeGoal(userId);
    const ms1    = await makeMilestone(goal1._id);
    await makeTask(ms1._id, 'Completed');
    await makeTask(ms1._id, 'Completed');

    const result = await ProgressEngine.getDashboardSummary(userId);
    expect(result.totalGoals).toBe(2);
    expect(result.averageProgress).toBeGreaterThanOrEqual(0);
  });

  it('includes KPI summary in response', async () => {
    const userId = uid();
    await makeGoal(userId);
    await KPI.create({ userId, name: 'Revenue', targetValue: 50000, currentValue: 25000, unit: '₹' });

    const result = await ProgressEngine.getDashboardSummary(userId);
    expect(result.kpiSummary).toHaveLength(1);
    expect(result.kpiSummary[0].name).toBe('Revenue');
    expect(result.kpiSummary[0].percentage).toBe(50);
  });
});
