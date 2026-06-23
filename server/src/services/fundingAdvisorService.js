'use strict';

/**
 * fundingAdvisorService.js — Sprint 5 Phase 4
 *
 * Combines EligibilityEngine + FundingRecommendation + AI summary
 * into a single advisor response.
 *
 * Public API
 * ──────────
 *   FundingAdvisorService.getAdvisorSummary(userId)
 *     → { eligibility, recommendations, advisorSummary }
 *
 * advisorSummary is a short, plain-language text produced by the AI provider
 * that synthesizes the eligibility + recommendation data into actionable advice.
 * If the AI call fails, a deterministic fallback summary is returned instead —
 * the endpoint never throws due to AI unavailability.
 */

const EligibilityEngineService       = require('./eligibilityEngineService');
const FundingRecommendationService   = require('./fundingRecommendationService');
const { buildPersonalizedSystemPrompt } = require('./promptBuilder');
const providerFactory                = require('../providers/providerFactory');
const User                           = require('../models/User');
const UserAssessment                 = require('../models/UserAssessment');

// ─── Token budget cap for the advisor summary ─────────────────────────────────
const ADVISOR_MAX_TOKENS = 600;

// ─── System prompt for the advisor one-shot call ──────────────────────────────
const ADVISOR_SYSTEM_PROMPT = `You are the EntreSkill Hub AI Funding Advisor.
Your task is to write a short (150–250 word), warm, and actionable funding summary
for an entrepreneur based on their eligibility results and top recommendations.

Rules:
- Address the user directly ("You are eligible for…", "We recommend…").
- Name the specific schemes/programs from the data provided.
- Mention the top 1–2 recommendations with their scores.
- If no eligible schemes exist, encourage the user to complete their profile and generate a business plan.
- Use plain, jargon-free language.
- End with one concrete next step the user should take today.
- Keep the response to 3–4 short paragraphs. No markdown headers.`;

class FundingAdvisorService {

  /**
   * Return the full advisor payload for a user.
   *
   * @param {string|ObjectId} userId
   * @param {object} [user]  - req.user (name, etc.) for personalisation
   * @returns {Promise<{ eligibility, recommendations, advisorSummary }>}
   */
  static async getAdvisorSummary(userId, user = null) {
    // ── 1. Run eligibility + recommendations in parallel ──────────────────
    const [eligibility, recommendations] = await Promise.all([
      EligibilityEngineService.evaluate(userId),
      FundingRecommendationService.recommend(userId),
    ]);

    // ── 2. Build advisor summary via AI ───────────────────────────────────
    const advisorSummary = await FundingAdvisorService._generateSummary(
      eligibility,
      recommendations,
      user
    );

    return { eligibility, recommendations, advisorSummary };
  }

  // ── Private: generate AI summary ──────────────────────────────────────────

  static async _generateSummary(eligibility, recommendations, user) {
    try {
      const userName = user?.name || 'the entrepreneur';

      // Build a compact context message for the AI
      const eligible   = eligibility.eligibleSchemes.slice(0, 3);
      const partial    = eligibility.partiallyEligibleSchemes.slice(0, 2);
      const topRecs    = recommendations.recommendations.slice(0, 3);

      const contextLines = [
        `User: ${userName}`,
        '',
        'Eligible schemes:',
        eligible.length
          ? eligible.map((s) => `  - ${s.schemeName} (${s.type}, score ${s.score}/100)`).join('\n')
          : '  None yet.',
        '',
        'Partially eligible schemes:',
        partial.length
          ? partial.map((s) => `  - ${s.schemeName} (${s.type}, score ${s.score}/100)`).join('\n')
          : '  None.',
        '',
        'Top funding recommendations:',
        topRecs.length
          ? topRecs.map((r, i) => `  ${i + 1}. ${r.name} (${r.type}, score ${r.score}/100) — ${r.reasons?.[0] || ''}`).join('\n')
          : '  No recommendations available.',
      ];

      const provider = providerFactory.create();
      const { content } = await provider.generate({
        systemPrompt: ADVISOR_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: contextLines.join('\n') }],
        maxTokens: ADVISOR_MAX_TOKENS,
      });

      return content || FundingAdvisorService._fallbackSummary(eligible, topRecs, userName);
    } catch (err) {
      console.error('[FundingAdvisorService] AI summary failed:', err.message);
      return FundingAdvisorService._fallbackSummary(
        eligibility.eligibleSchemes.slice(0, 3),
        recommendations.recommendations.slice(0, 3),
        user?.name || 'entrepreneur'
      );
    }
  }

  // ── Deterministic fallback when AI is unavailable ─────────────────────────

  static _fallbackSummary(eligibleSchemes, topRecs, userName) {
    if (eligibleSchemes.length === 0 && topRecs.length === 0) {
      return `Hi ${userName}! To unlock personalised funding advice, complete your skills assessment and generate a business plan from the Recommendations page. Once done, our engine will match you with the best government schemes and funding programs for your venture.`;
    }

    const parts = [];

    if (eligibleSchemes.length > 0) {
      const names = eligibleSchemes.map((s) => s.schemeName).join(', ');
      parts.push(`Great news, ${userName}! Based on your profile, you are currently eligible for: **${names}**. We recommend exploring these first as they offer the strongest match for your situation.`);
    }

    if (topRecs.length > 0) {
      const top = topRecs[0];
      parts.push(`Your top funding recommendation is **${top.name}** with a match score of ${top.score}/100. ${top.reasons?.[0] || ''}`);
    }

    parts.push(`Visit the Schemes & Funding page to view full details and apply. As a next step, click "Apply" on your top-matched scheme to start the process today.`);

    return parts.join('\n\n');
  }
}

module.exports = FundingAdvisorService;
