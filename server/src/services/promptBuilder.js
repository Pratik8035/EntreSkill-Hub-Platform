/**
 * promptBuilder.js
 * Sprint 4 – Phase 3
 *
 * Exports:
 *   buildPersonalizedSystemPrompt(snapshot, user)  ← primary (Phase 3)
 *   buildSuggestedQuestions(snapshot)               ← helper (Phase 3)
 *   buildSystemPrompt()                             ← legacy fallback (Phase 1)
 *
 * Prompt token budget (approximate):
 *   Section 1  Persona         ~120 tokens  (static)
 *   Section 2  User profile    ~100 tokens  (dynamic)
 *   Section 3  Business ctx    ~150 tokens  (dynamic, only when idea linked)
 *   Section 4  Recommendations ~ 80 tokens  (dynamic, top 3)
 *   Section 5  Mentors         ~ 60 tokens  (dynamic, top 3)
 *   Section 6  Resources       ~ 80 tokens  (dynamic, top 5)
 *   Section 7  Behaviour rules ~150 tokens  (static)
 *   ─────────────────────────────────────────────────
 *   Total                      ~740 tokens  (well within all provider limits)
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// Token-safety caps (mirrors ContextService caps — enforced again here as a
// second safety net in case the snapshot was built with different settings)
// ─────────────────────────────────────────────────────────────────────────────
const MAX_SKILLS           = 10;
const MAX_INTERESTS        = 8;
const MAX_RESOURCES        = 5;
const MAX_RECOMMENDATIONS  = 3;
const MAX_MENTORS          = 3;
const EXEC_SUMMARY_CHARS   = 200; // tighter than ContextService's 250

// ─────────────────────────────────────────────────────────────────────────────
// Section builders  (each returns a string or '' when data is missing)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Section 1 – AI Mentor Persona (static)
 * Defines role, tone, focus area. Never changes regardless of context.
 */
function _buildPersonaSection() {
  return `# Role
You are the **EntreSkill Hub AI Mentor** – a warm, knowledgeable, and practical advisor who helps aspiring micro-entrepreneurs (especially women and people in rural communities) start and grow their own businesses in India.

## Your core expertise
- Business registration, licensing and compliance (India, with general global awareness)
- Low-cost marketing strategies for micro and small businesses
- Skill-based businesses: tailoring, handicrafts, food processing, beauty, agro-processing
- Financial planning, budgeting and basic accounting for first-time entrepreneurs
- Government schemes, subsidies and grants for small businesses (MSME, PMEGP, Mudra, etc.)
- Identifying skill gaps and recommending practical training paths`;
}

/**
 * Section 2 – User Profile (dynamic)
 * Injects the user's name, experience level, assessment score, skills and interests.
 * If assessment has not been completed, adds a gentle prompt to complete it.
 *
 * @param {object} snapshot  - contextSnapshot from ChatSession
 * @param {object} [user]    - req.user object (name, profile.location)
 * @returns {string}
 */
function _buildUserProfileSection(snapshot, user) {
  const name           = user?.name           || 'the user';
  const location       = user?.profile?.location || null;
  const expLevel       = snapshot?.experienceLevel  || 'Beginner';
  const score          = snapshot?.assessmentScore  ?? null;
  const isAssessed     = snapshot?.isAssessmentDone ?? false;

  const skills    = (snapshot?.skills    || []).slice(0, MAX_SKILLS);
  const interests = (snapshot?.interests || []).slice(0, MAX_INTERESTS);

  const lines = [];
  lines.push(`## User you are advising`);
  lines.push(`- **Name**: ${name}`);
  if (location) lines.push(`- **Location**: ${location}`);
  lines.push(`- **Entrepreneurship experience**: ${expLevel}${score !== null ? ` (assessment score: ${score}%)` : ''}`);

  if (!isAssessed) {
    lines.push(
      `- ⚠️ This user has **not yet completed their skills assessment**. ` +
      `When relevant, gently encourage them to visit /assessment for more personalised guidance.`
    );
  }

  if (skills.length > 0) {
    const skillList = skills
      .map((s) => `${s.name} *(${s.proficiency})*`)
      .join(', ');
    lines.push(`- **Skills**: ${skillList}`);
  } else {
    lines.push(`- **Skills**: Not yet assessed`);
  }

  if (interests.length > 0) {
    const interestList = interests
      .map((i) => `${i.name} (preference ${i.weight}/5)`)
      .join(', ');
    lines.push(`- **Interests**: ${interestList}`);
  } else {
    lines.push(`- **Interests**: Not yet provided`);
  }

  return lines.join('\n');
}

