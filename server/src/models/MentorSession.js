'use strict';
const mongoose = require('mongoose');

const MentorSessionSchema = new mongoose.Schema({
  mentorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  menteeId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:      { type: String, required: true, trim: true, maxlength: 200 },
  description:{ type: String, trim: true, maxlength: 1000, default: '' },
  scheduledAt:{ type: Date, required: true },
  durationMin:{ type: Number, default: 60 },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  meetingLink:{ type: String, default: '' },
  notes:      { type: String, default: '' },       // mentor/mentee session notes
  cancelReason:{ type: String, default: '' },
}, { timestamps: true });

MentorSessionSchema.index({ mentorId: 1, scheduledAt: 1 });
MentorSessionSchema.index({ menteeId: 1, scheduledAt: 1 });
MentorSessionSchema.index({ status: 1, scheduledAt: 1 });

module.exports = mongoose.model('MentorSession', MentorSessionSchema);
