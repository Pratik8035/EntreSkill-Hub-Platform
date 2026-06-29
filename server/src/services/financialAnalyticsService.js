'use strict';

/**
 * financialAnalyticsService.js — Sprint 12 Phase 3
 * Calculates Revenue, Expenses, Profit/Loss, Cash Flow, Savings,
 * Budget Utilization, Growth, Burn Rate, Monthly/Yearly Trends,
 * Business Financial Health Score
 */

const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Invoice = require('../models/Invoice');
const FinancialGoal = require('../models/FinancialGoal');
const Transaction = require('../models/Transaction');

class FinancialAnalyticsService {

  static async getAnalytics(userId) {
    const now = new Date();
    const currentMonth = { year: now.getFullYear(), month: now.getMonth() };
    const prevMonth = now.getMonth() === 0
      ? { year: now.getFullYear() - 1, month: 11 }
      : { year: now.getFullYear(), month: now.getMonth() - 1 };

    const startOfMonth = new Date(currentMonth.year, currentMonth.month, 1);
    const endOfMonth = new Date(currentMonth.year, currentMonth.month + 1, 0, 23, 59, 59);
    const startOfPrevMonth = new Date(prevMonth.year, prevMonth.month, 1);
    const endOfPrevMonth = new Date(prevMonth.year, prevMonth.month + 1, 0, 23, 59, 59);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      allIncome, allExpenses, budgets, invoices, goals,
      prevIncome, prevExpenses,
    ] = await Promise.all([
      Income.find({ userId, date: { $gte: startOfMonth, $lte: endOfMonth } }).lean(),
      Expense.find({ userId, date: { $gte: startOfMonth, $lte: endOfMonth } }).lean(),
      Budget.find({ userId, isActive: true }).lean(),
      Invoice.find({ userId }).lean(),
      FinancialGoal.find({ userId }).lean(),
      Income.find({ userId, date: { $gte: startOfPrevMonth, $lte: endOfPrevMonth } }).lean(),
      Expense.find({ userId, date: { $gte: startOfPrevMonth, $lte: endOfPrevMonth } }).lean(),
    ]);

    const revenue = allIncome.reduce((s, i) => s + i.amount, 0);
    const expenses = allExpenses.reduce((s, e) => s + e.amount, 0);
    const profit = revenue - expenses;
    const prevRevenue = prevIncome.reduce((s, i) => s + i.amount, 0);
    const prevExpenses2 = prevExpenses.reduce((s, e) => s + e.amount, 0);

    // Cash Flow: inflows - outflows
    const cashInflow = revenue;
    const cashOutflow = expenses;
    const netCashFlow = cashInflow - cashOutflow;

    // Savings = revenue * savings_rate_estimate (20% default) or leftover
    const savings = Math.max(0, profit * 0.3);

    // Budget utilization
    let totalBudgetAllocated = 0;
    let totalBudgetSpent = 0;
    for (const b of budgets) {
      const spent = allExpenses
        .filter((e) => e.category === b.category)
        .reduce((s, e) => s + e.amount, 0);
      totalBudgetAllocated += b.allocatedAmount;
      totalBudgetSpent += spent;
    }
    const budgetUtilization = totalBudgetAllocated > 0
      ? Math.round((totalBudgetSpent / totalBudgetAllocated) * 100)
      : 0;

