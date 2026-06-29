'use strict';
/**
 * Integration tests — Chat / Direct Messaging API (Sprint 11)
 */

require('../setup');
const request = require('supertest');

process.env.NODE_ENV           = 'test';
process.env.JWT_SECRET         = 'test-jwt-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.JWT_ACCESS_EXPIRES = '15m';
process.env.JWT_REFRESH_EXPIRES= '7d';

const app = require('../../app');

async function registerAndLogin(email, name = 'Chat Test User') {
  const reg = await request(app).post('/api/auth/register').send({
    name, email: email || `chat_${Date.now()}@test.com`, password: 'password123',
  });
  expect(reg.status).toBe(201);
  const jwt    = require('jsonwebtoken');
  const { id } = jwt.verify(reg.body.data.token, process.env.JWT_SECRET);
  return { token: reg.body.data.token, userId: id };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Chat / Direct Messaging API (Sprint 11)', () => {
  let tokenA, userAId, tokenB, userBId;

  beforeEach(async () => {
    const userA = await registerAndLogin(`chatA_${Date.now()}@test.com`, 'Chat A');
    tokenA = userA.token;
    userAId = userA.userId;

    const userB = await registerAndLogin(`chatB_${Date.now()}@test.com`, 'Chat B');
    tokenB = userB.token;
    userBId = userB.userId;
  });

  // ── GET /api/chat/conversations ─────────────────────────────────────────

  describe('GET /api/chat/conversations', () => {
    it('returns empty array when no conversations', async () => {
      const res = await request(app)
        .get('/api/chat/conversations')
        .set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/chat/conversations');
      expect(res.status).toBe(401);
    });
  });

  // ── POST /api/chat/conversations/:userId ────────────────────────────────

  describe('POST /api/chat/conversations/:userId', () => {
    it('creates a new conversation', async () => {
      const res = await request(app)
        .post(`/api/chat/conversations/${userBId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(200);
      expect(res.body.data._id).toBeDefined();
    });

    it('returns the same conversation on second call', async () => {
      const res1 = await request(app)
        .post(`/api/chat/conversations/${userBId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      const res2 = await request(app)
        .post(`/api/chat/conversations/${userBId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(res1.body.data._id).toBe(res2.body.data._id);
    });

    it('returns 400 when trying to message yourself', async () => {
      const res = await request(app)
        .post(`/api/chat/conversations/${userAId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(400);
    });
  });

  // ── POST /api/chat/conversations/:conversationId/messages ───────────────

  describe('POST /api/chat/conversations/:conversationId/messages', () => {
    it('sends a message', async () => {
      const convoRes = await request(app)
        .post(`/api/chat/conversations/${userBId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      const convoId = convoRes.body.data._id;

      const res = await request(app)
        .post(`/api/chat/conversations/${convoId}/messages`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ content: 'Hello there!' });
      expect(res.status).toBe(201);
      expect(res.body.data.content).toBe('Hello there!');
    });

    it('returns 400 for empty message', async () => {
      const convoRes = await request(app)
        .post(`/api/chat/conversations/${userBId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      const convoId = convoRes.body.data._id;

      const res = await request(app)
        .post(`/api/chat/conversations/${convoId}/messages`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ content: '' });
      expect(res.status).toBe(400);
    });
  });

  // ── GET /api/chat/conversations/:conversationId/messages ────────────────

  describe('GET /api/chat/conversations/:conversationId/messages', () => {
    it('returns messages for a conversation participant', async () => {
      const convoRes = await request(app)
        .post(`/api/chat/conversations/${userBId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      const convoId = convoRes.body.data._id;

      await request(app)
        .post(`/api/chat/conversations/${convoId}/messages`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ content: 'Test message' });

      const res = await request(app)
        .get(`/api/chat/conversations/${convoId}/messages`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.messages)).toBe(true);
      expect(res.body.data.messages.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ── GET /api/chat/unread ─────────────────────────────────────────────────

  describe('GET /api/chat/unread', () => {
    it('returns unread count', async () => {
      const res = await request(app)
        .get('/api/chat/unread')
        .set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(200);
      expect(typeof res.body.data.unreadCount).toBe('number');
    });
  });

  // ── DELETE /api/chat/messages/:messageId ─────────────────────────────────

  describe('DELETE /api/chat/messages/:messageId', () => {
    it('soft-deletes own message', async () => {
      const convoRes = await request(app)
        .post(`/api/chat/conversations/${userBId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      const convoId = convoRes.body.data._id;

      const msgRes = await request(app)
        .post(`/api/chat/conversations/${convoId}/messages`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ content: 'Delete this' });
      const msgId = msgRes.body.data._id;

      const res = await request(app)
        .delete(`/api/chat/messages/${msgId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(200);
      expect(res.body.data.deleted).toBe(true);
    });

    it('returns 403 when non-sender tries to delete', async () => {
      const convoRes = await request(app)
        .post(`/api/chat/conversations/${userBId}`)
        .set('Authorization', `Bearer ${tokenA}`);
      const convoId = convoRes.body.data._id;

      const msgRes = await request(app)
        .post(`/api/chat/conversations/${convoId}/messages`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ content: "A's message" });
      const msgId = msgRes.body.data._id;

      const res = await request(app)
        .delete(`/api/chat/messages/${msgId}`)
        .set('Authorization', `Bearer ${tokenB}`);
      expect(res.status).toBe(403);
    });
  });
});