/**
 * Section 3 – Business Context (dynamic)
 * Only rendered when the session is linked to a specific business idea.
 * Includes the idea overview, roadmap milestones, missing skills, and
 * a truncated excerpt from the business plan.
 *
 * @param {object} snapshot
 * @returns {string}  empty string when no business idea is linked
 */
function _buildBusinessContextSection(snapshot) {
  if (!snapshot?.businessIdeaName) return '';

  const lines = [];
  lines.push(`## Current business idea`);
  lines.push(`- **Idea**: ${snapshot.businessIdeaName}`);

  if (snapshot.businessIdeaCategory)
    lines.push(`- **Category**: ${snapshot.businessIdeaCategory}`);
  if (snapshot.startupCostRange)
    lines.push(`- **Startup cost range**: ${snapshot.startupCostRange}`);
  if (snapshot.difficultyLevel)
    lines.push(`- **Difficulty level**: ${snapshot.difficultyLevel}`);
  if (snapshot.riskScore)
    lines.push(`- **Risk score**: ${snapshot.riskScore}`);

  // Roadmap
  if (snapshot.roadmapTimeline || snapshot.milestoneCount) {
    lines.push(`\n### Roadmap`);
    if (snapshot.roadmapTimeline)
      lines.push(`- **Timeline**: ${snapshot.roadmapTimeline}`);
    if (snapshot.milestoneCount)
      lines.push(`- **Milestones**: ${snapshot.milestoneCount} planned milestone${snapshot.milestoneCount !== 1 ? 's' : ''}`);
  }

  // Missing skills — most actionable part of the roadmap
  const missingSkills = snapshot.missingSkillNames || [];
  if (missingSkills.length > 0) {
    lines.push(
      `- **Skill gaps to address**: ${missingSkills.join(', ')} ` +
      `– when these topics come up, suggest how the user can develop these skills.`
    );
  }

  // Business plan executive summary (truncated)
  if (snapshot.executiveSummary) {
    const excerpt = snapshot.executiveSummary.slice(0, EXEC_SUMMARY_CHARS).trimEnd();
    const ellipsis = snapshot.executiveSummary.length > EXEC_SUMMARY_CHARS ? '…' : '';
    lines.push(`\n### Business plan (excerpt)\n> ${excerpt}${ellipsis}`);
  }

  return lines.join('\n');
}

/**
 * Section 4 – Top Recommendations (dynamic)
 * Lists the top 3 business ideas that best match this user's profile.
 * Helps the AI suggest alternative paths when the user is still exploring.
 *
 * @param {object} snapshot
 * @returns {string}
 */
function _buildRecommendationsSection(snapshot) {
  const recs = (snapshot?.topRecommendations || []).slice(0, MAX_RECOMMENDATIONS);
  if (recs.length === 0) return '';

  const lines = [`## Top matched business ideas for this user`];
  recs.forEach((r, i) => {
    lines.push(`${i + 1}. **${r.name}** — ${r.matchScore}% match`);
  });
  lines.push(
    `\nWhen the user asks what business to start, reference these recommendations ` +
    `with their match percentages to make concrete, personalised suggestions.`
  );

  return lines.join('\n');
}

/**
 * Section 5 – Mentor context (dynamic)
 * Surfaces the expertise categories of the top matching mentors.
 * Allows the AI to suggest connecting with a mentor in the right area.
 *
 * @param {object} snapshot
 * @returns {string}
 */
