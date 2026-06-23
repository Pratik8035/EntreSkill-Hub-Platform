/**
 * Unit tests – promptBuilder (Sprint 4 Phase 3)
 *
 * No mocks needed — promptBuilder is a pure function module.
 *
 * Coverage:
 *   buildPersonalizedSystemPrompt()
 *     - All 7 sections present in full-context snapshot
 *     - User profile section (name, location, skills, interests)
 *     - Business context section (idea, roadmap, missing skills, plan)
 *     - Recommendations section
 *     - Mentor section
 *     - Resources section
 *     - Behaviour rules section
 *     - Graceful degradation: null snapshot
 *     - Graceful degradation: partial snapshot (no business idea)
 *     - Graceful degradation: no skills, no interests
 *     - Token safety caps (skills ≤10, interests ≤8, etc.)
 *     - executiveSummary truncated to 200 chars
 *     - Assessment not done warning
 *   buildSuggestedQuestions()
 *     - Always returns exactly 5 questions
 *     - Priority 1: missing skills
 *     - Priority 2: business idea name
 *     - Priority 3: top recommendations
 *     - Priority 4: static defaults fill remaining slots
 *     - Null snapshot returns 5 static defaults
 *   buildSystemPrompt() legacy
 *     - Returns a non-empty string (delegates to personalised builder)
 */

'use strict';

const {
  buildPersonalizedSystemPrompt,
  buildSuggestedQuestions,
  buildSystemPrompt,
} = require('../../../services/promptBuilder');

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

const FULL_SNAPSHOT = {
  experienceLevel:  'Intermediate',
  assessmentScore:  72,
  isAssessmentDone: true,
  skills: [
    { name: 'Tailoring',  proficiency: 'Advanced'  },
    { name: 'Marketing',  proficiency: 'Beginner'  },
    { name: 'Accounting', proficiency: 'Beginner'  },
  ],
  interests: [
    { name: 'Fashion', weight: 5 },
    { name: 'Retail',  weight: 3 },
  ],
  businessIdeaName:     'Tailoring Business',
  businessIdeaCategory: 'Textile',
  startupCostRange:     '₹10,000–₹25,000',
  difficultyLevel:      'Beginner',
  riskScore:            'Low',
  executiveSummary:     'A tailoring business focused on women in rural Maharashtra providing affordable alterations and custom stitching.',
  roadmapTimeline:      '3 months',
  milestoneCount:       4,
  missingSkillNames:    ['GST Filing', 'Bookkeeping'],
  topRecommendations: [
    { name: 'Tailoring Business',   matchScore: 88 },
    { name: 'Handicraft Store',     matchScore: 65 },
    { name: 'Food Processing Unit', matchScore: 55 },
  ],
  topMentors: [
    { expertise: ['Business', 'Finance'], industries: ['Retail'],     matchScore: 80 },
    { expertise: ['Tech'],               industries: ['E-Commerce'],  matchScore: 60 },
  ],
  resources: [
    { title: 'GST for Small Business', type: 'Article', url: 'https://example.com/gst' },
    { title: 'WhatsApp Marketing',     type: 'Video',   url: 'https://example.com/wm'  },
  ],
};

const MOCK_USER = {
  name: 'Priya Sharma',
  profile: { location: 'Pune, Maharashtra' },
};

// ─────────────────────────────────────────────────────────────────────────────
// buildPersonalizedSystemPrompt()
// ─────────────────────────────────────────────────────────────────────────────

