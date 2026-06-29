// src/services/businessExecutionService.js
// Sprint 8 — Business Execution frontend service

import api from './api.js';

const businessExecutionService = {
  // ── Goals ─────────────────────────────────────────────────────────────────
  getGoals: () => api.get('/business-execution/goals').then((r) => r.data),
  getGoalById: (id) => api.get(`/business-execution/goals/${id}`).then((r) => r.data),
  createGoal: (data) => api.post('/business-execution/goals', data).then((r) => r.data),
  updateGoal: (id, data) => api.put(`/business-execution/goals/${id}`, data).then((r) => r.data),
  deleteGoal: (id) => api.delete(`/business-execution/goals/${id}`).then((r) => r.data),
  getGoalProgress: (id) => api.get(`/business-execution/goals/${id}/progress`).then((r) => r.data),

  // ── Milestones ─────────────────────────────────────────────────────────────
  getMilestones: (goalId) =>
    api.get('/business-execution/milestones', { params: { goalId } }).then((r) => r.data),
  createMilestone: (data) =>
    api.post('/business-execution/milestones', data).then((r) => r.data),
  updateMilestone: (id, data) =>
    api.put(`/business-execution/milestones/${id}`, data).then((r) => r.data),
  completeMilestone: (id) =>
    api.put(`/business-execution/milestones/${id}/complete`).then((r) => r.data),

  // ── Tasks ──────────────────────────────────────────────────────────────────
  getTasks: (milestoneId) =>
    api.get('/business-execution/tasks', { params: { milestoneId } }).then((r) => r.data),
  createTask: (data) => api.post('/business-execution/tasks', data).then((r) => r.data),
  updateTask: (id, data) => api.put(`/business-execution/tasks/${id}`, data).then((r) => r.data),
  completeTask: (id) =>
    api.put(`/business-execution/tasks/${id}/complete`).then((r) => r.data),

  // ── KPIs ───────────────────────────────────────────────────────────────────
  getKPIs: () => api.get('/business-execution/kpis').then((r) => r.data),
  createKPI: (data) => api.post('/business-execution/kpis', data).then((r) => r.data),
  updateKPI: (id, data) => api.put(`/business-execution/kpis/${id}`, data).then((r) => r.data),

  // ── Progress & Analytics ───────────────────────────────────────────────────
  getDashboardSummary: () =>
    api.get('/business-execution/dashboard').then((r) => r.data),
  getAnalytics: () =>
    api.get('/business-execution/analytics').then((r) => r.data),
};

export default businessExecutionService;