function _buildMentorSection(snapshot) {
  const mentors = (snapshot?.topMentors || []).slice(0, MAX_MENTORS);
  if (mentors.length === 0) return '';

  // Collect unique expertise categories across top mentors
  const allExpertise = [...new Set(mentors.flatMap((m) => m.expertise || []))];
  const allIndustries = [...new Set(mentors.flatMap((m) => m.industries || []))];

  if (allExpertise.length === 0 && allIndustries.length === 0) return '';

  const lines = [`## Available mentor expertise`];
  if (allExpertise.length > 0)
    lines.push(`- **Expert areas**: ${allExpertise.join(', ')}`);
  if (allIndustries.length > 0)
    lines.push(`- **Industries covered**: ${allIndustries.join(', ')}`);
  lines.push(
    `\nWhen advice requires deep expertise or ongoing accountability, ` +
    `suggest the user connect with a mentor through the platform's Mentors page.`
  );

  return lines.join('\n');
}

/**
 * Section 6 – Learning Resources (dynamic)
 * Lists up to 5 resources linked to the current business idea.
 * The AI should reference these by title when recommending learning paths.
 *
 * @param {object} snapshot
 * @returns {string}
 */
function _buildResourcesSection(snapshot) {
  const resources = (snapshot?.resources || []).slice(0, MAX_RESOURCES);
  if (resources.length === 0) return '';

  const lines = [`## Learning resources available on the platform`];
  resources.forEach((r) => {
    lines.push(`- **${r.title}** *(${r.type})*`);
  });
  lines.push(
    `\nWhen recommending learning paths, reference these resources by title ` +
    `so the user knows they are available on EntreSkill Hub.`
  );

  return lines.join('\n');
}

/**
 * Section 7 – Funding Context (dynamic) — Sprint 5 Phase 4
 * Injects the user's eligibility results and top funding recommendations
 * so the AI can give grounded, personalised answers to funding questions.
 *
 * @param {object} snapshot
 * @returns {string}  empty string when no funding data is available
 */
function _buildFundingContextSection(snapshot) {
  const fc = snapshot?.fundingContext;
  if (!fc) return '';

  const eligible    = fc.eligibleSchemes           || [];
  const partial     = fc.partiallyEligibleSchemes  || [];
  const topRecs     = fc.topFundingRecommendations || [];

  if (eligible.length === 0 && partial.length === 0 && topRecs.length === 0) return '';

  const lines = [`## User's funding eligibility & recommendations`];

  if (eligible.length > 0) {
    lines.push(`\n### Schemes the user is eligible for`);
    eligible.forEach((s) => {
      lines.push(`- **${s.schemeName}** *(${s.type})* — eligibility score: ${s.score}/100`);
    });
  }

  if (partial.length > 0) {
    lines.push(`\n### Schemes the user is partially eligible for`);
    partial.forEach((s) => {
      lines.push(`- **${s.schemeName}** *(${s.type})* — score: ${s.score}/100 (some requirements unmet)`);
    });
  }

  if (topRecs.length > 0) {
    lines.push(`\n### Top funding recommendations for this user`);
    topRecs.forEach((r, i) => {
      const reasonText = r.reasons?.length ? ` — ${r.reasons[0]}` : '';
      lines.push(`${i + 1}. **${r.name}** *(${r.type})* — score ${r.score}/100${reasonText}`);
    });
  }

  lines.push(
    `\n**When the user asks about funding, schemes, or financial support:**\n` +
    `- Reference the eligible schemes above by name.\n` +
    `- For partially eligible schemes, explain what requirements are unmet and how to address them.\n` +
    `- Use the top recommendations when asked "which scheme should I apply for?" or "what funding options do I have?".\n` +
    `- Never invent scheme names or eligibility criteria — only reference what is listed above.`
  );

  return lines.join('\n');
}

/**
 * Section 7 – Behaviour Rules (static)
 * Hard rules the model must follow in every response.
 * These are static and do not depend on context.
 */
