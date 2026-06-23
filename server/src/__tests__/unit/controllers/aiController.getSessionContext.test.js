/**
 * Unit tests – aiController.getSessionContext (Sprint 4 Phase 4)
 *
 * Uses plain req/res mock objects — no external dependencies required.
 * asyncHandler is unwrapped manually so we can await the handler directly.
 *
 * Tests:
 *   200  returns cached snapshot when session.contextSnapshot exists
 *   200  builds + persists + returns snapshot when contextSnapshot is null
 *   404  session not found  (AppError propagated via next())
 *   403  session belongs to a different user (AppError propagated via next())
 *   400  invalid ObjectId format for :id param (Zod error via next())
 *   200  ContextService returns empty snapshot — no crash
 *   -    verifyOwnership called with correct args
 *   -    response contains all expected top-level snapshot keys
 */

'use strict';

// ── Mock service / model layer ────────────────────────────────────────────────
jest.mock('../../../services/aiService');
jest.mock('../../../services/contextService');
jest.mock('../../../models/ChatSession');

const AiService      = require('../../../services/aiService');
const ContextService = require('../../../services/contextService');
const ChatSession    = require('../../../models/ChatSession');
const AppError       = require('../../../utils/AppError');
const mongoose       = require('mongoose');

// ── Require controller AFTER mocks are registered ────────────────────────────
// We pull the raw handler out of the asyncHandler wrapper by importing the
// module and calling the handler directly. asyncHandler wraps it in a
// try/catch that calls next(err) on rejection — we replicate that here.
const aiControllerModule = require('../../../controllers/aiController');

// ── Helper: call an asyncHandler-wrapped controller in tests ─────────────────
async function callHandler(handler, req) {
  const res = {
    statusCode: 200,
    _body: null,
    status(code) { this.statusCode = code; return this; },
    json(body)   { this._body = body; return this; },
  };
  const next = jest.fn();
  try {
    await handler(req, res, next);
  } catch (err) {
    // asyncHandler catches synchronous throws and calls next(err)
    next(err);
  }
  return { res, next };
}

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────
const OWNER_ID   = new mongoose.Types.ObjectId();
const OTHER_ID   = new mongoose.Types.ObjectId();
const SESSION_ID = new mongoose.Types.ObjectId().toString();

const MOCK_SNAPSHOT = {
  experienceLevel:      'Intermediate',
  assessmentScore:      72,
  isAssessmentDone:     true,
  skills:               [{ name: 'Tailoring', proficiency: 'Advanced' }],
  interests:            [{ name: 'Fashion', weight: 5 }],
  businessIdeaName:     'Tailoring Business',
  businessIdeaCategory: 'Textile',
  startupCostRange:     '₹10,000–₹25,000',
  difficultyLevel:      'Beginner',
  roadmapTimeline:      '3 months',
  milestoneCount:       4,
  missingSkillNames:    ['GST Filing'],
  riskScore:            'Low',
  executiveSummary:     'A tailoring business for rural women.',
  topRecommendations:   [{ name: 'Tailoring Business', matchScore: 88 }],
  topMentors:           [{ expertise: ['Business'], industries: ['Retail'], matchScore: 80 }],
  resources:            [{ title: 'GST for Small Business', type: 'Article', url: 'https://ex.com' }],
  builtAt:              new Date(),
};

const MOCK_EMPTY_SNAPSHOT = {
  experienceLevel: 'Beginner', assessmentScore: 0, isAssessmentDone: false,
  skills: [], interests: [], businessIdeaName: null,
  topRecommendations: [], topMentors: [], resources: [], builtAt: new Date(),
};

