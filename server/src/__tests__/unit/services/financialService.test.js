'use strict';

/**
 * Unit Tests — FinancialService (Sprint 12)
 */

require('../../setup');
const mongoose = require('mongoose');
const FinancialService = require('../../../services/financialService');
const Income = require('../../../models/Income');
const Expense = require('../../../models/Expense');
const Transaction = require('../../../models/Transaction');
const FinancialGoal = require('../../../models/FinancialGoal');

process.env.NODE_ENV           = 'test';
process.env.JWT_SECRET         = 'test-jwt-secret-key';

const userId = new mongoose.Types.ObjectId();

describe('FinancialService — Unit Tests (Sprint 12)', () => {

  // ── Income ─────────────────────────────────────────────────────────────────
  describe('Income', () => {
    it('createIncome creates record and auto-creates transaction', async () => {
      const income = await FinancialService.createIncome(
        { title: 'Sales Revenue', amount: 10000, category: 'Sales' },
        userId
      );
      expect(income.title).toBe('Sales Revenue');
      expect(income.amount).toBe(10000);

      const txn = await Transaction.findOne({ refId: income._id });
      expect(txn).not.toBeNull();
      expect(txn.type).toBe('Income');
      expect(txn.amount).toBe(10000);
    });

    it('listIncome returns paginated results', async () => {
      await FinancialService.createIncome({ title: 'Inc 1', amount: 100 }, userId);
      await FinancialService.createIncome({ title: 'Inc 2', amount: 200 }, userId);
      const result = await FinancialService.listIncome(userId, { limit: 10 });
      expect(result.income.length).toBeGreaterThanOrEqual(2);
      expect(result).toHaveProperty('total');
    });

    it('getIncomeById returns correct record', async () => {
      const created = await FinancialService.createIncome({ title: 'Fetch Me', amount: 500 }, userId);
      const fetched = await FinancialService.getIncomeById(created._id, userId);
      expect(fetched._id.toString()).toBe(created._id.toString());
    });

    it('getIncomeById throws 404 for wrong user', async () => {
      const created = await FinancialService.createIncome({ title: 'Not Mine', amount: 100 }, userId);
      const otherId = new mongoose.Types.ObjectId();
      await expect(FinancialService.getIncomeById(created._id, otherId)).rejects.toThrow('Income record not found');
    });

    it('updateIncome updates fields', async () => {
      const created = await FinancialService.createIncome({ title: 'Old', amount: 300 }, userId);
      const updated = await FinancialService.updateIncome(created._id, { title: 'New', amount: 400 }, userId);
      expect(updated.title).toBe('New');
      expect(updated.amount).toBe(400);
    });

    it('deleteIncome removes record and transaction', async () => {
      const created = await FinancialService.createIncome({ title: 'Delete Me', amount: 50 }, userId);
      await FinancialService.deleteIncome(created._id, userId);
      const found = await Income.findById(created._id);
      expect(found).toBeNull();
      const txn = await Transaction.findOne({ refId: created._id });
      expect(txn).toBeNull();
    });
  });

  // ── Expense ────────────────────────────────────────────────────────────────
  describe('Expense', () => {
    it('createExpense creates record and transaction', async () => {
      const expense = await FinancialService.createExpense(
        { title: 'Office Supplies', amount: 2500, category: 'Operations' },
        userId
      );
      expect(expense.title).toBe('Office Supplies');
      const txn = await Transaction.findOne({ refId: expense._id });
      expect(txn).not.toBeNull();
      expect(txn.type).toBe('Expense');
    });

    it('listExpenses filters by category', async () => {
      await FinancialService.createExpense({ title: 'Rent', amount: 5000, category: 'Rent' }, userId);
      await FinancialService.createExpense({ title: 'Ad Spend', amount: 3000, category: 'Marketing' }, userId);
      const result = await FinancialService.listExpenses(userId, { category: 'Rent' });
      expect(result.expenses.every(e => e.category === 'Rent')).toBe(true);
    });

    it('updateExpense updates fields', async () => {
      const exp = await FinancialService.createExpense({ title: 'Old Exp', amount: 100 }, userId);
      const updated = await FinancialService.updateExpense(exp._id, { amount: 150 }, userId);
      expect(updated.amount).toBe(150);
    });

    it('deleteExpense removes record', async () => {
      const exp = await FinancialService.createExpense({ title: 'Del Exp', amount: 75 }, userId);
      await FinancialService.deleteExpense(exp._id, userId);
      const found = await Expense.findById(exp._id);
      expect(found).toBeNull();
    });
  });

  // ── Financial Goals ────────────────────────────────────────────────────────
  describe('Financial Goals', () => {
    const goalData = {
      title: 'Emergency Fund',
      targetAmount: 100000,
      targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'Emergency Fund',
    };

    it('createGoal creates a financial goal', async () => {
      const goal = await FinancialService.createGoal(goalData, userId);
      expect(goal.title).toBe('Emergency Fund');
      expect(goal.targetAmount).toBe(100000);
      expect(goal.status).toBe('Active');
    });

    it('listGoals returns user goals', async () => {
      await FinancialService.createGoal(goalData, userId);
      const goals = await FinancialService.listGoals(userId);
      expect(goals.length).toBeGreaterThanOrEqual(1);
    });

    it('updateGoal updates currentAmount', async () => {
      const goal = await FinancialService.createGoal(goalData, userId);
      const updated = await FinancialService.updateGoal(goal._id, { currentAmount: 25000 }, userId);
      expect(updated.currentAmount).toBe(25000);
    });

    it('deleteGoal removes goal', async () => {
      const goal = await FinancialService.createGoal(goalData, userId);
      await FinancialService.deleteGoal(goal._id, userId);
      const found = await FinancialGoal.findById(goal._id);
      expect(found).toBeNull();
    });
  });

  // ── Monthly / Yearly Summary ───────────────────────────────────────────────
  describe('Summaries', () => {
    it('getMonthlySummary returns correct structure', async () => {
      const now = new Date();
      const result = await FinancialService.getMonthlySummary(userId, now.getFullYear(), now.getMonth() + 1);
      expect(result).toHaveProperty('totalIncome');
      expect(result).toHaveProperty('totalExpenses');
      expect(result).toHaveProperty('profit');
      expect(result).toHaveProperty('isProfit');
    });

    it('getYearlySummary returns monthly breakdown', async () => {
      const result = await FinancialService.getYearlySummary(userId, new Date().getFullYear());
      expect(result).toHaveProperty('monthlyBreakdown');
      expect(result.monthlyBreakdown.length).toBe(12);
    });
  });

  // ── Transactions ───────────────────────────────────────────────────────────
  describe('Transactions', () => {
    it('listTransactions returns auto-created records', async () => {
      await FinancialService.createIncome({ title: 'T1 Inc', amount: 5000 }, userId);
      await FinancialService.createExpense({ title: 'T1 Exp', amount: 2000 }, userId);
      const result = await FinancialService.listTransactions(userId);
      expect(result.transactions.length).toBeGreaterThanOrEqual(2);
    });

    it('listTransactions supports type filter', async () => {
      await FinancialService.createIncome({ title: 'Filter Inc', amount: 1000 }, userId);
      const result = await FinancialService.listTransactions(userId, { type: 'Income' });
      expect(result.transactions.every(t => t.type === 'Income')).toBe(true);
    });
  });
});
