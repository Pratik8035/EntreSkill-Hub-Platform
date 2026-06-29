'use strict';

// financialController.js — Sprint 12

const asyncHandler = require('express-async-handler');
const FinancialService = require('../services/financialService');
const BudgetService = require('../services/budgetService');
const InvoiceService = require('../services/invoiceService');
const FinancialAnalyticsService = require('../services/financialAnalyticsService');
const AIFinancialAdvisorService = require('../services/aiFinancialAdvisorService');
const FinancialReportService = require('../services/financialReportService');
const FinancialNotificationService = require('../services/financialNotificationService');
const { sendSuccess } = require('../utils/responseHandler');

// ── Income ─────────────────────────────────────────────────────────────────

const listIncome = asyncHandler(async (req, res) => {
  const data = await FinancialService.listIncome(req.user._id, req.query);
  sendSuccess(res, data, 'Income records retrieved successfully');
});

const getIncomeById = asyncHandler(async (req, res) => {
  const data = await FinancialService.getIncomeById(req.params.id, req.user._id);
  sendSuccess(res, data, 'Income record retrieved successfully');
});

const createIncome = asyncHandler(async (req, res) => {
  const data = await FinancialService.createIncome(req.body, req.user._id);
  sendSuccess(res, data, 'Income record created successfully', 201);
});

const updateIncome = asyncHandler(async (req, res) => {
  const data = await FinancialService.updateIncome(req.params.id, req.body, req.user._id);
  sendSuccess(res, data, 'Income record updated successfully');
});

const deleteIncome = asyncHandler(async (req, res) => {
  await FinancialService.deleteIncome(req.params.id, req.user._id);
  sendSuccess(res, null, 'Income record deleted successfully');
});

// ── Expense ────────────────────────────────────────────────────────────────

const listExpenses = asyncHandler(async (req, res) => {
  const data = await FinancialService.listExpenses(req.user._id, req.query);
  sendSuccess(res, data, 'Expense records retrieved successfully');
});

const getExpenseById = asyncHandler(async (req, res) => {
  const data = await FinancialService.getExpenseById(req.params.id, req.user._id);
  sendSuccess(res, data, 'Expense record retrieved successfully');
});

const createExpense = asyncHandler(async (req, res) => {
  const data = await FinancialService.createExpense(req.body, req.user._id);
  sendSuccess(res, data, 'Expense record created successfully', 201);
});

const updateExpense = asyncHandler(async (req, res) => {
  const data = await FinancialService.updateExpense(req.params.id, req.body, req.user._id);
  sendSuccess(res, data, 'Expense record updated successfully');
});

const deleteExpense = asyncHandler(async (req, res) => {
  await FinancialService.deleteExpense(req.params.id, req.user._id);
  sendSuccess(res, null, 'Expense record deleted successfully');
});

// ── Budget ─────────────────────────────────────────────────────────────────

const listBudgets = asyncHandler(async (req, res) => {
  const data = await BudgetService.listBudgets(req.user._id, req.query);
  sendSuccess(res, data, 'Budgets retrieved successfully');
});

const getBudgetById = asyncHandler(async (req, res) => {
  const data = await BudgetService.getBudgetById(req.params.id, req.user._id);
  sendSuccess(res, data, 'Budget retrieved successfully');
});

const createBudget = asyncHandler(async (req, res) => {
  const data = await BudgetService.createBudget(req.body, req.user._id);
  sendSuccess(res, data, 'Budget created successfully', 201);
});

const updateBudget = asyncHandler(async (req, res) => {
  const data = await BudgetService.updateBudget(req.params.id, req.body, req.user._id);
  sendSuccess(res, data, 'Budget updated successfully');
});

const deleteBudget = asyncHandler(async (req, res) => {
  await BudgetService.deleteBudget(req.params.id, req.user._id);
  sendSuccess(res, null, 'Budget deleted successfully');
});

const getBudgetUtilization = asyncHandler(async (req, res) => {
  const data = await BudgetService.getBudgetUtilizationSummary(req.user._id);
  sendSuccess(res, data, 'Budget utilization retrieved');
});

// ── Invoice ────────────────────────────────────────────────────────────────

const listInvoices = asyncHandler(async (req, res) => {
  const data = await InvoiceService.listInvoices(req.user._id, req.query);
  sendSuccess(res, data, 'Invoices retrieved successfully');
});

const getInvoiceById = asyncHandler(async (req, res) => {
  const data = await InvoiceService.getInvoiceById(req.params.id, req.user._id);
  sendSuccess(res, data, 'Invoice retrieved successfully');
});

const createInvoice = asyncHandler(async (req, res) => {
  const data = await InvoiceService.createInvoice(req.body, req.user._id);
  sendSuccess(res, data, 'Invoice created successfully', 201);
});

const updateInvoice = asyncHandler(async (req, res) => {
  const data = await InvoiceService.updateInvoice(req.params.id, req.body, req.user._id);
  sendSuccess(res, data, 'Invoice updated successfully');
});