function makeReq(sessionId = SESSION_ID, userId = OWNER_ID) {
  return {
    params: { id: sessionId },
    user:   { _id: userId },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────
describe('aiController.getSessionContext', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    ChatSession.findByIdAndUpdate = jest.fn().mockResolvedValue({});
  });

  // ── 200 cached snapshot ───────────────────────────────────────────────────
  it('returns 200 with cached contextSnapshot when it exists', async () => {
    AiService.verifyOwnership.mockResolvedValueOnce({
      _id: SESSION_ID, userId: OWNER_ID,
      businessIdeaId: null,
      contextSnapshot: MOCK_SNAPSHOT,
    });

    const { res, next } = await callHandler(
      aiControllerModule.getSessionContext,
      makeReq()
    );

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res._body.success).toBe(true);
    expect(res._body.data.experienceLevel).toBe('Intermediate');
    expect(res._body.data.skills[0].name).toBe('Tailoring');
    // ContextService must NOT be called when cache is warm
    expect(ContextService.buildUserContext).not.toHaveBeenCalled();
  });

  // ── 200 build on-demand ───────────────────────────────────────────────────
  it('builds, persists and returns snapshot when contextSnapshot is null', async () => {
    const ideaId = new mongoose.Types.ObjectId();
    AiService.verifyOwnership.mockResolvedValueOnce({
      _id: SESSION_ID, userId: OWNER_ID,
      businessIdeaId: ideaId,
      contextSnapshot: null,
    });
    ContextService.buildUserContext.mockResolvedValueOnce(MOCK_SNAPSHOT);

    const { res, next } = await callHandler(
      aiControllerModule.getSessionContext,
      makeReq()
    );

    expect(next).not.toHaveBeenCalled();
    // ContextService called with correct args
    expect(ContextService.buildUserContext).toHaveBeenCalledWith(OWNER_ID, ideaId);
    // Snapshot persisted to DB
    expect(ChatSession.findByIdAndUpdate).toHaveBeenCalledWith(
      SESSION_ID,
      { contextSnapshot: MOCK_SNAPSHOT }
    );
    expect(res.statusCode).toBe(200);
    expect(res._body.data.businessIdeaName).toBe('Tailoring Business');
  });

  // ── 404 session not found ─────────────────────────────────────────────────
  it('propagates AppError 404 when session does not exist', async () => {
    AiService.verifyOwnership.mockRejectedValueOnce(
      new AppError('Chat session not found', 404)
    );

    const { res, next } = await callHandler(
      aiControllerModule.getSessionContext,
      makeReq()
    );

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(404);
    expect(err.message).toMatch(/not found/i);
  });

  // ── 403 wrong user ────────────────────────────────────────────────────────
  it('propagates AppError 403 when session belongs to a different user', async () => {
    AiService.verifyOwnership.mockRejectedValueOnce(
      new AppError('Forbidden: session does not belong to user', 403)
    );

    const { res, next } = await callHandler(
      aiControllerModule.getSessionContext,
      makeReq(SESSION_ID, OTHER_ID)
    );

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
    expect(err.message).toMatch(/Forbidden/i);
    // verifyOwnership is what enforces auth — it must have been called
    expect(AiService.verifyOwnership).toHaveBeenCalledWith(
      SESSION_ID,
      OTHER_ID
    );
  });

  // ── 400 invalid ObjectId ──────────────────────────────────────────────────
  it('passes Zod validation error to next() for a non-ObjectId :id param', async () => {
    const { res, next } = await callHandler(
      aiControllerModule.getSessionContext,
      makeReq('not-a-valid-objectid')
    );

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeTruthy(); // some error was passed
    // verifyOwnership must NOT be called with a bad id
    expect(AiService.verifyOwnership).not.toHaveBeenCalled();
  });

  // ── 200 empty snapshot (context build returns safe defaults) ──────────────
  it('returns 200 with safe empty snapshot when ContextService returns empty context', async () => {
    AiService.verifyOwnership.mockResolvedValueOnce({
      _id: SESSION_ID, userId: OWNER_ID,
      businessIdeaId: null,
      contextSnapshot: null,
    });
    ContextService.buildUserContext.mockResolvedValueOnce(MOCK_EMPTY_SNAPSHOT);

    const { res, next } = await callHandler(
      aiControllerModule.getSessionContext,
      makeReq()
    );

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res._body.success).toBe(true);
    expect(res._body.data.skills).toEqual([]);
    expect(res._body.data.topRecommendations).toEqual([]);
  });

  // ── verifyOwnership args ──────────────────────────────────────────────────
  it('calls AiService.verifyOwnership with the correct sessionId and userId', async () => {
    AiService.verifyOwnership.mockResolvedValueOnce({
      _id: SESSION_ID, userId: OWNER_ID, contextSnapshot: MOCK_SNAPSHOT,
    });

    await callHandler(aiControllerModule.getSessionContext, makeReq());

    expect(AiService.verifyOwnership).toHaveBeenCalledWith(SESSION_ID, OWNER_ID);
  });

  // ── response shape ────────────────────────────────────────────────────────
  it('response data contains all expected top-level context keys', async () => {
    AiService.verifyOwnership.mockResolvedValueOnce({
      _id: SESSION_ID, userId: OWNER_ID, contextSnapshot: MOCK_SNAPSHOT,
    });

    const { res } = await callHandler(
      aiControllerModule.getSessionContext,
      makeReq()
    );

    const data = res._body.data;
    const expectedKeys = [
      'experienceLevel', 'assessmentScore', 'isAssessmentDone',
      'skills', 'interests',
      'businessIdeaName', 'businessIdeaCategory', 'startupCostRange',
      'roadmapTimeline', 'milestoneCount', 'missingSkillNames',
      'riskScore', 'topRecommendations', 'topMentors', 'resources',
    ];
    expectedKeys.forEach(key => {
      expect(data).toHaveProperty(key);
    });
  });

});
