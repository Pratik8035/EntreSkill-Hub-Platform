'use strict';
/**
 * chatService.js — Sprint 11 Phase 7
 * REST-based private messaging (no WebSockets).
 * Uses Conversation + DirectMessage models.
 */

const { Conversation, DirectMessage } = require('../models/DirectMessage');
const User      = require('../models/User');
const AppError  = require('../utils/AppError');

class ChatService {

  // ── Get or create a conversation between two users ────────────────────────
  static async getOrCreateConversation(userAId, userBId) {
    if (userAId.toString() === userBId.toString()) {
      throw new AppError('Cannot start a conversation with yourself', 400);
    }
    const target = await User.findById(userBId);
    if (!target) throw new AppError('User not found', 404);

    // Look for existing conversation (participant order-independent)
    let convo = await Conversation.findOne({
      participants: { $all: [userAId, userBId], $size: 2 },
    });

    if (!convo) {
      convo = await Conversation.create({
        participants:  [userAId, userBId],
        lastMessage:   '',
        lastMessageAt: new Date(),
        unreadCount:   { [userAId.toString()]: 0, [userBId.toString()]: 0 },
      });
    }
    return convo;
  }

  // ── List all conversations for a user ─────────────────────────────────────
  static async getConversations(userId) {
    const convos = await Conversation.find({ participants: userId })
      .sort({ lastMessageAt: -1 })
      .populate('participants', 'name email role')
      .lean();

    return convos.map(c => ({
      ...c,
      unreadCount: c.unreadCount?.[userId.toString()] || 0,
      otherParticipant: c.participants.find(p => p._id.toString() !== userId.toString()),
    }));
  }

  // ── Send a message ─────────────────────────────────────────────────────────
  static async sendMessage(conversationId, senderId, content) {
    if (!content || !content.trim()) throw new AppError('Message content is required', 400);

    const convo = await Conversation.findById(conversationId);
    if (!convo) throw new AppError('Conversation not found', 404);

    const isMember = convo.participants.some(p => p.toString() === senderId.toString());
    if (!isMember) throw new AppError('Not a participant of this conversation', 403);

    const message = await DirectMessage.create({
      conversationId,
      senderId,
      content: content.trim(),
      readBy:  [senderId],
    });

    // Update conversation summary and increment unread for other participants
    const updates = { lastMessage: content.trim(), lastMessageAt: new Date() };
    const unreadUpdates = {};
    convo.participants.forEach(p => {
      if (p.toString() !== senderId.toString()) {
        const key = `unreadCount.${p.toString()}`;
        unreadUpdates[key] = (convo.unreadCount?.get(p.toString()) || 0) + 1;
      }
    });

    await Conversation.findByIdAndUpdate(conversationId, { ...updates, ...unreadUpdates });
    return message;
  }

  // ── Get messages in a conversation (paginated) ────────────────────────────
  static async getMessages(conversationId, userId, { page = 1, limit = 30 } = {}) {
    const convo = await Conversation.findById(conversationId);
    if (!convo) throw new AppError('Conversation not found', 404);

    const isMember = convo.participants.some(p => p.toString() === userId.toString());
    if (!isMember) throw new AppError('Not a participant', 403);

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await DirectMessage.countDocuments({ conversationId, isDeleted: false });
    const messages = await DirectMessage.find({ conversationId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('senderId', 'name role')
      .lean();

    // Mark all messages as read for this user
    await DirectMessage.updateMany(
      { conversationId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );
    // Reset unread count
    await Conversation.findByIdAndUpdate(conversationId, {
      [`unreadCount.${userId.toString()}`]: 0,
    });

    return { messages: messages.reverse(), total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
  }

  // ── Get unread count across all conversations ─────────────────────────────
  static async getTotalUnread(userId) {
    const convos = await Conversation.find({ participants: userId }).lean();
    let total = 0;
    convos.forEach(c => {
      total += c.unreadCount?.[userId.toString()] || 0;
    });
    return total;
  }

  // ── Delete a message (soft delete) ────────────────────────────────────────
  static async deleteMessage(messageId, userId) {
    const msg = await DirectMessage.findById(messageId);
    if (!msg || msg.isDeleted) throw new AppError('Message not found', 404);
    if (msg.senderId.toString() !== userId.toString()) throw new AppError('Not authorised', 403);
    msg.isDeleted = true;
    msg.content   = '[deleted]';
    await msg.save();
    return { deleted: true };
  }
}

module.exports = ChatService;
