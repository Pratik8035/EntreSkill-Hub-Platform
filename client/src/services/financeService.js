// Sprint 12 — Financial Management Service
import api from './api';

// ── Dashboard ──────────────────────────────────────────────────────────────
export const getFinancialDashboard = async () => {
  const res = await api.get('/finance/dashboard');
  return res.data.data;
};

// ── Income ─────────────────────────────────────────────────────────────────
export const listIncome = async (params = {}) => {
  const res = await api.get('/finance/income', { params });
  return res.data.data;
};

export const getIncomeById = async (id) => {
  const res = await api.get(`/finance/income/${id}`);
  return res.data.data;
};

export const createIncome = async (data) => {
  const res = await api.post('/finance/income', data);
  return res.data.data;
};

export const updateIncome = async (id, data) => {
  const res = await api.put(`/finance/income/${id}`, data);
  return res.data.data;
};

export const deleteIncome = async (id) => {
  const res = await api.delete(`/finance/income/${id}`);
  return res.data;
};

// ── Expenses ───────────────────────────────────────────────────────────────
export const listExpenses = async (params = {}) => {
  const res = await api.get('/finance/expenses', { params });
  return res.data.data;
};

export const getExpenseById = async (id) => {
  const res = await api.get(`/finance/expenses/${id}`);
  return res.data.data;
};

export const createExpense = async (data) => {
  const res = await api.post('/finance/expenses', data);
  return res.data.data;
};

export const updateExpense = async (id, data) => {
  const res = await api.put(`/finance/expenses/${id}`, data);
  return res.data.data;
};

export const deleteExpense = async (id) => {
  const res = await api.delete(`/finance/expenses/${id}`);
  return res.data;
};

// ── Budgets ────────────────────────────────────────────────────────────────
export const listBudgets = async (params = {}) => {
  const res = await api.get('/finance/budgets', { params });
  return res.data.data;
};

export const getBudgetById = async (id) => {
  const res = await api.get(`/finance/budgets/${id}`);
  return res.data.data;
};

export const createBudget = async (data) => {
  const res = await api.post('/finance/budgets', data);
  return res.data.data;
};

export const updateBudget = async (id, data) => {
  const res = await api.put(`/finance/budgets/${id}`, data);
  return res.data.data;
};

export const deleteBudget = async (id) => {
  const res = await api.delete(`/finance/budgets/${id}`);
  return res.data;
};

export const getBudgetUtilization = async () => {
  const res = await api.get('/finance/budgets/utilization');
  return res.data.data;
};

// ── Invoices ───────────────────────────────────────────────────────────────
export const listInvoices = async (params = {}) => {
  const res = await api.get('/finance/invoices', { params });
  return res.data.data;
};

export const getInvoiceById = async (id) => {
  const res = await api.get(`/finance/invoices/${id}`);
  return res.data.data;
};

export const createInvoice = async (data) => {
  const res = await api.post('/finance/invoices', data);
  return res.data.data;
};

export const updateInvoice = async (id, data) => {
  const res = await api.put(`/finance/invoices/${id}`, data);
  return res.data.data;
};

export const deleteInvoice = async (id) => {
  const res = await api.delete(`/finance/invoices/${id}`);
  return res.data;
};

export const markInvoicePaid = async (id) => {
  const res = await api.patch(`/finance/invoices/${id}/paid`);
  return res.data.data;
};

export const markInvoiceSent = async (id) => {
  const res = await api.patch(`/finance/invoices/${id}/sent`);
  return res.data.data;
};

export const getInvoiceSummary = async () => {
  const res = await api.get('/finance/invoices/summary');
  return res.data.data;
};

// ── Transactions ───────────────────────────────────────────────────────────
export const listTransactions = async (params = {}) => {
  const res = await api.get('/finance/transactions', { params });
  return res.data.data;
};

// ── Financial Goals ────────────────────────────────────────────────────────
export const listFinancialGoals = async () => {
  const res = await api.get('/finance/goals');
  return res.data.data;
};

export const createFinancialGoal = async (data) => {
  const res = await api.post('/finance/goals', data);
  return res.data.data;
};

export const updateFinancialGoal = async (id, data) => {
  const res = await api.put(`/finance/goals/${id}`, data);
  return res.data.data;
};

export const deleteFinancialGoal = async (id) => {
  const res = await api.delete(`/finance/goals/${id}`);
  return res.data;
};

// ── Summaries ──────────────────────────────────────────────────────────────
export const getMonthlySummary = async (params = {}) => {
  const res = await api.get('/finance/summary/monthly', { params });
  return res.data.data;
};

export const getYearlySummary = async (params = {}) => {
  const res = await api.get('/finance/summary/yearly', { params });
  return res.data.data;
};

// ── AI Financial Advisor ───────────────────────────────────────────────────
export const getFinancialAdvice = async () => {
  const res = await api.get('/finance/advisor');
  return res.data.data;
};

// ── Financial Reports ──────────────────────────────────────────────────────
export const listFinancialReportTypes = async () => {
  const res = await api.get('/finance/reports');
  return res.data.data;
};

export const getFinancialReport = async (type) => {
  const res = await api.get(`/finance/reports/${type}`);
  return res.data.data;
};
