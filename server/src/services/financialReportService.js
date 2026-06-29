'use strict';

/**
 * financialReportService.js — Sprint 12 Phase 5
 * Generates JSON financial reports
 */

const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Invoice = require('../models/Invoice');
const FinancialGoal = require('../models/FinancialGoal');
const BudgetService = require('./budgetService');
const FinancialAnalyticsService = require('./financialAnalyticsService');
const AppError = require('../utils/AppError');

const REPORT_TYPES = [
  { type: 'income_report',    label: 'Income Report',    description: 'All income records with category breakdown.' },
  { type: 'expense_report',   label: 'Expense Report',   description: 'All expense records with category breakdown.' },
  { type: 'profit_report',    label: 'Profit Report',    description: 'Revenue vs expenses with profit analysis.' },
  { type: 'loss_report',      label: 'Loss Report',      description: 'Loss periods and contributing factors.' },
  { type: 'cash_flow_report', label: 'Cash Flow Report', description: 'Cash inflows and outflows analysis.' },
  { type: 'budget_report',    label: 'Budget Report',    description: 'Budget allocation and utilization.' },
  { type: 'invoice_report',   label: 'Invoice Report',   description: 'Invoice status and revenue tracking.' },
  { type: 'monthly_report',   label: 'Monthly Report',   description: 'Complete monthly financial overview.' },
  { type: 'yearly_report',    label: 'Yearly Report',    description: 'Annual financial performance summary.' },
];

class FinancialReportService {

  static listReportTypes() {
    return REPORT_TYPES;
  }

  static async getReport(type, userId) {
    switch (type) {
      case 'income_report':    return FinancialReportService._incomeReport(userId);
      case 'expense_report':   return FinancialReportService._expenseReport(userId);
      case 'profit_report':    return FinancialReportService._profitReport(userId);
      case 'loss_report':      return FinancialReportService._lossReport(userId);
      case 'cash_flow_report': return FinancialReportService._cashFlowReport(userId);
      case 'budget_report':    return FinancialReportService._budgetReport(userId);
      case 'invoice_report':   return FinancialReportService._invoiceReport(userId);
      case 'monthly_report':   return FinancialReportService._monthlyReport(userId);
      case 'yearly_report':    return FinancialReportService._yearlyReport(userId);
      default: throw new AppError(`Unknown report type: ${type}`, 400);
    }
  }

  static async _incomeReport(userId) {
    const records = await Income.find({ userId }).sort('-date').lean();
    const total = records.reduce((s, r) => s + r.amount, 0);
    const byCategory = {};
    records.forEach((r) => {
      byCategory[r.category] = (byCategory[r.category] || 0) + r.amount;
    });
    return {
      type: 'income_report', label: 'Income Report', generatedAt: new Date(),
      totalIncome: total, totalRecords: records.length,
      byCategory,
      records: records.slice(0, 50),
    };
  }

  static async _expenseReport(userId) {
    const records = await Expense.find({ userId }).sort('-date').lean();
    const total = records.reduce((s, r) => s + r.amount, 0);
    const byCategory = {};
    records.forEach((r) => {
      byCategory[r.category] = (byCategory[r.category] || 0) + r.amount;
    });
    return {
      type: 'expense_report', label: 'Expense Report', generatedAt: new Date(),
      totalExpenses: total, totalRecords: records.length,
      byCategory,
      records: records.slice(0, 50),
    };
  }

  static async _profitReport(userId) {
    const analytics = await FinancialAnalyticsService.getAnalytics(userId);
    return {
      type: 'profit_report', label: 'Profit Report', generatedAt: new Date(),
      revenue: analytics.revenue,
      expenses: analytics.expenses,
      profit: analytics.profit,
      isProfit: analytics.isProfit,
      profitMargin: analytics.revenue > 0
        ? Math.round((analytics.profit / analytics.revenue) * 100)
        : 0,
      monthlyTrend: analytics.monthlyTrend,
      financialHealthScore: analytics.financialHealthScore,
    };
  }

