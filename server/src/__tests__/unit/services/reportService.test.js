'use strict';

/**
 * Unit Tests — reportService (Sprint 9 Phase 3)
 */

require('../../setup');
const mongoose = require('mongoose');

process.env.NODE_ENV   = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';

const ReportService = require('../../../services/reportService');
const BusinessGoal  = require('../../../models/BusinessGoal');
const Milestone     = require('../../../models/Milestone');
const Task          = require('../../../models/Task');
const KPI           = require('../../../models/KPI');

describe('ReportService', () => {
  const userId = new mongoose.Types.ObjectId();

  // ── listReports ───────────────────────────────────────────────────────────

  describe('listReports', () => {
    it('returns an array of report types', () => {
      const result = ReportService.listReports();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('each entry has type, label, description', () => {
      const result = ReportService.listReports();
      for (const r of result) {
        expect(r).toHaveProperty('type');
        expect(r).toHaveProperty('label');
        expect(r).toHaveProperty('description');
      }
    });

    it('includes all 7 expected report types', () => {
      const types = ReportService.listReports().map((r) => r.type);
      expect(types).toContain('business_summary');
      expect(types).toContain('goal_report');
      expect(types).toContain('kpi_report');
      expect(types).toContain('execution_report');
      expect(types).toContain('analytics_report');
      expect(types).toContain('monthly_report');
      expect(types).toContain('weekly_report');
    });
  });

  // ── getReport — business_summary ─────────────────────────────────────────

  describe('getReport — business_summary', () => {
    it('returns business_summary with required fields', async () => {
      const result = await ReportService.getReport('business_summary', userId);

      expect(result.type).toBe('business_summary');
      expect(result).toHaveProperty('businessHealthScore');
      expect(result).toHaveProperty('businessReadinessScore');
      expect(result).toHaveProperty('goalCompletionRate');
      expect(result).toHaveProperty('taskCompletionRate');
      expect(result).toHaveProperty('generatedAt');
    });

    it('returns zero scores when user has no data', async () => {
      const result = await ReportService.getReport('business_summary', userId);
      expect(result.businessHealthScore).toBe(0);
      expect(result.goalCompletionRate).toBe(0);
    });
  });

  // ── getReport — goal_report ────────────────────────────────────────────────

  describe('getReport — goal_report', () => {
    it('returns goal_report with totalGoals=0 for new user', async () => {
      const result = await ReportService.getReport('goal_report', userId);

      expect(result.type).toBe('goal_report');
      expect(result.totalGoals).toBe(0);
      expect(Array.isArray(result.goals)).toBe(true);
      expect(result).toHaveProperty('byStatus');
    });

    it('includes progress in each goal when goals exist', async () => {
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

      const result = await ReportService.getReport('goal_report', userId);
      expect(result.totalGoals).toBe(1);
      expect(result.goals[0]).toHaveProperty('progress');
    });
  });

  // ── getReport — kpi_report ────────────────────────────────────────────────

  describe('getReport — kpi_report', () => {
    it('returns kpi_report with correct structure', async () => {
      await KPI.create({
        userId, name: 'Revenue', targetValue: 100, currentValue: 60, unit: '₹',
      });
      await KPI.create({
        userId, name: 'Users', targetValue: 200, currentValue: 40, unit: 'users',
      });

      const result = await ReportService.getReport('kpi_report', userId);

      expect(result.type).toBe('kpi_report');
      expect(result.totalKPIs).toBe(2);
      expect(result.onTrack).toBe(1);      // 60% >= 50% threshold
      expect(result.belowTarget).toBe(1);   // 20% < 50% threshold
    });
  });

  // ── getReport — execution_report ──────────────────────────────────────────

  describe('getReport — execution_report', () => {
    it('returns execution_report with task and milestone counts', async () => {
      const goal = await BusinessGoal.create({
        userId, title: 'G1', targetDate: new Date('2027-12-31'),
      });
      const ms = await Milestone.create({
        goalId: goal._id, title: 'M1', targetDate: new Date('2027-12-31'), completed: true,
      });
      await Task.create({
        milestoneId: ms._id, title: 'T1', dueDate: new Date('2027-12-31'),
        status: 'Completed', completedAt: new Date(),
      });
      await Task.create({
        milestoneId: ms._id, title: 'T2', dueDate: new Date('2020-01-01'),
        status: 'Pending',
      });

      const result = await ReportService.getReport('execution_report', userId);

      expect(result.type).toBe('execution_report');
      expect(result.milestones.total).toBe(1);
      expect(result.milestones.completed).toBe(1);
      expect(result.tasks.total).toBe(2);
      expect(result.tasks.completed).toBe(1);
      expect(result.tasks.overdue).toBe(1);
    });
  });

  // ── getReport — weekly_report ─────────────────────────────────────────────

  describe('getReport — weekly_report', () => {
    it('returns weekly_report with period=weekly', async () => {
      const result = await ReportService.getReport('weekly_report', userId);

      expect(result.type).toBe('weekly_report');
      expect(result.period).toBe('weekly');
      expect(result).toHaveProperty('from');
      expect(result).toHaveProperty('to');
      expect(typeof result.tasksCompleted).toBe('number');
      expect(typeof result.milestonesCompleted).toBe('number');
    });
  });

  // ── getReport — monthly_report ────────────────────────────────────────────

  describe('getReport — monthly_report', () => {
    it('returns monthly_report with period=monthly', async () => {
      const result = await ReportService.getReport('monthly_report', userId);

      expect(result.type).toBe('monthly_report');
      expect(result.period).toBe('monthly');
      expect(typeof result.tasksCompleted).toBe('number');
    });
  });

  // ── getReport — unknown type ──────────────────────────────────────────────

  describe('getReport — unknown type', () => {
    it('throws AppError with status 400 for unknown type', async () => {
      await expect(
        ReportService.getReport('bogus_type', userId)
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });
});
