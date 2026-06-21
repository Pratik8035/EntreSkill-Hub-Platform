const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const providerFactory = require('../providers/providerFactory');
const AppError = require('../utils/AppError');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

/**
 * Service layer for AI Mentor Assistant chat functionality.
 * Provides methods to create sessions, add user messages, retrieve history, and generate AI responses.
 */
class AiService {
  /**
   * Create a new chat session for a given user.
   * @param {ObjectId} userId - Owner of the session.
   * @param {ObjectId} [businessIdeaId] - Associated business idea.
   * @param {string} [title] - Custom title for the chat.
   * @returns {Promise<ChatSession>} the created session document.
   */
  static async createSession(userId, businessIdeaId = null, title = 'AI Mentor Chat') {
    let finalTitle = title;
    if (businessIdeaId && mongoose.isValidObjectId(businessIdeaId)) {
      const BusinessIdea = require('../models/BusinessIdea');
      const idea = await BusinessIdea.findById(businessIdeaId).lean();
      if (idea) {
        finalTitle = `AI Mentor: ${idea.name}`;
      }
    }
    const session = await ChatSession.create({ 
      userId, 
      title: finalTitle,
      businessIdeaId: businessIdeaId || undefined
    });
    return session;
  }

  /**
   * List all chat sessions for a given user.
   * @param {ObjectId} userId
   * @returns {Promise<ChatSession[]>}
   */
  static async listSessions(userId) {
    return await ChatSession.find({ userId }).sort({ updatedAt: -1 });
  }

  /**
   * Verify that a session exists and belongs to the user.
   * Throws AppError(404/403) if not valid.
   */
  static async verifyOwnership(sessionId, userId) {
    if (!mongoose.isValidObjectId(sessionId)) {
      throw new AppError('Invalid session ID', 400);
    }
    const session = await ChatSession.findById(sessionId);
    if (!session) {
      throw new AppError('Chat session not found', 404);
    }
    if (session.userId.toString() !== userId.toString()) {
      throw new AppError('Forbidden: session does not belong to user', 403);
    }
    return session;
  }

  /**
   * Add a user message and get AI response.
   * @param {ObjectId} sessionId
   * @param {ObjectId} userId
   * @param {string} content - user message content
   * @returns {Promise<{userMessage:ChatMessage, aiMessage:ChatMessage}>}
   */
  static async addMessageAndRespond({ sessionId, userId, content }) {
    // Verify ownership first
    const session = await this.verifyOwnership(sessionId, userId);

    // Store user message
    const userMsg = await ChatMessage.create({
      sessionId,
      role: 'user',
      content,
    });

    // Update lastMessage on session
    session.lastMessage = content;
    await session.save();

    // Fetch recent history for context (last 10 messages)
    const recent = await ChatMessage.find({ sessionId })
      .sort({ createdAt: 1 })
      .limit(10);

    const promptBuilder = require('../services/promptBuilder');
    const provider = providerFactory.create(); // selects based on env
    const systemPrompt = promptBuilder.buildSystemPrompt();
    const chatHistory = recent.map((msg) => ({ role: msg.role, content: msg.content }));
    // Append current user message
    chatHistory.push({ role: 'user', content });

    const { content: aiContent } = await provider.generate({
      systemPrompt,
      prompt: JSON.stringify(chatHistory), // simple serialization
    });

    const aiMsg = await ChatMessage.create({
      sessionId,
      role: 'assistant',
      content: aiContent,
    });

    // Update session's last message to be AI's response
    session.lastMessage = aiContent;
    await session.save();

    return { userMessage: userMsg, aiMessage: aiMsg };
  }

  /**
   * Retrieve paginated chat messages for a session.
   * @param {ObjectId} sessionId
   * @param {number} page - 1-indexed page number
   * @param {number} limit - items per page
   */
  static async getMessages({ sessionId, page = 1, limit = 20 }) {
    const skip = (page - 1) * limit;
    const messages = await ChatMessage.find({ sessionId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);
    const total = await ChatMessage.countDocuments({ sessionId });
    return { messages, total, page, limit };
  }
}

module.exports = AiService;
