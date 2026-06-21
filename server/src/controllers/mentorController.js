const MentorProfile = require('../models/MentorProfile');
const MentorRequest = require('../models/MentorRequest');
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

module.exports = { listMentors, getRecommendedMentors, getMentorById, requestMentor };
