const mongoose = require('mongoose');

/**
 * Connection stores a networking request between two users (entrepreneur <-> mentor).
 */
const ConnectionSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
}, { timestamps: true });

// Ensure a user cannot send duplicate requests to the same receiver
ConnectionSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

module.exports = mongoose.model('Connection', ConnectionSchema);