  static async _lossReport(userId) {
    const trend = await FinancialAnalyticsService._buildMonthlyTrend(userId, 12);
    const lossPeriods = trend.filter((m) => m.profit < 0);
    const analytics = await FinancialAnalyticsService.getAnalytics(userId);
    return {
      type: 'loss_report', label: 'Loss Report', generatedAt: new Date(),
      currentMonthIsLoss: !analytics.isProfit,
      currentLoss: analytics.isProfit ? 0 : Math.abs(analytics.profit),
      totalLossPeriods: lossPeriods.length,
      lossPeriods,
      totalLossAmount: lossPeriods.reduce((s, m) => s + Math.abs(m.profit), 0),
      burnRate: analytics.burnRate,
    };
  }

  static async _cashFlowReport(userId) {
    const analytics = await FinancialAnalyticsService.getAnalytics(userId);
    return {
      type: 'cash_flow_report', label: 'Cash Flow Report', generatedAt: new Date(),
      cashInflow: analytics.cashInflow,
      cashOutflow: analytics.cashOutflow,
      netCashFlow: analytics.netCashFlow,
      isPositive: analytics.netCashFlow >= 0,
      monthlyTrend: analytics.monthlyTrend?.map((m) => ({
        label: m.label,
        inflow: m.income,
        outflow: m.expenses,
        net: m.profit,
      })),
      burnRate: analytics.burnRate,
    };
  }

  static async _budgetReport(userId) {
    const summary = await BudgetService.getBudgetUtilizationSummary(userId);
    return {
      type: 'budget_report', label: 'Budget Report', generatedAt: new Date(),
      ...summary,
    };
  }

  static async _invoiceReport(userId) {
    const invoices = await Invoice.find({ userId }).sort('-issueDate').lean();
    const now = new Date();
    const paid = invoices.filter((i) => i.status === 'Paid');
    const overdue = invoices.filter((i) => i.status === 'Sent' && i.dueDate && new Date(i.dueDate) < now);
    return {
      type: 'invoice_report', label: 'Invoice Report', generatedAt: new Date(),
      totalInvoices: invoices.length,
      byStatus: {
        draft: invoices.filter((i) => i.status === 'Draft').length,
        sent: invoices.filter((i) => i.status === 'Sent').length,
        paid: paid.length,
        overdue: overdue.length,
        cancelled: invoices.filter((i) => i.status === 'Cancelled').length,
      },
      totalRevenue: paid.reduce((s, i) => s + i.totalAmount, 0),
      pendingAmount: invoices.filter((i) => i.status === 'Sent').reduce((s, i) => s + i.totalAmount, 0),
      overdueAmount: overdue.reduce((s, i) => s + i.totalAmount, 0),
      recentInvoices: invoices.slice(0, 20),
    };
  }

  static async _monthlyReport(userId) {
    const now = new Date();
    const analytics = await FinancialAnalyticsService.getAnalytics(userId);
    const budgetSummary = await BudgetService.getBudgetUtilizationSummary(userId);
    return {
      type: 'monthly_report', label: 'Monthly Report', generatedAt: new Date(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      revenue: analytics.revenue,
      expenses: analytics.expenses,
      profit: analytics.profit,
      isProfit: analytics.isProfit,
      netCashFlow: analytics.netCashFlow,
      savings: analytics.savings,
      revenueGrowth: analytics.revenueGrowth,
      financialHealthScore: analytics.financialHealthScore,
      budgetUtilization: analytics.budgetUtilization,
      overdueInvoices: analytics.overdueInvoices,
    };
  }

  static async _yearlyReport(userId) {
    const now = new Date();
    const analytics = await FinancialAnalyticsService.getAnalytics(userId);
    return {
      type: 'yearly_report', label: 'Yearly Report', generatedAt: new Date(),
      year: now.getFullYear(),
      totalRevenue: analytics.revenue,
      totalExpenses: analytics.expenses,
      totalProfit: analytics.profit,
      isProfit: analytics.isProfit,
      burnRate: analytics.burnRate,
      yearlyTrend: analytics.yearlyTrend,
      financialHealthScore: analytics.financialHealthScore,
    };
  }
}

module.exports = FinancialReportService;
