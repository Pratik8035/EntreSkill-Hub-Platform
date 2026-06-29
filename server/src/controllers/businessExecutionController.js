'use strict';

// businessExecutionController.js — Sprint 8 Phase 1 + 2 + 3

const asyncHandler = require('express-async-handler');
const GoalService       = require('../services/goalService');
const MilestoneService  = require('../services/milestoneService');
const TaskService       = require('../services/taskService');
const KPIService        = require('../services/kpiService');
const ProgressEngine    = require('../services/progressEngine');
const ExecutionAnalyticsService = require('../services/executionAnalyticsService');
const { sendSuccess }   = require('../utils/responseHandler');

// ─── Goals ────────────────────────────────────────────────────────────────────

const listGoals = asyncHandler(async (req, res) => {
  const goals = await GoalService.listGoals(req.user._id);
  sendSuccess(res, goals, 'Goals retrieved successfully');
});

const getGoalById = asyncHandler(async (req, res) => {
  const goal = await GoalService.getGoalById(req.params.id, req.user._id);
  sendSuccess(res, goal, 'Goal retrieved successfully');
});

const createGoal = asyncHandler(async (req, res) => {
  const goal = await GoalService.createGoal(req.body, req.user._id);
  sendSuccess(res, goal, 'Goal created successfully', 201);
});

const updateGoal = asyncHandler(async (req, res) => {
  const goal = await GoalService.updateGoal(req.params.id, req.body, req.user._id);
  sendSuccess(res, goal, 'Goal updated successfully');
});

const deleteGoal = asyncHandler(async (req, res) => {
  await GoalService.deleteGoal(req.params.id, req.user._id);
  sendSuccess(res, null, 'Goal deleted successfully');
});

// ─── Milestones ───────────────────────────────────────────────────────────────

const listMilestones = asyncHandler(async (req, res) => {
  const milestones = await MilestoneService.listMilestones(req.query.goalId, req.user._id);
  sendSuccess(res, milestones, 'Milestones retrieved successfully');
});

const createMilestone = asyncHandler(async (req, res) => {
  const milestone = await MilestoneService.createMilestone(req.body, req.user._id);
  sendSuccess(res, milestone, 'Milestone created successfully', 201);
});

const updateMilestone = asyncHandler(async (req, res) => {
  const milestone = await MilestoneService.updateMilestone(req.params.id, req.body, req.user._id);
  sendSuccess(res, milestone, 'Milestone updated successfully');
});

const completeMilestone = asyncHandler(async (req, res) => {
  const milestone = await MilestoneService.completeMilestone(req.params.id, req.user._id);
  sendSuccess(res, milestone, 'Milestone marked as complete');
});

// ─── Tasks ────────────────────────────────────────────────────────────────────

const listTasks = asyncHandler(async (req, res) => {
  const tasks = await TaskService.listTasks(req.query.milestoneId, req.user._id);
  sendSuccess(res, tasks, 'Tasks retrieved successfully');
});

const createTask = asyncHandler(async (req, res) => {
  const task = await TaskService.createTask(req.body, req.user._id);
  sendSuccess(res, task, 'Task created successfully', 201);
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await TaskService.updateTask(req.params.id, req.body, req.user._id);
  sendSuccess(res, task, 'Task updated successfully');
});

const completeTask = asyncHandler(async (req, res) => {
  const task = await TaskService.completeTask(req.params.id, req.user._id);
  sendSuccess(res, task, 'Task marked as complete');
});

// ─── KPIs ─────────────────────────────────────────────────────────────────────

const listKPIs = asyncHandler(async (req, res) => {
  const kpis = await KPIService.listKPIs(req.user._id);
  sendSuccess(res, kpis, 'KPIs retrieved successfully');
});

const createKPI = asyncHandler(async (req, res) => {
  const kpi = await KPIService.createKPI(req.body, req.user._id);
  sendSuccess(res, kpi, 'KPI created successfully', 201);
});

const updateKPI = asyncHandler(async (req, res) => {
  const kpi = await KPIService.updateKPI(req.params.id, req.body, req.user._id);
  sendSuccess(res, kpi, 'KPI updated successfully');
});

// ─── Phase 2 — Progress Engine ────────────────────────────────────────────────

const getGoalProgress = asyncHandler(async (req, res) => {
  // Verify ownership first
  await GoalService.getGoalById(req.params.id, req.user._id);
  const progress = await ProgressEngine.calculateGoalProgress(req.params.id);
  sendSuccess(res, progress, 'Goal progress calculated');
});

const getDashboardSummary = asyncHandler(async (req, res) => {
  const summary = await ProgressEngine.getDashboardSummary(req.user._id);
  sendSuccess(res, summary, 'Dashboard summary retrieved');
});

// ─── Phase 3 — Analytics Engine ───────────────────────────────────────────────

const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await ExecutionAnalyticsService.getAnalytics(req.user._id);
  sendSuccess(res, analytics, 'Execution analytics retrieved');
});

module.exports = {
  // Goals
  listGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  getGoalProgress,
  // Milestones
  listMilestones,
  createMilestone,
  updateMilestone,
  completeMilestone,
  // Tasks
  listTasks,
  createTask,
  updateTask,
  completeTask,
  // KPIs
  listKPIs,
  createKPI,
  updateKPI,
  // Progress + Analytics
  getDashboardSummary,
  getAnalytics,
};