const deleteInvoice = asyncHandler(async (req, res) => {
  await InvoiceService.deleteInvoice(req.params.id, req.user._id);
  sendSuccess(res, null, 'Invoice deleted successfully');
});

const markInvoicePaid = asyncHandler(async (req, res) => {
  const data = await InvoiceService.markAsPaid(req.params.id, req.user._id);
  sendSuccess(res, data, 'Invoice marked as paid');
});

const markInvoiceSent = asyncHandler(async (req, res) => {
  const data = await InvoiceService.markAsSent(req.params.id, req.user._id);
  sendSuccess(res, data, 'Invoice marked as sent');
});

const getInvoiceSummary = asyncHandler(async (req, res) => {
  const data = await InvoiceService.getInvoiceSummary(req.user._id);
  sendSuccess(res, data, 'Invoice summary retrieved');
});

// ── Transactions ───────────────────────────────────────────────────────────

const listTransactions = asyncHandler(async (req, res) => {
  const data = await FinancialService.listTransactions(req.user._id, req.query);
  sendSuccess(res, data, 'Transactions retrieved successfully');
});

// ── Financial Goals ────────────────────────────────────────────────────────

const listFinancialGoals = asyncHandler(async (req, res) => {
  const data = await FinancialService.listGoals(req.user._id);
  sendSuccess(res, data, 'Financial goals retrieved successfully');
});

const getFinancialGoalById = asyncHandler(async (req, res) => {
  const data = await FinancialService.getGoalById(req.params.id, req.user._id);
  sendSuccess(res, data, 'Financial goal retrieved successfully');
});

const createFinancialGoal = asyncHandler(async (req, res) => {
  const data = await FinancialService.createGoal(req.body, req.user._id);
  sendSuccess(res, data, 'Financial goal created successfully', 201);
});

const updateFinancialGoal = asyncHandler(async (req, res) => {
  const data = await FinancialService.updateGoal(req.params.id, req.body, req.user._id);
  sendSuccess(res, data, 'Financial goal updated successfully');
});

const deleteFinancialGoal = asyncHandler(async (req, res) => {
  await FinancialService.deleteGoal(req.params.id, req.user._id);
  sendSuccess(res, null, 'Financial goal deleted successfully');
});

// ── Summary ────────────────────────────────────────────────────────────────

const getMonthlySummary = asyncHandler(async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  const month = req.query.month || (new Date().getMonth() + 1);
  const data = await FinancialService.getMonthlySummary(req.user._id, year, month);
  sendSuccess(res, data, 'Monthly summary retrieved');
});

const getYearlySummary = asyncHandler(async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  const data = await FinancialService.getYearlySummary(req.user._id, year);
  sendSuccess(res, data, 'Yearly summary retrieved');
});

// ── Analytics ──────────────────────────────────────────────────────────────

const getDashboard = asyncHandler(async (req, res) => {
  const data = await FinancialAnalyticsService.getAnalytics(req.user._id);
  sendSuccess(res, data, 'Financial dashboard retrieved');
});

// ── AI Financial Advisor ───────────────────────────────────────────────────

const getAIAdvice = asyncHandler(async (req, res) => {
  const data = await AIFinancialAdvisorService.getAdvice(req.user._id);
  sendSuccess(res, data, 'Financial advice generated');
});

// ── Reports ────────────────────────────────────────────────────────────────

const listFinancialReportTypes = asyncHandler(async (req, res) => {
  const data = FinancialReportService.listReportTypes();
  sendSuccess(res, data, 'Financial report types retrieved');
});

const getFinancialReport = asyncHandler(async (req, res) => {
  const data = await FinancialReportService.getReport(req.params.type, req.user._id);
  sendSuccess(res, data, 'Financial report generated');
});

// ── Notifications ──────────────────────────────────────────────────────────

const generateFinancialNotifications = asyncHandler(async (req, res) => {
  const data = await FinancialNotificationService.generateNotifications(req.user._id);
  sendSuccess(res, data, 'Financial notifications generated');
});

module.exports = {
  // Income
  listIncome, getIncomeById, createIncome, updateIncome, deleteIncome,
  // Expenses
  listExpenses, getExpenseById, createExpense, updateExpense, deleteExpense,
  // Budgets
  listBudgets, getBudgetById, createBudget, updateBudget, deleteBudget, getBudgetUtilization,
  // Invoices
  listInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice,
  markInvoicePaid, markInvoiceSent, getInvoiceSummary,
  // Transactions
  listTransactions,
  // Goals
  listFinancialGoals, getFinancialGoalById, createFinancialGoal, updateFinancialGoal, deleteFinancialGoal,
  // Summary
  getMonthlySummary, getYearlySummary,
  // Analytics/Dashboard
  getDashboard,
  // AI
  getAIAdvice,
  // Reports
  listFinancialReportTypes, getFinancialReport,
  // Notifications
  generateFinancialNotifications,
};
