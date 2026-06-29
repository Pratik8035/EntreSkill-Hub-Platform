'use strict';
/**
 * Integration tests — Mentor Sessions API (Sprint 11)
 */

require('../setup');
const request = require('supertest');
const mongoose = require('mongoose');

process.env.NODE_ENV           = 'test';
process.env.JWT_SECRET         = 'test-jwt-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.JWT_ACCESS_EXPIRES = '15m';
process.env.JWT_REFRESH_EXPIRES= '7d';

const app          = require('../../app');
const MentorProfile = require('../../models/MentorProfile');

async function registerAndLogin(email, name = 'Test User') {
  const reg = await request(app).post('/api/auth/register').send({
    name, email: email || `ms_${Date.now()}@test.com`, password: 'password123',
  });
  expect(reg.status).toBe(201);
  const jwt    = require('jsonwebtoken');
  const { id } = jwt.verify(reg.body.data.token, process.env.JWT_SECRET);
  return { token: reg.body.data.token, userId: id };
}

const futureDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString();
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Mentor Sessions API (Sprint 11)', () => {
  let menteeToken, mentorToken, mentorId;

  beforeEach(async () => {
    const mentee = await registerAndLogin(`mentee_${Date.now()}@test.com`, 'Mentee');
    menteeToken  = mentee.token;

    const mentor = await registerAndLogin(`mentor_${Date.now()}@test.com`, 'Mentor');
    mentorToken  = mentor.token;
    mentorId     = mentor.userId;

    // Create a MentorProfile for the mentor user
    await MentorProfile.create({
      userId:     mentorId,
      expertise:  ['Business', 'Finance'],
      industries: ['Retail'],
      bio:        'Experienced mentor',
      hourlyRate: 1000,
    });
  });

  describe('POST /api/mentor-sessions', () => {
    it('books a session with valid data', async () => {
      const res = await request(app)
        .post('/api/mentor-sessions')
        .set('Authorization', `Bearer ${menteeToken}`)
        .send({
          mentorId:    mentorId,
          title:       'Marketing strategy session',
          scheduledAt: futureDate(),
          durationMin: 60,
        });
      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.title).toBe('Marketing strategy session');
    });

    it('returns 404 when mentor has no profile', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/api/mentor-sessions')
        .set('Authorization', `Bearer ${menteeToken}`)
        .send({ mentorId: fakeId, title: 'Test', scheduledAt: futureDate() });
      expect(res.status).toBe(404);
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/mentor-sessions')
        .send({ mentorId, title: 'Test', scheduledAt: futureDate() });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/mentor-sessions/upcoming', () => {
    it('returns upcoming sessions for the user', async () => {
      await request(app)
        .post('/api/mentor-sessions')
        .set('Authorization', `Bearer ${menteeToken}`)
        .send({ mentorId, title: 'Upcoming test', scheduledAt: futureDate() });

      const res = await request(app)
        .get('/api/mentor-sessions/upcoming')
        .set('Authorization', `Bearer ${menteeToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/mentor-sessions/completed', () => {
    it('returns empty array when no completed sessions', async () => {
      const res = await request(app)
        .get('/api/mentor-sessions/completed')
        .set('Authorization', `Bearer ${menteeToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('PATCH /api/mentor-sessions/:id/cancel', () => {
    it('cancels a session', async () => {
      const book = await request(app)
        .post('/api/mentor-sessions')
        .set('Authorization', `Bearer ${menteeToken}`)
        .send({ mentorId, title: 'Cancel test', scheduledAt: futureDate() });
      const sessionId = book.body.data._id;

      const res = await request(app)
        .patch(`/api/mentor-sessions/${sessionId}/cancel`)
        .set('Authorization', `Bearer ${menteeToken}`)
        .send({ reason: 'Conflict' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('cancelled');
    });
  });

  describe('PATCH /api/mentor-sessions/:id/confirm', () => {
    it('allows mentor to confirm a session', async () => {
      const book = await request(app)
        .post('/api/mentor-sessions')
        .set('Authorization', `Bearer ${menteeToken}`)
        .send({ mentorId, title: 'Confirm test', scheduledAt: futureDate() });
      const sessionId = book.body.data._id;

      const res = await request(app)
        .patch(`/api/mentor-sessions/${sessionId}/confirm`)
        .set('Authorization', `Bearer ${mentorToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('confirmed');
    });
  });

  describe('GET /api/mentor-sessions/:id', () => {
    it('returns a specific session for a participant', async () => {
      const book = await request(app)
        .post('/api/mentor-sessions')
        .set('Authorization', `Bearer ${menteeToken}`)
        .send({ mentorId, title: 'Get test', scheduledAt: futureDate() });
      const sessionId = book.body.data._id;

      const res = await request(app)
        .get(`/api/mentor-sessions/${sessionId}`)
        .set('Authorization', `Bearer ${menteeToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(sessionId);
    });
  });
});
