const mongoose = require('mongoose');

const MentorRequestSchema = new mongoose.Schema({
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'MentorProfile', required: true },
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
  message: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('MentorRequest', MentorRequestSchema);
