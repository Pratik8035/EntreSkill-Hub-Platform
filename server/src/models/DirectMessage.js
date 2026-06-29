'use strict';
const mongoose = require('mongoose');

// A conversation thread between two users (ordered by _id for canonical key)
const ConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  lastMessage:  { type: String, default: '' },
  lastMessageAt:{ type: Date, default: Date.now },
  unreadCount:  {
    type: Map,
    of: Number,
    default: {},   // { userId: unreadCount }
  },
}, { timestamps: true });

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

const DirectMessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  senderId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:        { type: String, required: true, trim: true, maxlength: 5000 },
  readBy:         [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isDeleted:      { type: Boolean, default: false },
}, { timestamps: true });

DirectMessageSchema.index({ conversationId: 1, createdAt: 1 });

const Conversation   = mongoose.model('Conversation',   ConversationSchema);
const DirectMessage  = mongoose.model('DirectMessage',  DirectMessageSchema);

module.exports = { Conversation, DirectMessage };
