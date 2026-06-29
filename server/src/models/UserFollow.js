'use strict';
const mongoose = require('mongoose');

const UserFollowSchema = new mongoose.Schema({
  followerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  followingId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

UserFollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
UserFollowSchema.index({ followerId: 1, createdAt: -1 });
UserFollowSchema.index({ followingId: 1, createdAt: -1 });

module.exports = mongoose.model('UserFollow', UserFollowSchema);
