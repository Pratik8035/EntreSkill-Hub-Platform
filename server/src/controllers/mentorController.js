const MentorProfile = require('../models/MentorProfile');
const MentorRequest = require('../models/MentorRequest');
const Connection = require('../models/Connection');
const asyncHandler = require('express-async-handler');
const { getMentorMatches } = require('../services/mentorMatchService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// @desc List all mentors
// @route GET /api/mentors
// @access Private
const listMentors = asyncHandler(async (req, res) => {
  const mentors = await MentorProfile.find()
    .populate('userId', 'name email role profile')
    .lean();
  sendSuccess(res, mentors, 'Mentors fetched');
});

// @desc Get recommended mentors for the logged‑in user
// @route GET /api/mentors/recommended
// @access Private
const getRecommendedMentors = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const matches = await getMentorMatches(userId);
  const populated = await Promise.all(
    matches.map(async (match) => {
      const mentor = await MentorProfile.findById(match.mentor._id)
        .populate('userId', 'name email role profile')
        .lean();
      return { mentor, matchScore: match.matchScore };
    })
  );
  sendSuccess(res, populated, 'Recommended mentors fetched');
});

// @desc Get mentor by id
// @route GET /api/mentors/:id
// @access Private
const getMentorById = asyncHandler(async (req, res) => {
  const mentor = await MentorProfile.findById(req.params.id).lean();
  if (!mentor) return sendError(res, 'Mentor not found', 404);
  sendSuccess(res, mentor, 'Mentor fetched');
});

// @desc Request a mentor
// @route POST /api/mentors/request
// @access Private
const requestMentor = asyncHandler(async (req, res) => {
  const { mentorId, message } = req.body;
  const requesterId = req.user._id;
  const newRequest = await MentorRequest.create({ mentorId, requesterId, message });
  sendSuccess(res, newRequest, 'Mentor request created');
});

// @desc Get pending mentor requests for logged-in mentor
// @route GET /api/mentors/requests/pending
// @access Private (Mentor)
const getPendingRequests = asyncHandler(async (req, res) => {
  const mentorProfile = await MentorProfile.findOne({ userId: req.user._id });
  if (!mentorProfile) {
    return sendError(res, 'Mentor profile not found', [], 404);
  }

  const requests = await MentorRequest.find({
    mentorId: mentorProfile._id,
    status: 'Pending'
  }).populate('requesterId', 'name email profile');

  sendSuccess(res, requests, 'Pending mentor requests retrieved successfully');
});

// @desc Accept a mentor request
// @route PUT /api/mentors/requests/:requestId/accept
// @access Private (Mentor)
const acceptRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const mentorProfile = await MentorProfile.findOne({ userId: req.user._id });
  if (!mentorProfile) {
    return sendError(res, 'Mentor profile not found', [], 404);
  }

  const request = await MentorRequest.findById(requestId);
  if (!request) {
    return sendError(res, 'Mentor request not found', [], 404);
  }

  if (request.mentorId.toString() !== mentorProfile._id.toString()) {
    return sendError(res, 'Unauthorized to accept this request', [], 403);
  }

  // Accept request and create a connection
  request.status = 'Accepted';
  await request.save();

  // Create Connection representing mentor‑entrepreneur assignment
  const connection = await Connection.create({
    senderId: request.requesterId,
    receiverId: request.mentorId,
    status: 'accepted',
  });

  sendSuccess(res, { request, connection }, 'Mentor request accepted and connection created successfully');
});

// @desc Reject a mentor request
// @route PUT /api/mentors/requests/:requestId/reject
// @access Private (Mentor)
const rejectRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const mentorProfile = await MentorProfile.findOne({ userId: req.user._id });
  if (!mentorProfile) {
    return sendError(res, 'Mentor profile not found', [], 404);
  }

  const request = await MentorRequest.findById(requestId);
  if (!request) {
    return sendError(res, 'Mentor request not found', [], 404);
  }

  if (request.mentorId.toString() !== mentorProfile._id.toString()) {
    return sendError(res, 'Unauthorized to reject this request', [], 403);
  }

  request.status = 'Rejected';
  await request.save();

  sendSuccess(res, request, 'Mentor request rejected successfully');
});

// @desc Get active assignments for logged-in mentor
// @route GET /api/mentors/assignments
// @access Private (Mentor)
const getAssignments = asyncHandler(async (req, res) => {
  // Mentor's active connections (accepted)
  const connections = await Connection.find({
    receiverId: req.user._id,
    status: 'accepted'
  }).populate('senderId', 'name email profile');

  sendSuccess(res, connections, 'Assignments retrieved successfully');
});

// @desc Get current mentor request and assignment status for entrepreneur
// @route GET /api/mentors/my-status
// @access Private (Entrepreneur)
const getEntrepreneurMentorStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find active connection where entrepreneur is the sender
  const connection = await Connection.findOne({
    senderId: userId,
    status: 'accepted'
  }).populate('receiverId', 'name email profile');

  // Find all requested mentors
  const requests = await MentorRequest.find({
    requesterId: userId
  })
  .populate({
    path: 'mentorId',
    populate: { path: 'userId', select: 'name email profile' }
  });

  sendSuccess(res, { connection, requests }, 'Mentor status retrieved successfully');
});

module.exports = {
  listMentors,
  getRecommendedMentors,
  getMentorById,
  requestMentor,
  getPendingRequests,
  acceptRequest,
  rejectRequest,
  getAssignments,
  getEntrepreneurMentorStatus
};

