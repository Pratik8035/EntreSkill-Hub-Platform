const Connection = require('../models/Connection');
const CollaborationRequest = require('../models/CollaborationRequest');
const User = require('../models/User');

/**
 * Service to manage networking directories, connections, and collaborations.
 */

/**
 * Fetch all platform users and annotate with their connection status relative to current user
 */
async function listDirectoryUsers(currentUserId) {
  const users = await User.find({ _id: { $ne: currentUserId }, role: { $in: ['user', 'mentor'] } })
    .select('name email role profile')
    .lean();

  const connections = await Connection.find({
    $or: [{ senderId: currentUserId }, { receiverId: currentUserId }]
  }).lean();

  const connectionMap = {};
  connections.forEach(conn => {
    const otherUserId = conn.senderId.toString() === currentUserId.toString()
      ? conn.receiverId.toString()
      : conn.senderId.toString();
    connectionMap[otherUserId] = conn;
  });

  return users.map(user => {
    const conn = connectionMap[user._id.toString()];
    let connectionStatus = 'none';
    let connectionId = null;

    if (conn) {
      connectionId = conn._id;
      if (conn.status === 'accepted') {
        connectionStatus = 'connected';
      } else if (conn.status === 'pending') {
        if (conn.senderId.toString() === currentUserId.toString()) {
          connectionStatus = 'pending_sent';
        } else {
          connectionStatus = 'pending_received';
        }
      }
    }

    return {
      ...user,
      connectionStatus,
      connectionId
    };
  });
}

/**
 * Send a connection request to another user
 */
async function sendConnection(senderId, receiverId) {
  if (senderId.toString() === receiverId.toString()) {
    throw new Error('You cannot connect with yourself');
  }

  // Check if connection already exists
  const existing = await Connection.findOne({
    $or: [
      { senderId, receiverId },
      { senderId: receiverId, receiverId: senderId }
    ]
  });

  if (existing) {
    if (existing.status === 'accepted') {
      throw new Error('You are already connected to this user');
    }
    if (existing.status === 'pending') {
      throw new Error('Connection request is already pending');
    }
    // If rejected, allow resending by resetting to pending
    existing.senderId = senderId;
    existing.receiverId = receiverId;
    existing.status = 'pending';
    await existing.save();
    return existing;
  }

  return await Connection.create({ senderId, receiverId, status: 'pending' });
}

/**
 * Send a collaboration proposal
 */
async function sendCollaboration({ senderId, receiverId, projectTitle, description }) {
  if (senderId.toString() === receiverId.toString()) {
    throw new Error('You cannot collaborate with yourself');
  }

  // Check if they are connected
  const isConnected = await Connection.findOne({
    $or: [
      { senderId, receiverId, status: 'accepted' },
      { senderId: receiverId, receiverId: senderId, status: 'accepted' }
    ]
  });

  if (!isConnected) {
    throw new Error('You can only send collaboration proposals to connected contacts');
  }

  // Check duplicate pending collaboration
  const existingPending = await CollaborationRequest.findOne({
    senderId,
    receiverId,
    projectTitle,
    status: 'pending'
  });

  if (existingPending) {
    throw new Error('A pending collaboration request with this title already exists for this contact');
  }

  return await CollaborationRequest.create({
    senderId,
    receiverId,
    projectTitle,
    description,
    status: 'pending'
  });
}

/**
 * Get all accepted connections for user
 */
async function getConnectionsForUser(userId) {
  const conns = await Connection.find({
    status: 'accepted',
    $or: [{ senderId: userId }, { receiverId: userId }]
  })
  .populate('senderId', 'name email role profile')
  .populate('receiverId', 'name email role profile')
  .lean();

  return conns.map(c => {
    const contact = c.senderId._id.toString() === userId.toString() ? c.receiverId : c.senderId;
    return {
      connectionId: c._id,
      contact,
      connectedAt: c.updatedAt
    };
  });
}

/**
 * Get incoming requests & proposals, plus sent proposals
 */
async function getPendingRequests(userId) {
  const connectionRequests = await Connection.find({
    receiverId: userId,
    status: 'pending'
  })
  .populate('senderId', 'name email role profile')
  .lean();

  const collaborationRequestsReceived = await CollaborationRequest.find({
    receiverId: userId,
    status: 'pending'
  })
  .populate('senderId', 'name email role profile')
  .lean();

  const collaborationRequestsSent = await CollaborationRequest.find({
    senderId: userId
  })
  .populate('receiverId', 'name email role profile')
  .lean();

  return {
    connectionRequests,
    collaborationRequestsReceived,
    collaborationRequestsSent
  };
}

/**
 * Accept a request (either connection or collaboration request)
 */
async function acceptRequest(requestId, userId) {
  // Check Connection table first
  let conn = await Connection.findById(requestId);
  if (conn) {
    if (conn.receiverId.toString() !== userId.toString()) {
      throw new Error('Unauthorized: You are not the receiver of this request');
    }
    conn.status = 'accepted';
    await conn.save();
    return conn;
  }

  // Check Collaboration table
  let collab = await CollaborationRequest.findById(requestId);
  if (collab) {
    if (collab.receiverId.toString() !== userId.toString()) {
      throw new Error('Unauthorized: You are not the receiver of this request');
    }
    collab.status = 'accepted';
    await collab.save();
    return collab;
  }

  throw new Error('Request not found');
}

/**
 * Reject a request (either connection or collaboration request)
 */
async function rejectRequest(requestId, userId) {
  // Check Connection table first
  let conn = await Connection.findById(requestId);
  if (conn) {
    if (conn.receiverId.toString() !== userId.toString()) {
      throw new Error('Unauthorized: You are not the receiver of this request');
    }
    conn.status = 'rejected';
    await conn.save();
    return conn;
  }

  // Check Collaboration table
  let collab = await CollaborationRequest.findById(requestId);
  if (collab) {
    if (collab.receiverId.toString() !== userId.toString()) {
      throw new Error('Unauthorized: You are not the receiver of this request');
    }
    collab.status = 'rejected';
    await collab.save();
    return collab;
  }

  throw new Error('Request not found');
}

module.exports = {
  listDirectoryUsers,
  sendConnection,
  sendCollaboration,
  getConnectionsForUser,
  getPendingRequests,
  acceptRequest,
  rejectRequest
};
