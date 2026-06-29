'use strict';
/**
 * mentorSessionController.js — Sprint 11
 * HTTP layer for mentor session booking and management.
 */

const asyncHandler = require('express-async-handler');
const MentorSessionService = require('../services/mentorSessionService');
const { sendSuccess } = require('../utils/responseHandler');

const bookSession = asyncHandler(async (req, res) => {
  const session = await MentorSessionService.bookSession(req.user._id, req.body);
  sendSuccess(res, session, 'Session booked', 201);
});

const cancelSession = asyncHandler(async (req, res) => {
  const session = await MentorSessionService.cancelSession(
    req.params.id, req.user._id, req.body.reason || ''
  );
  sendSuccess(res, session, 'Session cancelled');
});

const confirmSession = asyncHandler(async (req, res) => {
  const session = await MentorSessionService.confirmSession(req.params.id, req.user._id);
  sendSuccess(res, session, 'Session confirmed');
});

const completeSession = asyncHandler(async (req, res) => {
  const session = await MentorSessionService.completeSession(
    req.params.id, req.user._id, req.body.notes || ''
  );
  sendSuccess(res, session, 'Session completed');
});

const getUpcomingSessions = asyncHandler(async (req, res) => {
  const sessions = await MentorSessionService.getUpcomingSessions(req.user._id);
  sendSuccess(res, sessions, 'Upcoming sessions retrieved');
});

const getCompletedSessions = asyncHandler(async (req, res) => {
  const sessions = await MentorSessionService.getCompletedSessions(req.user._id);
  sendSuccess(res, sessions, 'Completed sessions retrieved');
});

const getSession = asyncHandler(async (req, res) => {
  const session = await MentorSessionService.getSession(req.params.id, req.user._id);
  sendSuccess(res, session, 'Session retrieved');
});

const updateNotes = asyncHandler(async (req, res) => {
  const session = await MentorSessionService.updateNotes(
    req.params.id, req.user._id, req.body.notes || ''
  );
  sendSuccess(res, session, 'Notes updated');
});

module.exports = {
  bookSession,
  cancelSession,
  confirmSession,
  completeSession,
  getUpcomingSessions,
  getCompletedSessions,
  getSession,
  updateNotes,
};
