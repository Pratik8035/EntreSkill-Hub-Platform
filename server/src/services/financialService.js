'use strict';

/**
 * financialService.js — Sprint 12 Phase 2
 * Income & Expense CRUD, Transaction history, Financial Goals
 */

const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Transaction = require('../models/Transaction');
const FinancialGoal = require('../models/FinancialGoal');
const AppError = require('../utils/AppError');

class FinancialService {

  // ── Income CRUD ────────────────────────────────────────────────────────────

  static async listIncome(userId, query = {}) {
    const { category, startDate, endDate, page = 1, limit = 20, search, sort = '-date' } = query;
    const filter = { userId };
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (search) filter.title = { $regex: search, $options: 'i' };
    const skip = (Number(page) - 1) * Number(limit);
    const [income, total] = await Promise.all([
      Income.find(filter).sort(sort).skip(skip).limit(Number(limit)).lean(),
      Income.countDocuments(filter),
    ]);
    return { income, total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
  }

  static async getIncomeById(id, userId) {
    const income = await Income.findOne({ _id: id, userId }).lean();
    if (!income) throw new AppError('Income record not found', 404);
    return income;
  }

  static async createIncome(data, userId) {
    const income = await Income.create({ ...data, userId });
    // Auto-create transaction record
    await Transaction.create({
      userId,
      type: 'Income',
      title: income.title,
      amount: income.amount,
      category: income.category,
      date: income.date,
      description: income.description,
      refId: income._id,
      refModel: 'Income',
    });
    return income;
  }

  static async updateIncome(id, data, userId) {
    const income = await Income.findOneAndUpdate(
      { _id: id, userId },
      { ...data, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!income) throw new AppError('Income record not found', 404);
    return income;
  }

  static async deleteIncome(id, userId) {
    const income = await Income.findOneAndDelete({ _id: id, userId });
    if (!income) throw new AppError('Income record not found', 404);
    await Transaction.deleteMany({ refId: id, refModel: 'Income' });
    return income;
  }

  // ── Expense CRUD ───────────────────────────────────────────────────────────

  static async listExpenses(userId, query = {}) {
    const { category, startDate, endDate, page = 1, limit = 20, search, sort = '-date' } = query;
    const filter = { userId };
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (search) filter.title = { $regex: search, $options: 'i' };
    const skip = (Number(page) - 1) * Number(limit);
    const [expenses, total] = await Promise.all([
      Expense.find(filter).sort(sort).skip(skip).limit(Number(limit)).lean(),
      Expense.countDocuments(filter),
    ]);
    return { expenses, total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
  }

  static async getExpenseById(id, userId) {
    const expense = await Expense.findOne({ _id: id, userId }).lean();
    if (!expense) throw new AppError('Expense record not found', 404);
    return expense;
  }

  static async createExpense(data, userId) {
    const expense = await Expense.create({ ...data, userId });
    await Transaction.create({
      userId,
      type: 'Expense',
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      description: expense.description,
      refId: expense._id,
      refModel: 'Expense',
    });
    return expense;
  }

  static async updateExpense(id, data, userId) {
    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId },
      { ...data, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!expense) throw new AppError('Expense record not found', 404);
    return expense;
  }

  static async deleteExpense(id, userId) {
    const expense = await Expense.findOneAndDelete({ _id: id, userId });
    if (!expense) throw new AppError('Expense record not found', 404);
    await Transaction.deleteMany({ refId: id, refModel: 'Expense' });
    return expense;
  }

  // ── Transaction History ────────────────────────────────────────────────────

  static async listTransactions(userId, query = {}) {
    const { type, category, startDate, endDate, page = 1, limit = 20, search, sort = '-date' } = query;
    const filter = { userId };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (search) filter.title = { $regex: search, $options: 'i' };
    const skip = (Number(page) - 1) * Number(limit);
    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort(sort).skip(skip).limit(Number(limit)).lean(),
      Transaction.countDocuments(filter),
    ]);
    return { transactions, total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
  }

  // ── Financial Goals ────────────────────────────────────────────────────────

  static async listGoals(userId) {
    return FinancialGoal.find({ userId }).sort('-createdAt').lean();
  }

  static async getGoalById(id, userId) {
    const goal = await FinancialGoal.findOne({ _id: id, userId }).lean();
    if (!goal) throw new AppError('Financial goal not found', 404);
    return goal;
  }

  static async createGoal(data, userId) {
    return FinancialGoal.create({ ...data, userId });
  }

  static async updateGoal(id, data, userId) {
    const goal = await FinancialGoal.findOneAndUpdate(
      { _id: id, userId },
      { ...data, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!goal) throw new AppError('Financial goal not found', 404);
    // Auto-complete if reached
    if (goal.currentAmount >= goal.targetAmount && goal.status === 'Active') {
      goal.status = 'Completed';
      await goal.save();
    }
    return goal;
  }

  static async deleteGoal(id, userId) {
    const goal = await FinancialGoal.findOneAndDelete({ _id: id, userId });
    if (!goal) throw new AppError('Financial goal not found', 404);
    return goal;
  }

  // ── Monthly Summary ────────────────────────────────────────────────────────

  static async getMonthlySummary(userId, year, month) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    const [incomeData, expenseData] = await Promise.all([
      Income.find({ userId, date: { $gte: start, $lte: end } }).lean(),
      Expense.find({ userId, date: { $gte: start, $lte: end } }).lean(),
    ]);
    const totalIncome = incomeData.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = expenseData.reduce((s, e) => s + e.amount, 0);
    const profit = totalIncome - totalExpenses;
    return {
      year: Number(year),
      month: Number(month),
      totalIncome,
      totalExpenses,
      profit,
      isProfit: profit >= 0,
      transactionCount: incomeData.length + expenseData.length,
    };
  }

  // ── Yearly Summary ─────────────────────────────────────────────────────────

  static async getYearlySummary(userId, year) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59);
    const [incomeData, expenseData] = await Promise.all([
      Income.find({ userId, date: { $gte: start, $lte: end } }).lean(),
      Expense.find({ userId, date: { $gte: start, $lte: end } }).lean(),
    ]);
    const totalIncome = incomeData.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = expenseData.reduce((s, e) => s + e.amount, 0);

    // Build monthly breakdown
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expenses: 0,
      profit: 0,
    }));
    incomeData.forEach((i) => {
      const m = new Date(i.date).getMonth();
      months[m].income += i.amount;
    });
    expenseData.forEach((e) => {
      const m = new Date(e.date).getMonth();
      months[m].expenses += e.amount;
    });
    months.forEach((m) => { m.profit = m.income - m.expenses; });

    return {
      year: Number(year),
      totalIncome,
      totalExpenses,
      profit: totalIncome - totalExpenses,
      isProfit: totalIncome >= totalExpenses,
      monthlyBreakdown: months,
    };
  }
}

module.exports = FinancialService;
