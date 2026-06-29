'use strict';

/**
 * financialNotificationService.js — Sprint 12 Phase 8
 * Reuses NotificationService pattern for financial events
 */

const Notification = require('../models/Notification');
const Budget = require('../models/Budget');
const Invoice = require('../models/Invoice');
const BudgetService = require('./budgetService');
const FinancialAnalyticsService = require('./financialAnalyticsService');

const DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000;

class FinancialNotificationService {

  static async generateNotifications(userId) {
    const created = [];
    const now = new Date();

    const [analytics, budgetSummary, invoices] = await Promise.all([
      FinancialAnalyticsService.getAnalytics(userId).catch(() => null),
      BudgetService.getBudgetUtilizationSummary(userId).catch(() => null),
      Invoice.find({ userId }).lean().catch(() => []),
    ]);

    // 1. Budget exceeded
    if (budgetSummary?.budgets) {
      for (const b of budgetSummary.budgets.filter((x) => x.isExceeded)) {
        await FinancialNotificationService._upsert(userId, {
          type: 'budget_exceeded',
          title: '⚠️ Budget Exceeded',
          message: `Your budget "${b.name}" has been exceeded. Spent: ₹${b.spentAmount?.toLocaleString('en-IN')} of ₹${b.allocatedAmount?.toLocaleString('en-IN')}.`,
          refId: b._id,
          refType: 'budget',
        }, created);
      }
    }

    // 2. Invoice due (within 3 days)
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    for (const inv of invoices.filter((i) => i.status === 'Sent' && i.dueDate && new Date(i.dueDate) <= threeDaysFromNow && new Date(i.dueDate) >= now)) {
      await FinancialNotificationService._upsert(userId, {
        type: 'invoice_due',
        title: '📄 Invoice Due Soon',
        message: `Invoice #${inv.invoiceNumber} for ${inv.clientName} is due on ${new Date(inv.dueDate).toLocaleDateString()}. Amount: ₹${inv.totalAmount?.toLocaleString('en-IN')}.`,
        refId: inv._id,
        refType: 'invoice',
      }, created);
    }

    // 3. Invoice overdue
    for (const inv of invoices.filter((i) => i.status === 'Sent' && i.dueDate && new Date(i.dueDate) < now)) {
      await FinancialNotificationService._upsert(userId, {
        type: 'invoice_overdue',
        title: '🚨 Invoice Overdue',
        message: `Invoice #${inv.invoiceNumber} for ${inv.clientName} is overdue. Amount: ₹${inv.totalAmount?.toLocaleString('en-IN')}.`,
        refId: inv._id,
        refType: 'invoice',
      }, created);
    }

    // 4. Invoice paid (recently)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    for (const inv of invoices.filter((i) => i.status === 'Paid' && i.paidDate && new Date(i.paidDate) >= oneDayAgo)) {
      await FinancialNotificationService._upsert(userId, {
        type: 'invoice_paid',
        title: '✅ Invoice Paid',
        message: `Invoice #${inv.invoiceNumber} for ${inv.clientName} has been paid. Amount: ₹${inv.totalAmount?.toLocaleString('en-IN')}.`,
        refId: inv._id,
        refType: 'invoice',
      }, created);
    }

    // 5. Low cash flow
    if (analytics && analytics.netCashFlow < 0) {
      await FinancialNotificationService._upsert(userId, {
        type: 'low_cash_flow',
        title: '⚠️ Negative Cash Flow',
        message: `Your cash flow is negative this month (₹${analytics.netCashFlow?.toLocaleString('en-IN')}). Review expenses and increase collections.`,
      }, created);
    }

    // 6. High expense (expenses > 90% of revenue)
    if (analytics && analytics.revenue > 0 && analytics.expenses / analytics.revenue > 0.9) {
      await FinancialNotificationService._upsert(userId, {
        type: 'high_expense',
        title: '📊 High Expense Ratio',
        message: `Your expenses (₹${analytics.expenses?.toLocaleString('en-IN')}) are over 90% of revenue (₹${analytics.revenue?.toLocaleString('en-IN')}). Consider cost reduction.`,
      }, created);
    }

    // 7. Monthly report ready (on 1st of month)
    if (now.getDate() === 1) {
      await FinancialNotificationService._upsert(userId, {
        type: 'monthly_finance_report',
        title: '📈 Monthly Financial Report Ready',
        message: 'Your monthly financial report is now available. Review your income, expenses, and profit for last month.',
      }, created);
    }

    return created;
  }

  static async _upsert(userId, data, bucket) {
    const cutoff = new Date(Date.now() - DEDUP_WINDOW_MS);
    const existing = await Notification.findOne({
      userId, type: data.type, refId: data.refId || null,
      createdAt: { $gte: cutoff },
    });
    if (existing) return;
    const notification = await Notification.create({ userId, ...data });
    bucket.push(notification);
  }
}

module.exports = FinancialNotificationService;
