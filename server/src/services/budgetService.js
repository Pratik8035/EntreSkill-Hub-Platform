'use strict';

/**
 * budgetService.js — Sprint 12 Phase 2
 * Budget CRUD and utilization tracking
 */

const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const AppError = require('../utils/AppError');

class BudgetService {

  static async listBudgets(userId, query = {}) {
    const { category, period, isActive, page = 1, limit = 20 } = query;
    const filter = { userId };
    if (category) filter.category = category;
    if (period) filter.period = period;
    if (isActive !== undefined && isActive !== '') filter.isActive = isActive === 'true' || isActive === true;
    const skip = (Number(page) - 1) * Number(limit);
    const [budgets, total] = await Promise.all([
      Budget.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)).lean(),
      Budget.countDocuments(filter),
    ]);
    // Enrich each budget with utilization
    const enriched = await Promise.all(budgets.map((b) => BudgetService._enrichWithUtilization(b)));
    return { budgets: enriched, total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
  }

  static async getBudgetById(id, userId) {
    const budget = await Budget.findOne({ _id: id, userId }).lean();
    if (!budget) throw new AppError('Budget not found', 404);
    return BudgetService._enrichWithUtilization(budget);
  }

  static async createBudget(data, userId) {
    return Budget.create({ ...data, userId });
  }

  static async updateBudget(id, data, userId) {
    const budget = await Budget.findOneAndUpdate(
      { _id: id, userId },
      { ...data, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!budget) throw new AppError('Budget not found', 404);
    return budget;
  }

  static async deleteBudget(id, userId) {
    const budget = await Budget.findOneAndDelete({ _id: id, userId });
    if (!budget) throw new AppError('Budget not found', 404);
    return budget;
  }

  // Calculate budget utilization: sum expenses in that category within the period
  static async _enrichWithUtilization(budget) {
    try {
      const expenses = await Expense.find({
        userId: budget.userId,
        category: budget.category,
        date: { $gte: budget.startDate, $lte: budget.endDate },
      }).lean();
      const spent = expenses.reduce((s, e) => s + e.amount, 0);
      const utilizationPercent = budget.allocatedAmount > 0
        ? Math.round((spent / budget.allocatedAmount) * 100)
        : 0;
      return {
        ...budget,
        spentAmount: spent,
        remainingAmount: Math.max(0, budget.allocatedAmount - spent),
        utilizationPercent,
        isExceeded: spent > budget.allocatedAmount,
        isAlertTriggered: utilizationPercent >= (budget.alertThreshold ?? 80),
      };
    } catch {
      return { ...budget, spentAmount: 0, remainingAmount: budget.allocatedAmount, utilizationPercent: 0 };
    }
  }

  static async getBudgetUtilizationSummary(userId) {
    const budgets = await Budget.find({ userId, isActive: true }).lean();
    const enriched = await Promise.all(budgets.map((b) => BudgetService._enrichWithUtilization(b)));
    const totalAllocated = enriched.reduce((s, b) => s + b.allocatedAmount, 0);
    const totalSpent = enriched.reduce((s, b) => s + b.spentAmount, 0);
    return {
      totalBudgets: enriched.length,
      totalAllocated,
      totalSpent,
      totalRemaining: Math.max(0, totalAllocated - totalSpent),
      overallUtilization: totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0,
      exceededBudgets: enriched.filter((b) => b.isExceeded).length,
      alertTriggered: enriched.filter((b) => b.isAlertTriggered && !b.isExceeded).length,
      budgets: enriched,
    };
  }
}

module.exports = BudgetService;
