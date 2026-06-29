'use strict';
/**
 * chatRoutes.js — Sprint 11
 * Routes for direct messaging (REST-based conversations).
 */

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/chatController');

// GET  /api/chat/conversations              — list all conversations
// POST /api/chat/conversations/:userId      — get or create conversation with a user
router.get('/conversations',               protect, ctrl.getConversations);
router.post('/conversations/:userId',      protect, ctrl.getOrCreateConversation);

// GET    /api/chat/conversations/:conversationId/messages   — list messages
// POST   /api/chat/conversations/:conversationId/messages   — send message
router.get('/conversations/:conversationId/messages',  protect, ctrl.getMessages);
router.post('/conversations/:conversationId/messages', protect, ctrl.sendMessage);

// GET    /api/chat/unread                   — total unread count
router.get('/unread', protect, ctrl.getTotalUnread);

// DELETE /api/chat/messages/:messageId      — soft-delete a message
router.delete('/messages/:messageId', protect, ctrl.deleteMessage);

module.exports = router;
