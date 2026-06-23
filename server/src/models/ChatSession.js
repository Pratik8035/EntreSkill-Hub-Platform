const mongoose = require('mongoose');

/**
 * contextSnapshot – lightweight embedded document that caches the assembled
 * user context produced by ContextService.buildUserContext().
 *
 * Purpose:  Avoid re-running ~8 DB queries on every message in the same
 *           session. Built once when the session is created (or on the first
 *           message if missing), then reused for the session's lifetime.
 *
 * Sprint 4 Phase 2 addition.
 * The snapshot is intentionally denormalised (plain strings/numbers) so it
 * never needs a populate() call when it is read back.
 */
const contextSnapshotSchema = new mongoose.Schema({
  // ── User profile ──────────────────────────────────────────────────────
  experienceLevel:  { type: String },   // 'Beginner' | 'Intermediate' | 'Experienced'
  assessmentScore:  { type: Number },
  isAssessmentDone: { type: Boolean },

  // ── Skills & interests (populated names, not IDs) ─────────────────────
  skills: [
    {
      name:        { type: String },
      proficiency: { type: String }, // 'Beginner' | 'Intermediate' | 'Advanced'
    },
  ],
  interests: [
    {
      name:   { type: String },
      weight: { type: Number }, // 1–5
    },
  ],

  // ── Business idea (linked to session) ────────────────────────────────
  businessIdeaName:     { type: String },
  businessIdeaCategory: { type: String },
  startupCostRange:     { type: String },
  difficultyLevel:      { type: String },

  // ── Roadmap ───────────────────────────────────────────────────────────
  roadmapTimeline:    { type: String },
  milestoneCount:     { type: Number },
  missingSkillNames:  [{ type: String }], // plain names for prompt injection

  // ── Business plan ─────────────────────────────────────────────────────
  riskScore:          { type: String },   // 'Low' | 'Medium' | 'High'
  executiveSummary:   { type: String },   // first 250 chars only

  // ── Top recommendations (names + scores only) ─────────────────────────
  topRecommendations: [
    {
      name:       { type: String },
      matchScore: { type: Number },
    },
  ],

  // ── Top mentor matches (expertise + industries) ───────────────────────
  topMentors: [
    {
      expertise:  [{ type: String }],
      industries: [{ type: String }],
      matchScore: { type: Number },
    },
  ],

  // ── Learning resources (title + type only) ────────────────────────────
  resources: [
    {
      title: { type: String },
      type:  { type: String }, // 'Article' | 'Video' | 'Course'
      url:   { type: String },
    },
  ],

  // Timestamp so callers can decide whether to refresh a stale snapshot
  builtAt: { type: Date, default: Date.now },
}, { _id: false }); // embedded doc – no separate _id needed

const ChatSessionSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:           { type: String, required: true },
  businessIdeaId:  { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessIdea' },
  lastMessage:     { type: String },
  contextSnapshot: { type: contextSnapshotSchema, default: null }, // Phase 2
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', ChatSessionSchema);
