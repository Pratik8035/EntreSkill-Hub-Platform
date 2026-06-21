const asyncHandler = require('express-async-handler');
const AiService = require('../services/aiService');
const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const { objectId } = require('../validations/objectId');
const { z } = require('zod');
const AppError = require('../utils/AppError');

/**
 * Validation schemas
 */
const sessionIdSchema = z.object({ id: objectId() });
const createSessionSchema = z.object({
  businessIdeaId: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
});
const messageSchema = z.object({ content: z.string().min(1) });
const paginationSchema = z.object({ page: z.coerce.number().int().positive().default(1), limit: z.coerce.number().int().positive().max(100).default(20) });

// @desc Create a new AI chat session
// @route POST /api/ai/sessions
// @access Private
const createSession = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { businessIdeaId, title } = createSessionSchema.parse(req.body);
  const session = await AiService.createSession(userId, businessIdeaId, title);
  res.status(201).json({ success: true, data: session });
});

// @desc Get a session detail (basic info)
// @route GET /api/ai/sessions/:id
// @access Private
const getSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  sessionIdSchema.parse({ id });
  await AiService.verifyOwnership(id, req.user._id);
  const session = await ChatSession.findById(id);
  res.json({ success: true, data: session });
});

// @desc Delete a session and its messages
// @route DELETE /api/ai/sessions/:id
// @access Private
const deleteSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  sessionIdSchema.parse({ id });
  await AiService.verifyOwnership(id, req.user._id);
  await ChatMessage.deleteMany({ sessionId: id });
  await ChatSession.findByIdAndDelete(id);
  res.json({ success: true, message: 'Session deleted' });
});

// @desc Get paginated messages for a session
// @route GET /api/ai/sessions/:id/messages
// @access Private
const getMessages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  sessionIdSchema.parse({ id });
  const { page, limit } = paginationSchema.parse(req.query);
  await AiService.verifyOwnership(id, req.user._id);
  const result = await AiService.getMessages({ sessionId: id, page, limit });
  res.json({ success: true, data: result });
});

// @desc Add a user message and get AI response
// @route POST /api/ai/sessions/:id/message
// @access Private
const postMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  sessionIdSchema.parse({ id });
  const { content } = messageSchema.parse(req.body);
  await AiService.verifyOwnership(id, req.user._id);
  const { userMessage, aiMessage } = await AiService.addMessageAndRespond({ sessionId: id, userId: req.user._id, content });
  res.json({ success: true, data: { userMessage, aiMessage } });
});

// @desc Get all AI chat sessions for logged in user
// @route GET /api/ai/sessions
// @access Private
const getSessions = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const sessions = await AiService.listSessions(userId);
  res.json({ success: true, data: sessions });
});

module.exports = {
  createSession,
  getSession,
  deleteSession,
  getMessages,
  postMessage,
  getSessions,
};