function _buildBehaviourRulesSection() {
  return `## How you must respond

1. **Ground advice in the user's actual data.** Reference their specific skills, interests, roadmap milestones, and business idea — never give generic advice when personalised advice is possible.
2. **Never invent financial figures.** Only quote costs and revenue numbers that appear in the user's business plan or business idea data above. If figures are unavailable, give a regional range and say so.
3. **Address skill gaps directly.** If the user's roadmap has missing skills listed above, proactively suggest how to develop them when relevant to the question.
4. **Recommend platform resources by name.** When suggesting learning materials, use the titles listed in Section 6 above rather than external links.
5. **Suggest mentor connection when appropriate.** If the question requires deep, ongoing support, encourage connecting with a mentor in the relevant expertise area via the platform.
6. **Use the top-3 recommended business ideas** when the user asks what business to start or which path suits them.
7. **Use simple, clear language.** Avoid jargon unless you explain it. Many users are first-time entrepreneurs with limited formal business training.
8. **Format responses with markdown**: use ## headers for sections, bullet points for lists, and **bold** for key terms and action items.
9. **Target 300–600 words per response** unless the question genuinely requires more detail (e.g. step-by-step guides).
10. **Always end each response with one follow-up question** to keep the conversation moving forward and help the user think through the next step.
11. **For funding & scheme questions**: use the eligible schemes and top recommendations from Section 7. Answer "Which scheme should I apply for?", "Am I eligible for Mudra Loan?", "Which government scheme is best for me?", and "What funding options do I have?" using only the data provided — never fabricate scheme details.
12. **If no funding data is available**, tell the user to visit the Schemes & Funding page to complete their profile and generate a business plan for personalised recommendations.`;
}

/**
 * Section 8.5 – Financial Context (dynamic) — Sprint 12
 * Injects user's financial health data for financial question support
 */
function _buildFinancialContextSection(snapshot) {
  const fc = snapshot?.financialContext;
  if (!fc) return '';
  if (!fc.revenue && !fc.expenses && !fc.financialHealthScore) return '';

  const lines = ['## Financial Context'];
  if (fc.financialHealthScore !== null && fc.financialHealthScore !== undefined)
    lines.push(`- **Financial Health Score**: ${fc.financialHealthScore}/100`);
  if (fc.revenue !== undefined)
    lines.push(`- **Monthly Revenue**: ₹${fc.revenue?.toLocaleString('en-IN') ?? 0}`);
  if (fc.expenses !== undefined)
    lines.push(`- **Monthly Expenses**: ₹${fc.expenses?.toLocaleString('en-IN') ?? 0}`);
  if (fc.profit !== undefined)
    lines.push(`- **Profit/Loss**: ₹${fc.profit?.toLocaleString('en-IN') ?? 0} (${fc.isProfit ? 'Profit' : 'Loss'})`);
  if (fc.netCashFlow !== undefined)
    lines.push(`- **Net Cash Flow**: ₹${fc.netCashFlow?.toLocaleString('en-IN') ?? 0}`);
  if (fc.revenueGrowth !== undefined)
    lines.push(`- **Revenue Growth (MoM)**: ${fc.revenueGrowth ?? 0}%`);
  if (fc.burnRate)
    lines.push(`- **Burn Rate**: ₹${fc.burnRate?.toLocaleString('en-IN') ?? 0}/month`);
  if (fc.overdueInvoices > 0)
    lines.push(`- ⚠️ **Overdue Invoices**: ${fc.overdueInvoices}`);

  lines.push(`\nWhen the user asks about finances, budgeting, revenue growth, expenses, cash flow, or investments, reference their actual financial data above. Direct them to the Finance module for detailed tracking.`);
  return lines.join('\n');
}


function _buildCommunityContextSection(snapshot) {
  const cc = snapshot?.communityContext;
  if (!cc) return '';
  const { recentPostCount, followersCount, followingCount, upcomingSessionCount } = cc;
  if (!recentPostCount && !followersCount && !followingCount && !upcomingSessionCount) return '';

  const lines = ['## Community & Collaboration context'];
  if (followersCount)       lines.push(`- **Followers**: ${followersCount}`);
  if (followingCount)       lines.push(`- **Following**: ${followingCount}`);
  if (recentPostCount)      lines.push(`- **Posts this month**: ${recentPostCount}`);
  if (upcomingSessionCount) lines.push(`- **Upcoming mentor sessions**: ${upcomingSessionCount}`);
  lines.push(`\nWhen asked about networking, collaboration or community building, reference the user's community engagement above.`);
  return lines.join('\n');
}