describe('buildPersonalizedSystemPrompt()', () => {

  describe('Section 1 – Persona', () => {
    it('includes the AI Mentor persona heading', () => {
      const prompt = buildPersonalizedSystemPrompt(FULL_SNAPSHOT, MOCK_USER);
      expect(prompt).toMatch(/EntreSkill Hub AI Mentor/);
    });

    it('mentions micro-entrepreneurs and India focus', () => {
      const prompt = buildPersonalizedSystemPrompt(FULL_SNAPSHOT, MOCK_USER);
      expect(prompt).toMatch(/micro-entrepreneur/i);
      expect(prompt).toMatch(/India/);
    });

    it('lists core expertise areas', () => {
      const prompt = buildPersonalizedSystemPrompt(FULL_SNAPSHOT, MOCK_USER);
      expect(prompt).toMatch(/Business registration/i);
      expect(prompt).toMatch(/Government schemes/i);
    });
  });

  describe('Section 2 – User Profile', () => {
    it('includes user name', () => {
      const prompt = buildPersonalizedSystemPrompt(FULL_SNAPSHOT, MOCK_USER);
      expect(prompt).toContain('Priya Sharma');
    });

    it('includes user location when provided', () => {
      const prompt = buildPersonalizedSystemPrompt(FULL_SNAPSHOT, MOCK_USER);
      expect(prompt).toContain('Pune, Maharashtra');
    });

    it('includes experience level and assessment score', () => {
      const prompt = buildPersonalizedSystemPrompt(FULL_SNAPSHOT, MOCK_USER);
      expect(prompt).toMatch(/Intermediate/);
      expect(prompt).toMatch(/72/);
    });

    it('lists all user skills with proficiency levels', () => {
      const prompt = buildPersonalizedSystemPrompt(FULL_SNAPSHOT, MOCK_USER);
      expect(prompt).toContain('Tailoring');
      expect(prompt).toContain('Advanced');
      expect(prompt).toContain('Marketing');
    });

    it('lists user interests with preference weights', () => {
      const prompt = buildPersonalizedSystemPrompt(FULL_SNAPSHOT, MOCK_USER);
      expect(prompt).toContain('Fashion');
      expect(prompt).toContain('5/5');
    });

    it('shows assessment-not-done warning when isAssessmentDone is false', () => {
      const snap = { ...FULL_SNAPSHOT, isAssessmentDone: false };
      const prompt = buildPersonalizedSystemPrompt(snap, MOCK_USER);
      expect(prompt).toMatch(/not yet completed their skills assessment/i);
    });

    it('does NOT show assessment warning when isAssessmentDone is true', () => {
      const prompt = buildPersonalizedSystemPrompt(FULL_SNAPSHOT, MOCK_USER);
      expect(prompt).not.toMatch(/not yet completed their skills assessment/i);
    });

    it('shows "Not yet assessed" when skills array is empty', () => {
      const snap = { ...FULL_SNAPSHOT, skills: [] };
      const prompt = buildPersonalizedSystemPrompt(snap, MOCK_USER);
      expect(prompt).toMatch(/Not yet assessed/);
    });

    it('falls back to "the user" when user object is null', () => {
      const prompt = buildPersonalizedSystemPrompt(FULL_SNAPSHOT, null);
      expect(prompt).toContain('the user');
    });

    it('omits location line when location is empty string', () => {
      const user = { name: 'Test', profile: { location: '' } };
      const prompt = buildPersonalizedSystemPrompt(FULL_SNAPSHOT, user);
      expect(prompt).not.toMatch(/\*\*Location\*\*/);
    });
  });

  describe('Section 3 – Business Context', () => {
    it('includes business idea name', () => {
      const prompt = buildPersonalizedSystemPrompt(FULL_SNAPSHOT, MOCK_USER);
      expect(prompt).toContain('Tailoring Business');
    });

    it('includes startup cost range', () => {
      const prompt = buildPersonalizedSystemPrompt(FULL_SNAPSHOT, MOCK_USER);
      expect(prompt).toContain('₹10,000–₹25,000');
    });

    it('includes risk score', () => {
      const prompt = buildPersonalizedSystemPrompt(FULL_SNAPSHOT, MOCK_USER);
      expect(prompt).toMatch(/Risk score.*Low/i);
    });

    it('includes roadmap timeline and milestone count', () => {
      const prompt = buildPersonalizedSystemPrompt(FULL_SNAPSHOT, MOCK_USER);
      expect(prompt).toContain('3 months');
      expect(prompt).toMatch(/4 planned milestone/);
    });

    it('lists missing skills from roadmap', () => {
      const prompt = buildPersonalizedSystemPrompt(FULL_SNAPSHOT, MOCK_USER);
      expect(prompt).toContain('GST Filing');
      expect(prompt).toContain('Bookkeeping');
    });

    it('includes truncated executive summary', () => {
      const prompt = buildPersonalizedSystemPrompt(FULL_SNAPSHOT, MOCK_USER);
      expect(prompt).toContain('tailoring business');
    });

    it('omits business context section when businessIdeaName is null', () => {
      const snap = { ...FULL_SNAPSHOT, businessIdeaName: null };
      const prompt = buildPersonalizedSystemPrompt(snap, MOCK_USER);
      expect(prompt).not.toMatch(/Current business idea/);
    });

    it('truncates executiveSummary to 200 characters', () => {
      const longSummary = 'X'.repeat(400);
      const snap = { ...FULL_SNAPSHOT, executiveSummary: longSummary };
      const prompt = buildPersonalizedSystemPrompt(snap, MOCK_USER);
      // The excerpt in the prompt should not be longer than 200 X's + ellipsis
      const match = prompt.match(/> (X+)(…?)/);
      expect(match).not.toBeNull();
      expect(match[1].length).toBeLessThanOrEqual(200);
    });
  });

  describe('Section 4 – Recommendations', () => {
    it('lists top 3 recommendations with match scores', () => {
      const prompt = buildPersonalizedSystemPrompt(FULL_SNAPSHOT, MOCK_USER);
      expect(prompt).toContain('Tailoring Business');
      expect(prompt).toMatch(/88%/);
      expect(prompt).toContain('Handicraft Store');
      expect(prompt).toMatch(/65%/);
    });

    it('omits recommendations section when topRecommendations is empty', () => {
      const snap = { ...FULL_SNAPSHOT, topRecommendations: [] };
      const prompt = buildPersonalizedSystemPrompt(snap, MOCK_USER);
      expect(prompt).not.toMatch(/Top matched business ideas/);
    });
  });

  describe('Section 5 – Mentors', () => {
    it('includes mentor expertise categories', () => {
      const prompt = buildPersonalizedSystemPrompt(FULL_SNAPSHOT, MOCK_USER);
      expect(prompt).toContain('Business');
      expect(prompt).toContain('Finance');
    });

    it('includes mentor industries', () => {
      const prompt = buildPersonalizedSystemPrompt(FULL_SNAPSHOT, MOCK_USER);
      expect(prompt).toContain('Retail');
    });

    it('omits mentor section when topMentors is empty', () => {
      const snap = { ...FULL_SNAPSHOT, topMentors: [] };
      const prompt = buildPersonalizedSystemPrompt(snap, MOCK_USER);
      expect(prompt).not.toMatch(/Available mentor expertise/);
    });

    it('omits mentor section when all mentors have empty expertise and industries', () => {
      const snap = {
        ...FULL_SNAPSHOT,
        topMentors: [{ expertise: [], industries: [], matchScore: 50 }],
      };
      const prompt = buildPersonalizedSystemPrompt(snap, MOCK_USER);
      expect(prompt).not.toMatch(/Available mentor expertise/);
    });
  });

  describe('Section 6 – Resources', () => {
    it('lists resource titles and types', () => {
      const prompt = buildPersonalizedSystemPrompt(FULL_SNAPSHOT, MOCK_USER);
      expect(prompt).toContain('GST for Small Business');
      expect(prompt).toContain('Article');
      expect(prompt).toContain('WhatsApp Marketing');
    });

    it('omits resources section when resources is empty', () => {
      const snap = { ...FULL_SNAPSHOT, resources: [] };
      const prompt = buildPersonalizedSystemPrompt(snap, MOCK_USER);
      expect(prompt).not.toMatch(/Learning resources available/);
    });
  });

  describe('Section 7 – Behaviour Rules', () => {
    it('includes rule about never inventing financial figures', () => {
      const prompt = buildPersonalizedSystemPrompt(FULL_SNAPSHOT, MOCK_USER);
      expect(prompt).toMatch(/Never invent financial figures/i);
    });

    it('includes rule about markdown formatting', () => {
      const prompt = buildPersonalizedSystemPrompt(FULL_SNAPSHOT, MOCK_USER);
      expect(prompt).toMatch(/markdown/i);
    });

    it('includes rule about ending with a follow-up question', () => {
      const prompt = buildPersonalizedSystemPrompt(FULL_SNAPSHOT, MOCK_USER);
      expect(prompt).toMatch(/follow-up question/i);
    });

    it('includes rule about 300–600 word target length', () => {
      const prompt = buildPersonalizedSystemPrompt(FULL_SNAPSHOT, MOCK_USER);
      expect(prompt).toMatch(/300.{1,5}600 words/);
    });
  });

  describe('Graceful degradation', () => {
    it('does NOT throw when snapshot is null', () => {
      expect(() => buildPersonalizedSystemPrompt(null, null)).not.toThrow();
    });

    it('does NOT throw when snapshot is an empty object', () => {
      expect(() => buildPersonalizedSystemPrompt({}, MOCK_USER)).not.toThrow();
    });

    it('still returns persona and behaviour rules when snapshot is null', () => {
      const prompt = buildPersonalizedSystemPrompt(null, null);
      expect(prompt).toMatch(/EntreSkill Hub AI Mentor/);
      expect(prompt).toMatch(/How you must respond/);
    });

    it('produces a non-empty prompt for every combination of missing context', () => {
      const partials = [
        null,
        {},
        { experienceLevel: 'Beginner' },
        { skills: [], interests: [], topRecommendations: [] },
        { businessIdeaName: 'Test Idea', roadmapTimeline: null, missingSkillNames: [] },
      ];
      for (const snap of partials) {
        const prompt = buildPersonalizedSystemPrompt(snap, null);
        expect(typeof prompt).toBe('string');
        expect(prompt.trim().length).toBeGreaterThan(100);
      }
    });
  });

  describe('Token safety caps', () => {
    it('caps skills at 10 even when snapshot has more', () => {
      const snap = {
        ...FULL_SNAPSHOT,
        skills: Array.from({ length: 15 }, (_, i) => ({
          name: `Skill${i}`, proficiency: 'Beginner',
        })),
      };
      const prompt = buildPersonalizedSystemPrompt(snap, MOCK_USER);
      // Count occurrences of "Beginner" in the skills list
      // Skills 10-14 should NOT appear
      expect(prompt).not.toContain('Skill10');
      expect(prompt).not.toContain('Skill14');
      expect(prompt).toContain('Skill9');
    });

    it('caps interests at 8', () => {
      const snap = {
        ...FULL_SNAPSHOT,
        interests: Array.from({ length: 12 }, (_, i) => ({
          name: `Interest${i}`, weight: 3,
        })),
      };
      const prompt = buildPersonalizedSystemPrompt(snap, MOCK_USER);
      expect(prompt).not.toContain('Interest8');
      expect(prompt).toContain('Interest7');
    });

    it('caps recommendations at 3', () => {
      const snap = {
        ...FULL_SNAPSHOT,
        topRecommendations: Array.from({ length: 6 }, (_, i) => ({
          name: `Idea${i}`, matchScore: 80 - i * 5,
        })),
      };
      const prompt = buildPersonalizedSystemPrompt(snap, MOCK_USER);
      expect(prompt).not.toContain('Idea3');
      expect(prompt).toContain('Idea2');
    });

    it('caps resources at 5', () => {
      const snap = {
        ...FULL_SNAPSHOT,
        resources: Array.from({ length: 8 }, (_, i) => ({
          title: `Resource${i}`, type: 'Article', url: `https://example.com/${i}`,
        })),
      };
      const prompt = buildPersonalizedSystemPrompt(snap, MOCK_USER);
      expect(prompt).not.toContain('Resource5');
      expect(prompt).toContain('Resource4');
    });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// buildSuggestedQuestions()
// ─────────────────────────────────────────────────────────────────────────────

describe('buildSuggestedQuestions()', () => {

  it('always returns exactly 5 questions', () => {
    expect(buildSuggestedQuestions(FULL_SNAPSHOT)).toHaveLength(5);
    expect(buildSuggestedQuestions(null)).toHaveLength(5);
    expect(buildSuggestedQuestions({})).toHaveLength(5);
  });

  it('Priority 1: includes missing skill questions', () => {
    const questions = buildSuggestedQuestions(FULL_SNAPSHOT);
    const combined = questions.join(' ');
    expect(combined).toContain('GST Filing');
    expect(combined).toContain('Bookkeeping');
  });

  it('Priority 2: includes business idea name question', () => {
    const questions = buildSuggestedQuestions(FULL_SNAPSHOT);
    const combined = questions.join(' ');
    expect(combined).toContain('Tailoring Business');
  });

  it('Priority 2: includes risk-reduction question when riskScore present', () => {
    const questions = buildSuggestedQuestions(FULL_SNAPSHOT);
    const combined = questions.join(' ');
    expect(combined).toMatch(/risk/i);
    expect(combined).toContain('low risk');
  });

  it('Priority 3: includes recommendation question for non-current idea', () => {
    const snap = {
      ...FULL_SNAPSHOT,
      // Remove missing skills and current idea to push recommendations up
      missingSkillNames: [],
      businessIdeaName: null,
      riskScore: null,
    };
    const questions = buildSuggestedQuestions(snap);
    const combined = questions.join(' ');
    expect(combined).toContain('Tailoring Business');
  });

  it('Priority 4: fills remaining slots with static defaults', () => {
    // No context at all — all 5 slots filled by defaults
    const questions = buildSuggestedQuestions(null);
    const combined = questions.join(' ');
    expect(combined).toMatch(/register a micro-business/i);
  });

  it('does not add a recommendation question for the current business idea', () => {
    // When the current idea matches a recommendation entry, the recommendation
    // question for that entry should be skipped. Priority-2 questions about the
    // idea (first steps, risk) are still allowed — they serve a different purpose.
    const snap = {
      ...FULL_SNAPSHOT,
      missingSkillNames: [],
      businessIdeaName: 'Tailoring Business',
      topRecommendations: [
        { name: 'Tailoring Business', matchScore: 88 }, // matches current idea
        { name: 'Handicraft Store',   matchScore: 65 }, // different idea
      ],
    };
    const questions = buildSuggestedQuestions(snap);
    // The recommendation-style question ("Tell me more about starting a ...
    // X% match") must NOT appear for the current idea
    const recStyleForCurrentIdea = questions.filter(
      q => q.includes('Tailoring Business') && q.includes('match for me')
    );
    expect(recStyleForCurrentIdea).toHaveLength(0);
  });

  it('returns all 5 strings (not null/undefined)', () => {
    const questions = buildSuggestedQuestions(FULL_SNAPSHOT);
    questions.forEach(q => {
      expect(typeof q).toBe('string');
      expect(q.trim().length).toBeGreaterThan(0);
    });
  });

  it('works correctly with only 1 missing skill', () => {
    const snap = { ...FULL_SNAPSHOT, missingSkillNames: ['Bookkeeping'] };
    const questions = buildSuggestedQuestions(snap);
    expect(questions).toHaveLength(5);
    expect(questions[0]).toContain('Bookkeeping');
  });

  it('works when topRecommendations is empty', () => {
    const snap = { ...FULL_SNAPSHOT, topRecommendations: [] };
    const questions = buildSuggestedQuestions(snap);
    expect(questions).toHaveLength(5);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// buildSystemPrompt() – legacy
// ─────────────────────────────────────────────────────────────────────────────

describe('buildSystemPrompt() legacy', () => {
  it('returns a non-empty string', () => {
    const result = buildSystemPrompt();
    expect(typeof result).toBe('string');
    expect(result.trim().length).toBeGreaterThan(100);
  });

  it('includes the AI Mentor persona (delegates to personalised builder)', () => {
    const result = buildSystemPrompt();
    expect(result).toMatch(/EntreSkill Hub AI Mentor/);
  });

  it('includes behaviour rules', () => {
    const result = buildSystemPrompt();
    expect(result).toMatch(/How you must respond/);
  });
});
