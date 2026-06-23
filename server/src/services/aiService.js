const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const providerFactory = require('../providers/providerFactory');
const ContextService = require('./contextService');   // Phase 2
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');

/**
 * Service layer for AI Mentor Assistant chat functionality.
 *
 * Sprint 4 Phase 1 changes: proper messages[] array, env-var-driven limits.
 * Sprint 4 Phase 2 changes: ContextService integration, contextSnapshot cache.
 * Sprint 4 Phase 3 changes:
 *   - addMessageAndRespond() now calls buildPersonalizedSystemPrompt() instead
 *     of the legacy buildSystemPrompt(), passing session.contextSnapshot and
 *     the user object so every AI response is grounded in the user's real data.
 */
class AiService {
  /**
   * Create a new chat session for a given user.
   * After persisting the session, kicks off a background context build so the
   * snapshot is cached before the first message arrives.
   * The background build is fire-and-forget — it never blocks the response.
   *
   * @param {ObjectId} userId - Owner of the session.
   * @param {ObjectId} [businessIdeaId] - Associated business idea.
   * @param {string}   [title] - Custom title for the chat.
   * @returns {Promise<ChatSession>}
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
      businessIdeaId: businessIdeaId || undefined,
    });

    // ── Phase 2: fire-and-forget context snapshot build ───────────────────
    // We deliberately do NOT await this. The session is returned to the
    // caller immediately; the snapshot is written to MongoDB in the background.
    // If this fails it is logged and silently ignored — the snapshot will be
    // rebuilt on the first message instead.
    ContextService.buildUserContext(userId, businessIdeaId)
      .then((snapshot) =>
        ChatSession.findByIdAndUpdate(session._id, { contextSnapshot: snapshot })
      )
      .catch((err) =>
        console.error('[AiService] Background context build failed:', err.message)
      );

    return session;
  }

  /**
   * List all chat sessions for a given user (newest first).
   * @param {ObjectId} userId
   * @returns {Promise<ChatSession[]>}
   */
  static async listSessions(userId) {
    return await ChatSession.find({ userId }).sort({ updatedAt: -1 });
  }

  /**
   * Verify that a session exists and belongs to the requesting user.
   * Throws AppError(404 / 403) if the check fails.
   *
   * @param {string}   sessionId
   * @param {ObjectId} userId
   * @returns {Promise<ChatSession>} the validated session document
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
   * Add a user message to the session and return an AI response.
   *
   * Flow:
   *  1.  Verify ownership (throws on failure).
   *  2.  Persist the user's ChatMessage.
   *  3.  Load contextSnapshot — build + persist if absent (Phase 2).
   *  4.  Fetch the last CHAT_HISTORY_LIMIT messages to use as context.
   *  5.  Build a messages[] array in { role, content } format.
   *  6.  Append the current user message as the final turn.
   *  7.  Build personalised system prompt from contextSnapshot (Phase 3).
   *  8.  Call provider.generate({ systemPrompt, messages, maxTokens }).
   *  9.  Persist the AI's ChatMessage.
   *  10. Update session.lastMessage.
   *
   * @param {object}   params
   * @param {ObjectId} params.sessionId
   * @param {ObjectId} params.userId
   * @param {string}   params.content  - the user's message text
   * @param {object}   [params.user]   - req.user (name, profile.location) for prompt personalisation
   * @returns {Promise<{userMessage:ChatMessage, aiMessage:ChatMessage}>}
   */
  static async addMessageAndRespond({ sessionId, userId, content, user = null }) {
    // ── 1. Ownership check ───────────────────────────────────────────────
    const session = await this.verifyOwnership(sessionId, userId);

    // ── 2. Persist user message ──────────────────────────────────────────
    const userMsg = await ChatMessage.create({
      sessionId,
      role: 'user',
      content,
    });

    session.lastMessage = content;
    await session.save();

    // ── 3. Load or build contextSnapshot ────────────────────────────────
    if (!session.contextSnapshot) {
      try {
        const snapshot = await ContextService.buildUserContext(
          userId,
          session.businessIdeaId ?? null
        );
        session.contextSnapshot = snapshot;
        await session.save();
      } catch (ctxErr) {
        console.error('[AiService] On-demand context build failed:', ctxErr.message);
        // Continue with null snapshot — prompt builder degrades gracefully
      }
    }

    // ── 4. Fetch recent history for context ──────────────────────────────
    const historyLimit = parseInt(process.env.CHAT_HISTORY_LIMIT, 10) || 20;

    const recentMessages = await ChatMessage.find({ sessionId })
      .sort({ createdAt: 1 })
      .limit(historyLimit + 1)
      .lean();

    // Drop the message we just inserted — it is appended explicitly below
    const historyMessages = recentMessages
      .filter((m) => m._id.toString() !== userMsg._id.toString())
      .slice(-(historyLimit - 1));

    // ── 5 & 6. Build structured messages[] array ─────────────────────────
    const messages = [
      ...historyMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content }, // current turn — always last
    ];

    // ── 7. Build personalised system prompt (Phase 3) ────────────────────
    // buildPersonalizedSystemPrompt() never throws — all sections degrade
    // gracefully when context fields are null or missing.
    const promptBuilder = require('./promptBuilder');
    const systemPrompt = promptBuilder.buildPersonalizedSystemPrompt(
      session.contextSnapshot ?? null,
      user
    );

    // ── 8. Call AI provider ───────────────────────────────────────────────
    const provider = providerFactory.create();
    const maxTokens = parseInt(process.env.AI_MAX_TOKENS, 10) || 1500;

    const { content: aiContent, tokens } = await provider.generate({
      systemPrompt,
      messages,
      maxTokens,
    });

    // ── 9. Persist AI message ─────────────────────────────────────────────
    const aiMsg = await ChatMessage.create({
      sessionId,
      role: 'assistant',
      content: aiContent,
      tokens: tokens ?? undefined,
    });

    // ── 10. Update session's last message ─────────────────────────────────
    session.lastMessage = aiContent;
    await session.save();

    return { userMessage: userMsg, aiMessage: aiMsg };
  }

  /**
   * Retrieve paginated chat messages for a session (oldest first).
   *
   * @param {object} params
   * @param {ObjectId} params.sessionId
   * @param {number}   [params.page=1]
   * @param {number}   [params.limit=20]
   * @returns {Promise<{messages:ChatMessage[], total:number, page:number, limit:number}>}
   */
  static async getMessages({ sessionId, page = 1, limit = 20 }) {
    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      ChatMessage.find({ sessionId })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit),
      ChatMessage.countDocuments({ sessionId }),
    ]);
    return { messages, total, page, limit };
  }
}

module.exports = AiService;
