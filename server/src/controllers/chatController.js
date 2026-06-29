'use strict';
/**
 * chatController.js — Sprint 11
 * HTTP layer for direct messaging (REST-based, no WebSockets).
 */

const asyncHandler = require('express-async-handler');
const ChatService = require('../services/chatService');
const { sendSuccess } = require('../utils/responseHandler');

const getOrCreateConversation = asyncHandler(async (req, res) => {
  const convo = await ChatService.getOrCreateConversation(req.user._id, req.params.userId);
  sendSuccess(res, convo, 'Conversation ready');
});

const getConversations = asyncHandler(async (req, res) => {
  const convos = await ChatService.getConversations(req.user._id);
  sendSuccess(res, convos, 'Conversations retrieved');
});

const sendMessage = asyncHandler(async (req, res) => {
  const message = await ChatService.sendMessage(
    req.params.conversationId, req.user._id, req.body.content
  );
  sendSuccess(res, message, 'Message sent', 201);
});

const getMessages = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const data = await ChatService.getMessages(
    req.params.conversationId, req.user._id,
    { page: Number(page) || 1, limit: Number(limit) || 30 }
  );
  sendSuccess(res, data, 'Messages retrieved');
});

const getTotalUnread = asyncHandler(async (req, res) => {
  const total = await ChatService.getTotalUnread(req.user._id);
  sendSuccess(res, { unreadCount: total }, 'Unread count retrieved');
});

const deleteMessage = asyncHandler(async (req, res) => {
  const result = await ChatService.deleteMessage(req.params.messageId, req.user._id);
  sendSuccess(res, result, 'Message deleted');
});

module.exports = {
  getOrCreateConversation,
  getConversations,
  sendMessage,
  getMessages,
  getTotalUnread,
  deleteMessage,
};
