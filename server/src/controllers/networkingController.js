const networkingService = require('../services/networkingService');
const asyncHandler = require('express-async-handler');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc Get directory of other platform users with connection statuses
 * @route GET /api/network/users
 * @access Private
 */
const getDirectoryUsers = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  const { search, role, state, skill } = req.query;

  let users = await networkingService.listDirectoryUsers(currentUserId);

  // Apply filters
  if (role) {
    users = users.filter(u => u.role === role);
  }

  if (state && state !== 'All') {
    users = users.filter(u => u.profile?.location && u.profile.location.toLowerCase().includes(state.toLowerCase()));
  }

  if (skill) {
    users = users.filter(u => u.profile?.skills && u.profile.skills.some(s => s.toLowerCase().includes(skill.toLowerCase())));
  }

  if (search) {
    const term = search.toLowerCase();
    users = users.filter(u => 
      u.name.toLowerCase().includes(term) || 
      (u.profile?.bio && u.profile.bio.toLowerCase().includes(term)) ||
      (u.profile?.skills && u.profile.skills.some(s => s.toLowerCase().includes(term)))
    );
  }

  sendSuccess(res, users, 'Platform directories retrieved successfully');
});

/**
 * @desc Connect with another user
 * @route POST /api/network/connect
 * @access Private
 */
const connect = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const { receiverId } = req.body;

  if (!receiverId) {
    return sendError(res, 'Receiver ID is required', [], 400);
  }

  try {
    const conn = await networkingService.sendConnection(senderId, receiverId);
    sendSuccess(res, conn, 'Connection request sent successfully', 201);
  } catch (err) {
    sendError(res, err.message, [], 400);
  }
});

/**
 * @desc Send a collaboration proposal
 * @route POST /api/network/collaborate
 * @access Private
 */
const collaborate = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const { receiverId, projectTitle, description } = req.body;

  if (!receiverId || !projectTitle || !description) {
    return sendError(res, 'Receiver ID, project title, and description are required', [], 400);
  }

  try {
    const collab = await networkingService.sendCollaboration({
      senderId,
      receiverId,
      projectTitle,
      description
    });
    sendSuccess(res, collab, 'Collaboration request sent successfully', 201);
  } catch (err) {
    sendError(res, err.message, [], 400);
  }
});

/**
 * @desc Get all connected contacts
 * @route GET /api/network/connections
 * @access Private
 */
const getConnections = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const connections = await networkingService.getConnectionsForUser(userId);
  sendSuccess(res, connections, 'Connections fetched successfully');
});

/**
 * @desc Get all incoming pending requests and collaboration proposals
 * @route GET /api/network/requests
 * @access Private
 */
const getRequests = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const pending = await networkingService.getPendingRequests(userId);
  sendSuccess(res, pending, 'Pending requests fetched successfully');
});

/**
 * @desc Accept connection or collaboration request
 * @route PUT /api/network/accept/:id
 * @access Private
 */
const acceptRequest = asyncHandler(async (req, res) => {
  const requestId = req.params.id;
  const userId = req.user._id;

  try {
    const updated = await networkingService.acceptRequest(requestId, userId);
    sendSuccess(res, updated, 'Request accepted successfully');
  } catch (err) {
    sendError(res, err.message, [], 400);
  }
});

/**
 * @desc Reject connection or collaboration request
 * @route PUT /api/network/reject/:id
 * @access Private
 */
const rejectRequest = asyncHandler(async (req, res) => {
  const requestId = req.params.id;
  const userId = req.user._id;

  try {
    const updated = await networkingService.rejectRequest(requestId, userId);
    sendSuccess(res, updated, 'Request rejected successfully');
  } catch (err) {
    sendError(res, err.message, [], 400);
  }
});

module.exports = {
  getDirectoryUsers,
  connect,
  collaborate,
  getConnections,
  getRequests,
  acceptRequest,
  rejectRequest
};
