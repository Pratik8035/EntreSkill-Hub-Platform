'use strict';
const mongoose = require('mongoose');

const PostCommentSchema = new mongoose.Schema({
  postId:   { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityPost', required: true, index: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'PostComment', default: null }, // null = top-level
  content:  { type: String, required: true, trim: true, maxlength: 2000 },
  isDeleted:{ type: Boolean, default: false },
  replyCount:{ type: Number, default: 0 },
}, { timestamps: true });

PostCommentSchema.index({ postId: 1, createdAt: 1 });
PostCommentSchema.index({ postId: 1, parentId: 1 });
PostCommentSchema.index({ authorId: 1 });

module.exports = mongoose.model('PostComment', PostCommentSchema);
