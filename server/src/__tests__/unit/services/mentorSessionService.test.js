'use strict';
/**
 * Unit tests – mentorSessionService (Sprint 11)
 */

const mongoose = require('mongoose');
const MentorSessionService = require('../../../services/mentorSessionService');
const MentorSession        = require('../../../models/MentorSession');
const MentorProfile        = require('../../../models/MentorProfile');
const User                 = require('../../../models/User');

const makeUser = async (email) => User.create({
  name: 'Test', email: email || `u_${Date.now()}@x.com`, password: 'password123', role: 'user',
});

const makeProfile = async (userId) => MentorProfile.create({
  userId,
  expertise:  ['Business'],
  industries: ['Retail'],
  bio:         'Test mentor',
  hourlyRate:  500,
});

const futureDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString();
};

// ─── bookSession ─────────────────────────────────────────────────────────────

describe('MentorSessionService.bookSession()', () => {
  it('books a session when mentor profile exists', async () => {
    const mentor = await makeUser(`mentor_${Date.now()}@x.com`);
    const mentee = await makeUser(`mentee_${Date.now()}@x.com`);
    await makeProfile(mentor._id);

    const session = await MentorSessionService.bookSession(mentee._id, {
      mentorId:    mentor._id,
      title:       'Marketing advice',
      scheduledAt: futureDate(),
      durationMin: 60,
    });

    expect(session._id).toBeDefined();
    expect(session.status).toBe('pending');
    expect(session.menteeId.toString()).toBe(mentee._id.toString());
  });

  it('throws 404 when mentor profile does not exist', async () => {
    const mentee = await makeUser(`mentee2_${Date.now()}@x.com`);
    const fakeId = new mongoose.Types.ObjectId();

    await expect(
      MentorSessionService.bookSession(mentee._id, {
        mentorId: fakeId, title: 'X', scheduledAt: futureDate(),
      })
    ).rejects.toThrow('Mentor not found');
  });

  it('throws 400 when required fields are missing', async () => {
    const mentee = await makeUser(`mentee3_${Date.now()}@x.com`);
    await expect(
      MentorSessionService.bookSession(mentee._id, { title: 'No mentor' })
    ).rejects.toThrow('mentorId is required');
  });
});

// ─── cancelSession ────────────────────────────────────────────────────────────

describe('MentorSessionService.cancelSession()', () => {
  it('cancels a pending session', async () => {
    const mentor = await makeUser(`m1_${Date.now()}@x.com`);
    const mentee = await makeUser(`m2_${Date.now()}@x.com`);
    await makeProfile(mentor._id);
    const session = await MentorSessionService.bookSession(mentee._id, {
      mentorId: mentor._id, title: 'Cancel test', scheduledAt: futureDate(),
    });

    const cancelled = await MentorSessionService.cancelSession(session._id, mentee._id, 'Not available');
    expect(cancelled.status).toBe('cancelled');
    expect(cancelled.cancelReason).toBe('Not available');
  });

  it('throws 403 when unrelated user tries to cancel', async () => {
    const mentor  = await makeUser(`m3_${Date.now()}@x.com`);
    const mentee  = await makeUser(`m4_${Date.now()}@x.com`);
    const stranger = await makeUser(`m5_${Date.now()}@x.com`);
    await makeProfile(mentor._id);
    const session = await MentorSessionService.bookSession(mentee._id, {
      mentorId: mentor._id, title: 'Access test', scheduledAt: futureDate(),
    });

    await expect(
      MentorSessionService.cancelSession(session._id, stranger._id)
    ).rejects.toThrow('Not authorised');
  });
});

// ─── confirmSession ───────────────────────────────────────────────────────────

describe('MentorSessionService.confirmSession()', () => {
  it('confirms a pending session as mentor', async () => {
    const mentor = await makeUser(`mentor_c_${Date.now()}@x.com`);
    const mentee = await makeUser(`mentee_c_${Date.now()}@x.com`);
    await makeProfile(mentor._id);
    const session = await MentorSessionService.bookSession(mentee._id, {
      mentorId: mentor._id, title: 'Confirm test', scheduledAt: futureDate(),
    });
    const confirmed = await MentorSessionService.confirmSession(session._id, mentor._id);
    expect(confirmed.status).toBe('confirmed');
  });
});

// ─── getUpcomingSessions ─────────────────────────────────────────────────────

describe('MentorSessionService.getUpcomingSessions()', () => {
  it('returns upcoming sessions for a user', async () => {
    const mentor = await makeUser(`mentor_up_${Date.now()}@x.com`);
    const mentee = await makeUser(`mentee_up_${Date.now()}@x.com`);
    await makeProfile(mentor._id);
    await MentorSessionService.bookSession(mentee._id, {
      mentorId: mentor._id, title: 'Upcoming session', scheduledAt: futureDate(),
    });
    const sessions = await MentorSessionService.getUpcomingSessions(mentee._id);
    expect(sessions.length).toBeGreaterThanOrEqual(1);
  });
});