    // Growth rate (month-over-month revenue)
    const revenueGrowth = prevRevenue > 0
      ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100)
      : revenue > 0 ? 100 : 0;

    // Burn rate = avg monthly expenses
    const yearExpenses = await Expense.find({ userId, date: { $gte: startOfYear } }).lean();
    const monthsElapsed = now.getMonth() + 1;
    const burnRate = monthsElapsed > 0
      ? Math.round(yearExpenses.reduce((s, e) => s + e.amount, 0) / monthsElapsed)
      : expenses;

    // Monthly trend (last 6 months)
    const monthlyTrend = await FinancialAnalyticsService._buildMonthlyTrend(userId, 6);

    // Yearly trend (current year by month)
    const yearlyTrend = await FinancialAnalyticsService._buildYearlyTrend(userId, now.getFullYear());

    // Invoice stats
    const paidInvoices = invoices.filter((i) => i.status === 'Paid');
    const overdueInvoices = invoices.filter((i) => i.status === 'Sent' && i.dueDate && new Date(i.dueDate) < now);
    const invoiceRevenue = paidInvoices.reduce((s, i) => s + i.totalAmount, 0);

    // Financial health score (0-100)
    const healthScore = FinancialAnalyticsService._calcHealthScore({
      profit, revenue, expenses, budgetUtilization, revenueGrowth,
      overdueCount: overdueInvoices.length, goals,
    });

    return {
      // Core financials
      revenue,
      expenses,
      profit,
      isProfit: profit >= 0,
      // Cash flow
      cashInflow,
      cashOutflow,
      netCashFlow,
      // Savings
      savings,
      // Budget
      budgetUtilization,
      totalBudgetAllocated,
      totalBudgetSpent,
      // Growth & burn
      revenueGrowth,
      expenseGrowth: prevExpenses2 > 0
        ? Math.round(((expenses - prevExpenses2) / prevExpenses2) * 100)
        : expenses > 0 ? 100 : 0,
      burnRate,
      // Invoices
      invoiceRevenue,
      totalInvoices: invoices.length,
      overdueInvoices: overdueInvoices.length,
      // Trends
      monthlyTrend,
      yearlyTrend,
      // Health
      financialHealthScore: healthScore,
      // Goals
      activeGoals: goals.filter((g) => g.status === 'Active').length,
      completedGoals: goals.filter((g) => g.status === 'Completed').length,
    };
  }

  static async _buildMonthlyTrend(userId, months = 6) {
    const trend = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const [inc, exp] = await Promise.all([
        Income.find({ userId, date: { $gte: start, $lte: end } }).lean(),
        Expense.find({ userId, date: { $gte: start, $lte: end } }).lean(),
      ]);
      const income = inc.reduce((s, x) => s + x.amount, 0);
      const expenses = exp.reduce((s, x) => s + x.amount, 0);
      trend.push({
        label: `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`,
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        income,
        expenses,
        profit: income - expenses,
      });
    }
    return trend;
  }

  static async _buildYearlyTrend(userId, year) {
    const months = [];
    for (let m = 0; m < 12; m++) {
      const start = new Date(year, m, 1);
      const end = new Date(year, m + 1, 0, 23, 59, 59);
      const [inc, exp] = await Promise.all([
        Income.find({ userId, date: { $gte: start, $lte: end } }).lean(),
        Expense.find({ userId, date: { $gte: start, $lte: end } }).lean(),
      ]);
      const income = inc.reduce((s, x) => s + x.amount, 0);
      const expenses = exp.reduce((s, x) => s + x.amount, 0);
      months.push({
        month: m + 1,
        label: new Date(year, m, 1).toLocaleString('default', { month: 'short' }),
        income, expenses, profit: income - expenses,
      });
    }
    return months;
  }

  static _calcHealthScore({ profit, revenue, expenses, budgetUtilization, revenueGrowth, overdueCount, goals }) {
    let score = 50; // base

    // Profit positive → +20
    if (profit > 0) score += 20;
    else score -= 10;

    // Revenue > 0 → +10
    if (revenue > 0) score += 10;

    // Budget under 80% → +10; over 100% → -15
    if (budgetUtilization > 0 && budgetUtilization <= 80) score += 10;
    else if (budgetUtilization > 100) score -= 15;

    // Revenue growth positive → +10
    if (revenueGrowth > 0) score += 10;
    else if (revenueGrowth < -10) score -= 5;

    // No overdue invoices → +5; many → -5
    if (overdueCount === 0) score += 5;
    else if (overdueCount > 3) score -= 5;

    // Active goals → +5
    if (goals && goals.filter((g) => g.status === 'Active').length > 0) score += 5;

    return Math.min(100, Math.max(0, score));
  }
}

module.exports = FinancialAnalyticsService;
