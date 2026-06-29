'use strict';
// Notification — Sprint 9 Phase 2

const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    required: true,
    enum: [
      // Sprint 9 — execution
      'overdue_task', 'overdue_milestone', 'stalled_goal',
      'kpi_decline', 'missed_deadline', 'low_progress',
      'goal_completed', 'weekly_reminder',
      // Sprint 11 — community
      'new_follower', 'new_comment', 'new_like', 'new_reply',
      'mentor_booking', 'chat_message', 'mention',
    ],
  },
  title:   { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  read:    { type: Boolean, default: false },
  // optional reference to the triggering entity
  refId:   { type: mongoose.Schema.Types.ObjectId },
  refType: { type: String }, // 'goal' | 'milestone' | 'task' | 'kpi'
}, { timestamps: true });

NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
