'use strict';

/**
 * aiFinancialAdvisorService.js — Sprint 12 Phase 4
 * Reuses existing AI pipeline (providerFactory + promptBuilder pattern)
 * Builds financial context and generates financial advice
 */

const providerFactory = require('../providers/providerFactory');
const FinancialAnalyticsService = require('./financialAnalyticsService');
const BudgetService = require('./budgetService');
const InvoiceService = require('./invoiceService');
const FinancialService = require('./financialService');
const FinancialGoal = require('../models/FinancialGoal');

class AIFinancialAdvisorService {

  /**
   * Build financial context snapshot for AI prompt
   */
  static async buildFinancialContext(userId) {
    try {
      const [analytics, budgetSummary, invoiceSummary, goals] = await Promise.all([
        FinancialAnalyticsService.getAnalytics(userId).catch(() => null),
        BudgetService.getBudgetUtilizationSummary(userId).catch(() => null),
        InvoiceService.getInvoiceSummary(userId).catch(() => null),
        FinancialGoal.find({ userId, status: 'Active' }).lean().catch(() => []),
      ]);

      return {
        analytics,
        budgetSummary,
        invoiceSummary,
        activeGoals: goals,
      };
    } catch (err) {
      console.error('[AIFinancialAdvisorService] buildFinancialContext error:', err.message);
      return null;
    }
  }

  /**
   * Build AI prompt with financial context
   */
  static _buildFinancialPrompt(context) {
    const lines = [];
    lines.push(`# Role
You are an expert AI Financial Advisor for micro-entrepreneurs and small business owners in India.
You provide practical, data-driven financial guidance based on the user's actual financial data.`);

    if (context?.analytics) {
      const a = context.analytics;
      lines.push(`\n## Current Financial Snapshot (This Month)`);
      lines.push(`- **Revenue**: ₹${a.revenue?.toLocaleString('en-IN') ?? 0}`);
      lines.push(`- **Expenses**: ₹${a.expenses?.toLocaleString('en-IN') ?? 0}`);
      lines.push(`- **Profit/Loss**: ₹${a.profit?.toLocaleString('en-IN') ?? 0} (${a.isProfit ? 'Profit' : 'Loss'})`);
      lines.push(`- **Net Cash Flow**: ₹${a.netCashFlow?.toLocaleString('en-IN') ?? 0}`);
      lines.push(`- **Revenue Growth (MoM)**: ${a.revenueGrowth ?? 0}%`);
      lines.push(`- **Burn Rate**: ₹${a.burnRate?.toLocaleString('en-IN') ?? 0}/month`);
      lines.push(`- **Financial Health Score**: ${a.financialHealthScore ?? 0}/100`);
    }

    if (context?.budgetSummary) {
      const b = context.budgetSummary;
      lines.push(`\n## Budget Status`);
      lines.push(`- **Total Budgeted**: ₹${b.totalAllocated?.toLocaleString('en-IN') ?? 0}`);
      lines.push(`- **Total Spent**: ₹${b.totalSpent?.toLocaleString('en-IN') ?? 0}`);
      lines.push(`- **Overall Utilization**: ${b.overallUtilization ?? 0}%`);
      if (b.exceededBudgets > 0) lines.push(`- ⚠️ **Exceeded Budgets**: ${b.exceededBudgets}`);
    }

    if (context?.invoiceSummary) {
      const i = context.invoiceSummary;
      lines.push(`\n## Invoice Overview`);
      lines.push(`- **Total Invoices**: ${i.totalInvoices ?? 0}`);
      lines.push(`- **Paid**: ${i.paid ?? 0} | **Pending**: ${i.sent ?? 0} | **Overdue**: ${i.overdue ?? 0}`);
      lines.push(`- **Revenue from Invoices**: ₹${i.totalRevenue?.toLocaleString('en-IN') ?? 0}`);
      if (i.overdueAmount > 0) lines.push(`- ⚠️ **Overdue Amount**: ₹${i.overdueAmount?.toLocaleString('en-IN')}`);
    }

    if (context?.activeGoals?.length > 0) {
      lines.push(`\n## Active Financial Goals`);
      context.activeGoals.slice(0, 3).forEach((g) => {
        const pct = g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0;
        lines.push(`- **${g.title}** (${g.type}): ₹${g.currentAmount?.toLocaleString('en-IN')} / ₹${g.targetAmount?.toLocaleString('en-IN')} (${pct}%)`);
      });
    }

    lines.push(`\n## Instructions
1. Provide specific, actionable financial advice based on the data above.
2. Identify financial risks and opportunities.
3. Suggest concrete steps to improve financial health.
4. Use simple language suitable for first-time entrepreneurs.
5. Always end with one actionable next step the user can take today.
6. Reference specific numbers from the data when giving advice.
7. For budget exceeded categories, suggest specific cost reduction measures.`);

    return lines.join('\n');
  }

  /**
   * Generate AI financial advice
   */
  static async getAdvice(userId) {
    const context = await AIFinancialAdvisorService.buildFinancialContext(userId);
    const systemPrompt = AIFinancialAdvisorService._buildFinancialPrompt(context);

    const prompt = `Based on my current financial data, provide a comprehensive financial health assessment including:
1. Financial Health Summary
2. Budget Suggestions
3. Cost Optimization Opportunities
4. Revenue Growth Strategies
5. Investment Suggestions
6. Cash Flow Warnings (if any)
7. Key Action Items for this month

Please be specific and reference my actual numbers.`;

    try {
      const provider = providerFactory.create();
      const maxTokens = parseInt(process.env.AI_MAX_TOKENS, 10) || 1500;
      const { content } = await provider.generate({
        systemPrompt,
        messages: [{ role: 'user', content: prompt }],
        maxTokens,
      });
      return {
        advice: content,
        context: {
          financialHealthScore: context?.analytics?.financialHealthScore ?? null,
          revenue: context?.analytics?.revenue ?? 0,
          expenses: context?.analytics?.expenses ?? 0,
          profit: context?.analytics?.profit ?? 0,
          isProfit: context?.analytics?.isProfit ?? false,
          cashFlow: context?.analytics?.netCashFlow ?? 0,
          overdueInvoices: context?.invoiceSummary?.overdue ?? 0,
          budgetUtilization: context?.budgetSummary?.overallUtilization ?? 0,
        },
        generatedAt: new Date(),
      };
    } catch (err) {
      console.error('[AIFinancialAdvisorService] getAdvice error:', err.message);
      return {
        advice: 'Financial advisor is temporarily unavailable. Please check your financial data in the dashboard.',
        context: null,
        generatedAt: new Date(),
      };
    }
  }
}

module.exports = AIFinancialAdvisorService;
