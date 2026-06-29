'use strict';
const mongoose = require('mongoose');

const CommunityPostSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:    { type: String, trim: true, maxlength: 200 },
  content:  { type: String, required: true, trim: true, maxlength: 10000 },
  category: {
    type: String,
    enum: ['General', 'Business', 'Technology', 'Marketing', 'Finance', 'Networking', 'Q&A', 'News', 'Other'],
    default: 'General',
  },
  tags:        { type: [String], default: [] },
  visibility:  { type: String, enum: ['public', 'followers', 'private'], default: 'public' },
  status:      { type: String, enum: ['published', 'draft'], default: 'published' },
  isPinned:    { type: Boolean, default: false },
  likeCount:   { type: Number, default: 0 },
  commentCount:{ type: Number, default: 0 },
  viewCount:   { type: Number, default: 0 },
  imageUrl:    { type: String, default: null },
}, { timestamps: true });

CommunityPostSchema.index({ authorId: 1, createdAt: -1 });
CommunityPostSchema.index({ category: 1, createdAt: -1 });
CommunityPostSchema.index({ tags: 1 });
CommunityPostSchema.index({ isPinned: -1, createdAt: -1 });
CommunityPostSchema.index({ content: 'text', title: 'text' });

module.exports = mongoose.model('CommunityPost', CommunityPostSchema);
