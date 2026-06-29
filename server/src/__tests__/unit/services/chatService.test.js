'use strict';
/**
 * Unit tests – chatService (Sprint 11)
 */

const mongoose = require('mongoose');
const ChatService = require('../../../services/chatService');
const { Conversation, DirectMessage } = require('../../../models/DirectMessage');
const User = require('../../../models/User');

const makeUser = async (email) => User.create({
  name: 'Chat User', email: email || `cu_${Date.now()}@x.com`, password: 'password123', role: 'user',
});

// ─── getOrCreateConversation ─────────────────────────────────────────────────

describe('ChatService.getOrCreateConversation()', () => {
  it('creates a new conversation between two users', async () => {
    const a = await makeUser(`a1_${Date.now()}@x.com`);
    const b = await makeUser(`b1_${Date.now()}@x.com`);
    const convo = await ChatService.getOrCreateConversation(a._id, b._id);
    expect(convo._id).toBeDefined();
    expect(convo.participants.map(p => p.toString())).toContain(a._id.toString());
    expect(convo.participants.map(p => p.toString())).toContain(b._id.toString());
  });

  it('returns existing conversation on second call', async () => {
    const a = await makeUser(`a2_${Date.now()}@x.com`);
    const b = await makeUser(`b2_${Date.now()}@x.com`);
    const c1 = await ChatService.getOrCreateConversation(a._id, b._id);
    const c2 = await ChatService.getOrCreateConversation(a._id, b._id);
    expect(c1._id.toString()).toBe(c2._id.toString());
  });

  it('throws 400 when user tries to message themselves', async () => {
    const a = await makeUser(`self_${Date.now()}@x.com`);
    await expect(
      ChatService.getOrCreateConversation(a._id, a._id)
    ).rejects.toThrow('Cannot start a conversation with yourself');
  });

  it('throws 404 when target user does not exist', async () => {
    const a = await makeUser(`a3_${Date.now()}@x.com`);
    await expect(
      ChatService.getOrCreateConversation(a._id, new mongoose.Types.ObjectId())
    ).rejects.toThrow('User not found');
  });
});

// ─── sendMessage ─────────────────────────────────────────────────────────────

describe('ChatService.sendMessage()', () => {
  it('sends a message and updates conversation summary', async () => {
    const a = await makeUser(`sa1_${Date.now()}@x.com`);
    const b = await makeUser(`sa2_${Date.now()}@x.com`);
    const convo = await ChatService.getOrCreateConversation(a._id, b._id);

    const msg = await ChatService.sendMessage(convo._id, a._id, 'Hello there!');
    expect(msg._id).toBeDefined();
    expect(msg.content).toBe('Hello there!');
    expect(msg.senderId.toString()).toBe(a._id.toString());

    const updated = await Conversation.findById(convo._id);
    expect(updated.lastMessage).toBe('Hello there!');
  });

  it('throws 400 for empty message content', async () => {
    const a = await makeUser(`sb1_${Date.now()}@x.com`);
    const b = await makeUser(`sb2_${Date.now()}@x.com`);
    const convo = await ChatService.getOrCreateConversation(a._id, b._id);
    await expect(
      ChatService.sendMessage(convo._id, a._id, '   ')
    ).rejects.toThrow('Message content is required');
  });

  it('throws 403 when non-participant tries to send', async () => {
    const a       = await makeUser(`sc1_${Date.now()}@x.com`);
    const b       = await makeUser(`sc2_${Date.now()}@x.com`);
    const intruder = await makeUser(`sc3_${Date.now()}@x.com`);
    const convo = await ChatService.getOrCreateConversation(a._id, b._id);
    await expect(
      ChatService.sendMessage(convo._id, intruder._id, 'Intruder!')
    ).rejects.toThrow('Not a participant');
  });
});

// ─── getMessages ─────────────────────────────────────────────────────────────

describe('ChatService.getMessages()', () => {
  it('returns paginated messages and marks them as read', async () => {
    const a = await makeUser(`gm1_${Date.now()}@x.com`);
    const b = await makeUser(`gm2_${Date.now()}@x.com`);
    const convo = await ChatService.getOrCreateConversation(a._id, b._id);
    await ChatService.sendMessage(convo._id, a._id, 'Msg 1');
    await ChatService.sendMessage(convo._id, a._id, 'Msg 2');

    const result = await ChatService.getMessages(convo._id, b._id);
    expect(result.messages.length).toBeGreaterThanOrEqual(2);
    expect(result.total).toBeGreaterThanOrEqual(2);
  });
});

// ─── getTotalUnread ───────────────────────────────────────────────────────────

describe('ChatService.getTotalUnread()', () => {
  it('returns 0 when user has no unread messages', async () => {
    const a = await makeUser(`unread_${Date.now()}@x.com`);
    const count = await ChatService.getTotalUnread(a._id);
    expect(count).toBe(0);
  });
});

// ─── deleteMessage ────────────────────────────────────────────────────────────

describe('ChatService.deleteMessage()', () => {
  it('soft-deletes own message', async () => {
    const a = await makeUser(`del1_${Date.now()}@x.com`);
    const b = await makeUser(`del2_${Date.now()}@x.com`);
    const convo = await ChatService.getOrCreateConversation(a._id, b._id);
    const msg   = await ChatService.sendMessage(convo._id, a._id, 'Delete me');

    const result = await ChatService.deleteMessage(msg._id, a._id);
    expect(result.deleted).toBe(true);

    const found = await DirectMessage.findById(msg._id);
    expect(found.isDeleted).toBe(true);
    expect(found.content).toBe('[deleted]');
  });

  it('throws 403 when non-sender tries to delete', async () => {
    const a = await makeUser(`del3_${Date.now()}@x.com`);
    const b = await makeUser(`del4_${Date.now()}@x.com`);
    const convo = await ChatService.getOrCreateConversation(a._id, b._id);
    const msg   = await ChatService.sendMessage(convo._id, a._id, 'Not your message');

    await expect(
      ChatService.deleteMessage(msg._id, b._id)
    ).rejects.toThrow('Not authorised');
  });
});
