'use strict';
/**
 * mentorSessionService.js — Sprint 11 Phase 5
 * Mentor session booking, cancellation, listing logic.
 */

const MentorSession  = require('../models/MentorSession');
const MentorProfile  = require('../models/MentorProfile');
const AppError       = require('../utils/AppError');

class MentorSessionService {

  static async bookSession(menteeId, data) {
    const { mentorId, title, description, scheduledAt, durationMin, meetingLink } = data;

    if (!mentorId) throw new AppError('mentorId is required', 400);
    if (!title)    throw new AppError('title is required', 400);
    if (!scheduledAt) throw new AppError('scheduledAt is required', 400);

    const mentorProfile = await MentorProfile.findOne({ userId: mentorId });
    if (!mentorProfile) throw new AppError('Mentor not found', 404);

    const session = await MentorSession.create({
      mentorId,
      menteeId,
      title,
      description: description || '',
      scheduledAt: new Date(scheduledAt),
      durationMin: durationMin || 60,
      meetingLink: meetingLink || '',
      status: 'pending',
    });
    return session;
  }

  static async cancelSession(sessionId, userId, reason = '') {
    const session = await MentorSession.findById(sessionId);
    if (!session) throw new AppError('Session not found', 404);

    const isMentor  = session.mentorId.toString() === userId.toString();
    const isMentee  = session.menteeId.toString() === userId.toString();
    if (!isMentor && !isMentee) throw new AppError('Not authorised', 403);

    if (session.status === 'completed') throw new AppError('Cannot cancel a completed session', 400);
    if (session.status === 'cancelled') throw new AppError('Session is already cancelled', 400);

    session.status       = 'cancelled';
    session.cancelReason = reason;
    await session.save();
    return session;
  }

  static async confirmSession(sessionId, mentorId) {
    const session = await MentorSession.findById(sessionId);
    if (!session) throw new AppError('Session not found', 404);
    if (session.mentorId.toString() !== mentorId.toString()) throw new AppError('Not authorised', 403);
    session.status = 'confirmed';
    await session.save();
    return session;
  }

  static async completeSession(sessionId, userId, notes = '') {
    const session = await MentorSession.findById(sessionId);
    if (!session) throw new AppError('Session not found', 404);

    const isMentor  = session.mentorId.toString() === userId.toString();
    const isMentee  = session.menteeId.toString() === userId.toString();
    if (!isMentor && !isMentee) throw new AppError('Not authorised', 403);

    session.status = 'completed';
    if (notes) session.notes = notes;
    await session.save();
    return session;
  }

  static async getUpcomingSessions(userId) {
    const now = new Date();
    return MentorSession.find({
      $or: [{ mentorId: userId }, { menteeId: userId }],
      status: { $in: ['pending', 'confirmed'] },
      scheduledAt: { $gte: now },
    })
      .sort({ scheduledAt: 1 })
      .populate('mentorId', 'name email')
      .populate('menteeId', 'name email')
      .lean();
  }

  static async getCompletedSessions(userId) {
    return MentorSession.find({
      $or: [{ mentorId: userId }, { menteeId: userId }],
      status: 'completed',
    })
      .sort({ scheduledAt: -1 })
      .populate('mentorId', 'name email')
      .populate('menteeId', 'name email')
      .lean();
  }

  static async getSession(sessionId, userId) {
    const session = await MentorSession.findById(sessionId)
      .populate('mentorId', 'name email')
      .populate('menteeId', 'name email')
      .lean();
    if (!session) throw new AppError('Session not found', 404);

    const isMentor  = session.mentorId._id.toString() === userId.toString();
    const isMentee  = session.menteeId._id.toString() === userId.toString();
    if (!isMentor && !isMentee) throw new AppError('Not authorised', 403);

    return session;
  }

  static async updateNotes(sessionId, userId, notes) {
    const session = await MentorSession.findById(sessionId);
    if (!session) throw new AppError('Session not found', 404);

    const isMentor  = session.mentorId.toString() === userId.toString();
    const isMentee  = session.menteeId.toString() === userId.toString();
    if (!isMentor && !isMentee) throw new AppError('Not authorised', 403);

    session.notes = notes;
    await session.save();
    return session;
  }
}

module.exports = MentorSessionService;
