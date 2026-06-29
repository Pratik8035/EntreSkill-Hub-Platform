'use strict';

/**
 * businessAdvisorService.js — Sprint 9 Phase 1
 *
 * Generates an intelligent AI Business Advisor summary by combining:
 *   - ExecutionAnalyticsService (health / readiness / completion rates)
 *   - ProgressEngine (dashboard summary, KPI progress)
 *   - AI provider (narrative generation with graceful fallback)
 *
 * Public API
 * ──────────
 *   BusinessAdvisorService.getAdvisorReport(userId, user?)
 *     → {
 *         executiveSummary, businessHealth, businessReadiness,
 *         growthOpportunities, risks, priorityActions,
 *         weeklyFocus, monthlyFocus, analytics
 *       }
 */

const ExecutionAnalyticsService = require('./executionAnalyticsService');
const ProgressEngine            = require('./progressEngine');
const providerFactory           = require('../providers/providerFactory');

const ADVISOR_MAX_TOKENS = 800;

// ─── System prompt for advisor one-shot call ──────────────────────────────────
const ADVISOR_SYSTEM = `You are an expert business execution advisor for EntreSkill Hub.
Given a user's business analytics snapshot, produce a concise JSON advisory report.

Respond with ONLY valid JSON (no markdown, no code fences) in this exact shape:
{
  "executiveSummary": "2-3 sentence overview of current business execution status",
  "growthOpportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
  "risks": ["risk 1", "risk 2", "risk 3"],
  "priorityActions": ["action 1", "action 2", "action 3"],
  "weeklyFocus": "1 concrete focus for this week",
  "monthlyFocus": "1 strategic focus for this month"
}

Rules:
- Be specific and actionable based on the actual data provided.
- If no data exists, encourage the user to create goals and tasks.
- Keep each item to one sentence.
- Never invent financial figures not in the data.`;

class BusinessAdvisorService {

  static async getAdvisorReport(userId, user = null) {
    // ── 1. Gather analytics + dashboard in parallel ────────────────────────
    const [analytics, summary] = await Promise.all([
      ExecutionAnalyticsService.getAnalytics(userId),
      ProgressEngine.getDashboardSummary(userId),
    ]);

    // ── 2. Generate AI narrative ───────────────────────────────────────────
    const aiReport = await BusinessAdvisorService._generateNarrative(analytics, summary, user);

    return {
      executiveSummary:    aiReport.executiveSummary,
      businessHealth:      analytics.businessHealthScore,
      businessReadiness:   analytics.businessReadinessScore,
      growthOpportunities: aiReport.growthOpportunities,
      risks:               aiReport.risks,
      priorityActions:     aiReport.priorityActions,
      weeklyFocus:         aiReport.weeklyFocus,
      monthlyFocus:        aiReport.monthlyFocus,
      analytics,           // full analytics payload for frontend charts
    };
  }

  // ── Private ────────────────────────────────────────────────────────────────

  static async _generateNarrative(analytics, summary, user) {
    const userName = user?.name || 'the entrepreneur';

    const contextLines = [
      `User: ${userName}`,
      `Business Health Score: ${analytics.businessHealthScore}/100`,
      `Business Readiness Score: ${analytics.businessReadinessScore}/100`,
      `Total Goals: ${analytics.totalGoals} (Completed: ${analytics.completedGoals})`,
      `Goal Completion Rate: ${analytics.goalCompletionRate}%`,
      `Task Completion Rate: ${analytics.taskCompletionRate}%`,
      `Milestone Completion Rate: ${analytics.milestoneCompletionRate}%`,
      `Total Tasks: ${analytics.totalTasks} (Completed: ${analytics.completedTasks})`,
      `Overdue Tasks: ${summary.overdueTasks?.length ?? 0}`,
      `Upcoming Deadlines: ${summary.upcomingDeadlines?.length ?? 0}`,
      `Top KPIs: ${analytics.topKPIs.map((k) => `${k.name} (${k.percentage}%)`).join(', ') || 'None'}`,
      `Recent Activity: ${analytics.recentActivity.length} tasks completed recently`,
    ].join('\n');

    try {
      const provider = providerFactory.create();
      const { content } = await provider.generate({
        systemPrompt: ADVISOR_SYSTEM,
        messages: [{ role: 'user', content: contextLines }],
        maxTokens: ADVISOR_MAX_TOKENS,
      });

      // Strip any accidental markdown fences before parsing
      const cleaned = content.replace(/```json|```/gi, '').trim();
      const parsed  = JSON.parse(cleaned);

      return {
        executiveSummary:    parsed.executiveSummary    || BusinessAdvisorService._fallbackSummary(analytics),
        growthOpportunities: Array.isArray(parsed.growthOpportunities) ? parsed.growthOpportunities : [],
        risks:               Array.isArray(parsed.risks)               ? parsed.risks               : [],
        priorityActions:     Array.isArray(parsed.priorityActions)     ? parsed.priorityActions     : [],
        weeklyFocus:         parsed.weeklyFocus  || 'Focus on completing your highest-priority pending tasks.',
        monthlyFocus:        parsed.monthlyFocus || 'Review goal progress and update milestones accordingly.',
      };
    } catch (err) {
      console.error('[BusinessAdvisorService] AI narrative failed:', err.message);
      return BusinessAdvisorService._fallbackReport(analytics, summary);
    }
  }

  static _fallbackSummary(analytics) {
    if (analytics.totalGoals === 0) {
      return 'No business goals have been created yet. Start by adding your first goal to begin tracking execution.';
    }
    return `You have ${analytics.totalGoals} active goal(s) with a ${analytics.taskCompletionRate}% task completion rate and a business health score of ${analytics.businessHealthScore}/100.`;
  }

  static _fallbackReport(analytics, summary) {
    const hasData = analytics.totalGoals > 0;
    return {
      executiveSummary:    BusinessAdvisorService._fallbackSummary(analytics),
      growthOpportunities: hasData
        ? ['Complete pending milestones to unlock next-stage goals', 'Track KPI progress weekly to identify growth patterns']
        : ['Create your first business goal to start tracking', 'Add KPIs to measure business performance'],
      risks: hasData
        ? [
            summary.overdueTasks?.length > 0 ? `${summary.overdueTasks.length} task(s) are overdue` : 'Monitor task deadlines closely',
            analytics.taskCompletionRate < 50 ? 'Task completion rate is below 50%' : 'Keep maintaining consistent task completion',
          ]
        : ['No execution data available to assess risks'],
      priorityActions: hasData
        ? ['Complete all overdue tasks immediately', 'Update KPI current values to reflect latest progress', 'Review and update goal status']
        : ['Create at least 3 business goals', 'Break each goal into milestones and tasks', 'Add KPIs to track key metrics'],
      weeklyFocus:  hasData ? 'Complete 3 pending tasks and update KPI values.' : 'Create your first business goal and milestone.',
      monthlyFocus: hasData ? 'Achieve at least one milestone completion and review goal priorities.' : 'Build a complete goal structure with milestones, tasks and KPIs.',
    };
  }
}

module.exports = BusinessAdvisorService;
