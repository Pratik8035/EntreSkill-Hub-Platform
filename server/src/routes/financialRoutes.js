'use strict';

// financialRoutes.js — Sprint 12

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const {
  createIncomeSchema, updateIncomeSchema,
  createExpenseSchema, updateExpenseSchema,
  createBudgetSchema, updateBudgetSchema,
  createInvoiceSchema, updateInvoiceSchema,
  createFinancialGoalSchema, updateFinancialGoalSchema,
} = require('../validations/financial.validation');
const ctrl = require('../controllers/financialController');

// ── Dashboard / Analytics ──────────────────────────────────────────────────
router.get('/dashboard',        protect, ctrl.getDashboard);
router.get('/summary/monthly',  protect, ctrl.getMonthlySummary);
router.get('/summary/yearly',   protect, ctrl.getYearlySummary);

// ── AI Financial Advisor ───────────────────────────────────────────────────
router.get('/advisor',          protect, ctrl.getAIAdvice);

// ── Financial Reports ──────────────────────────────────────────────────────
router.get('/reports',          protect, ctrl.listFinancialReportTypes);
router.get('/reports/:type',    protect, ctrl.getFinancialReport);

// ── Notifications ──────────────────────────────────────────────────────────
router.post('/notifications/generate', protect, ctrl.generateFinancialNotifications);

// ── Income ─────────────────────────────────────────────────────────────────
router.get   ('/income',     protect,                                    ctrl.listIncome);
router.post  ('/income',     protect, validateRequest(createIncomeSchema), ctrl.createIncome);
router.get   ('/income/:id', protect,                                    ctrl.getIncomeById);
router.put   ('/income/:id', protect, validateRequest(updateIncomeSchema), ctrl.updateIncome);
router.delete('/income/:id', protect,                                    ctrl.deleteIncome);

// ── Expenses ───────────────────────────────────────────────────────────────
router.get   ('/expenses',     protect,                                      ctrl.listExpenses);
router.post  ('/expenses',     protect, validateRequest(createExpenseSchema), ctrl.createExpense);
router.get   ('/expenses/:id', protect,                                      ctrl.getExpenseById);
router.put   ('/expenses/:id', protect, validateRequest(updateExpenseSchema), ctrl.updateExpense);
router.delete('/expenses/:id', protect,                                      ctrl.deleteExpense);

// ── Budgets ────────────────────────────────────────────────────────────────
router.get   ('/budgets',              protect,                                    ctrl.listBudgets);
router.post  ('/budgets',              protect, validateRequest(createBudgetSchema), ctrl.createBudget);
router.get   ('/budgets/utilization',  protect,                                    ctrl.getBudgetUtilization);
router.get   ('/budgets/:id',          protect,                                    ctrl.getBudgetById);
router.put   ('/budgets/:id',          protect, validateRequest(updateBudgetSchema), ctrl.updateBudget);
router.delete('/budgets/:id',          protect,                                    ctrl.deleteBudget);

// ── Invoices ───────────────────────────────────────────────────────────────
router.get   ('/invoices',             protect,                                     ctrl.listInvoices);
router.post  ('/invoices',             protect, validateRequest(createInvoiceSchema), ctrl.createInvoice);
router.get   ('/invoices/summary',     protect,                                     ctrl.getInvoiceSummary);
router.get   ('/invoices/:id',         protect,                                     ctrl.getInvoiceById);
router.put   ('/invoices/:id',         protect, validateRequest(updateInvoiceSchema), ctrl.updateInvoice);
router.delete('/invoices/:id',         protect,                                     ctrl.deleteInvoice);
router.patch ('/invoices/:id/paid',    protect,                                     ctrl.markInvoicePaid);
router.patch ('/invoices/:id/sent',    protect,                                     ctrl.markInvoiceSent);

// ── Transactions ───────────────────────────────────────────────────────────
router.get('/transactions', protect, ctrl.listTransactions);

// ── Financial Goals ────────────────────────────────────────────────────────
router.get   ('/goals',     protect,                                            ctrl.listFinancialGoals);
router.post  ('/goals',     protect, validateRequest(createFinancialGoalSchema), ctrl.createFinancialGoal);
router.get   ('/goals/:id', protect,                                            ctrl.getFinancialGoalById);
router.put   ('/goals/:id', protect, validateRequest(updateFinancialGoalSchema), ctrl.updateFinancialGoal);
router.delete('/goals/:id', protect,                                            ctrl.deleteFinancialGoal);

module.exports = router;
