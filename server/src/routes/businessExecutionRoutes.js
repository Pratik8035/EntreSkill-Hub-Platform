'use strict';

// businessExecutionRoutes.js — Sprint 8 Phase 1 + 2 + 3

const express  = require('express');
const router   = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const {
  createGoalSchema,
  updateGoalSchema,
  createMilestoneSchema,
  updateMilestoneSchema,
  createTaskSchema,
  updateTaskSchema,
  createKPISchema,
  updateKPISchema,
} = require('../validations/businessExecution.validation');
const ctrl = require('../controllers/businessExecutionController');

// ─── Phase 2 & 3 — Dashboard + Analytics ──────────────────────────────────────
// Declared before /:id routes to avoid shadowing
router.get('/dashboard',  protect, ctrl.getDashboardSummary);
router.get('/analytics',  protect, ctrl.getAnalytics);

// ─── Goals ────────────────────────────────────────────────────────────────────
router.get   ('/goals',        protect,                              ctrl.listGoals);
router.post  ('/goals',        protect, validateRequest(createGoalSchema), ctrl.createGoal);
router.get   ('/goals/:id',    protect,                              ctrl.getGoalById);
router.put   ('/goals/:id',    protect, validateRequest(updateGoalSchema), ctrl.updateGoal);
router.delete('/goals/:id',    protect,                              ctrl.deleteGoal);
router.get   ('/goals/:id/progress', protect,                       ctrl.getGoalProgress);

// ─── Milestones ───────────────────────────────────────────────────────────────
router.get ('/milestones',             protect,                                    ctrl.listMilestones);
router.post('/milestones',             protect, validateRequest(createMilestoneSchema), ctrl.createMilestone);
router.put ('/milestones/:id',         protect, validateRequest(updateMilestoneSchema), ctrl.updateMilestone);
router.put ('/milestones/:id/complete',protect,                                    ctrl.completeMilestone);

// ─── Tasks ────────────────────────────────────────────────────────────────────
router.get ('/tasks',             protect,                                 ctrl.listTasks);
router.post('/tasks',             protect, validateRequest(createTaskSchema), ctrl.createTask);
router.put ('/tasks/:id',         protect, validateRequest(updateTaskSchema), ctrl.updateTask);
router.put ('/tasks/:id/complete',protect,                                 ctrl.completeTask);

// ─── KPIs ─────────────────────────────────────────────────────────────────────
router.get ('/kpis',      protect,                                 ctrl.listKPIs);
router.post('/kpis',      protect, validateRequest(createKPISchema), ctrl.createKPI);
router.put ('/kpis/:id',  protect, validateRequest(updateKPISchema), ctrl.updateKPI);

module.exports = router;