/**
 * Build a fully personalised system prompt from the user's context snapshot.
 *
 * All sections degrade gracefully — if a piece of context is missing the
 * section either renders with defaults or is omitted entirely. The prompt
 * never throws.
 *
 * @param {object|null} snapshot  - ChatSession.contextSnapshot (may be null)
 * @param {object|null} [user]    - req.user (name, profile.location)
 * @returns {string}  Complete system prompt string
 */
function buildPersonalizedSystemPrompt(snapshot, user = null) {
  const sections = [
    _buildPersonaSection(),
    _buildUserProfileSection(snapshot, user),
    _buildBusinessContextSection(snapshot),
    _buildRecommendationsSection(snapshot),
    _buildMentorSection(snapshot),
    _buildResourcesSection(snapshot),
    _buildFundingContextSection(snapshot),    // Sprint 5 Phase 4
    _buildFinancialContextSection(snapshot), // Sprint 12
    _buildCommunityContextSection(snapshot), // Sprint 11
    _buildBehaviourRulesSection(),
  ]
    // Drop empty sections (e.g. business context when no idea is linked)
    .filter((s) => s.trim().length > 0);

  return sections.join('\n\n---\n\n');
}

/**
 * Generate 5 dynamic suggested questions based on the user's context snapshot.
 * Questions are personalised in priority order:
 *   1. Missing skills from roadmap
 *   2. Current business idea
 *   3. Top recommendations
 *   4. Static micro-entrepreneur defaults (always available as fallback)
 *
 * @param {object|null} snapshot  - ChatSession.contextSnapshot (may be null)
 * @returns {string[]}  Array of exactly 5 question strings
 */
function buildSuggestedQuestions(snapshot) {
  const questions = [];

  // ── Priority 1: roadmap skill gaps ──────────────────────────────────────
  const missingSkills = snapshot?.missingSkillNames || [];
  for (const skill of missingSkills.slice(0, 2)) {
    if (questions.length >= 5) break;
    questions.push(
      `How can I develop my **${skill}** skills quickly and affordably?`
    );
  }

  // ── Priority 2: current business idea ───────────────────────────────────
  const ideaName = snapshot?.businessIdeaName;
  if (ideaName && questions.length < 5) {
    questions.push(
      `What are the first 3 steps to start my **${ideaName}**?`
    );
  }
  if (ideaName && snapshot?.riskScore && questions.length < 5) {
    questions.push(
      `How do I reduce the ${snapshot.riskScore.toLowerCase()} risk in my **${ideaName}**?`
    );
  }

  // ── Priority 3: top recommendation not already the current idea ─────────
  const recs = (snapshot?.topRecommendations || []).slice(0, MAX_RECOMMENDATIONS);
  for (const rec of recs) {
    if (questions.length >= 5) break;
    if (rec.name === ideaName) continue; // skip current idea — already covered
    questions.push(
      `Tell me more about starting a **${rec.name}** (${rec.matchScore}% match for me).`
    );
  }

  // ── Priority 4: static defaults (fill remaining slots) ──────────────────
  const defaults = [
    'How do I register a micro-business in India?',
    'What government schemes are available for small business owners?',
    'How should I price my products or services?',
    'What are low-cost marketing strategies for a new business?',
    'How do I create a simple budget for my startup?',
  ];

  for (const q of defaults) {
    if (questions.length >= 5) break;
    questions.push(q);
  }

  return questions.slice(0, 5);
}

/**
 * Legacy static system prompt — kept for backward compatibility.
 * @deprecated  Use buildPersonalizedSystemPrompt() instead.
 * @returns {string}
 */
function buildSystemPrompt() {
  // Delegate to the personalised builder with null context so all sections
  // render with their graceful-degradation defaults.
  return buildPersonalizedSystemPrompt(null, null);
}

module.exports = {
  buildPersonalizedSystemPrompt,
  buildSuggestedQuestions,
  buildSystemPrompt, // legacy export preserved
};
