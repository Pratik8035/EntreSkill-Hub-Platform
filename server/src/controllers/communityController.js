'use strict';
/**
 * communityController.js — Sprint 11
 * HTTP layer for community posts, comments, likes, bookmarks, follow system.
 */

const asyncHandler = require('express-async-handler');
const CommunityService = require('../services/communityService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// ─── Posts ─────────────────────────────────────────────────────────────────

const createPost = asyncHandler(async (req, res) => {
  const post = await CommunityService.createPost(req.user._id, req.body);
  sendSuccess(res, post, 'Post created', 201);
});

const updatePost = asyncHandler(async (req, res) => {
  const post = await CommunityService.updatePost(req.params.id, req.user._id, req.body);
  sendSuccess(res, post, 'Post updated');
});

const deletePost = asyncHandler(async (req, res) => {
  const result = await CommunityService.deletePost(req.params.id, req.user._id, req.user.role);
  sendSuccess(res, result, 'Post deleted');
});

const getPosts = asyncHandler(async (req, res) => {
  const { search, category, tags, status, authorId, page, limit, sort } = req.query;
  const data = await CommunityService.getPosts({
    search,
    category,
    tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : undefined,
    status,
    authorId,
    page:  Number(page)  || 1,
    limit: Number(limit) || 10,
    sort,
  });
  sendSuccess(res, data, 'Posts retrieved');
});

const getPost = asyncHandler(async (req, res) => {
  const post = await CommunityService.getPost(req.params.id, req.user?._id);
  sendSuccess(res, post, 'Post retrieved');
});

const getFeed = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const data = await CommunityService.getFeed(req.user._id, {
    page:  Number(page)  || 1,
    limit: Number(limit) || 10,
  });
  sendSuccess(res, data, 'Feed retrieved');
});

// ─── Comments ───────────────────────────────────────────────────────────────

const addComment = asyncHandler(async (req, res) => {
  const { content, parentId } = req.body;
  const comment = await CommunityService.addComment(req.params.id, req.user._id, content, parentId);
  sendSuccess(res, comment, 'Comment added', 201);
});

const updateComment = asyncHandler(async (req, res) => {
  const comment = await CommunityService.updateComment(req.params.commentId, req.user._id, req.body.content);
  sendSuccess(res, comment, 'Comment updated');
});

const deleteComment = asyncHandler(async (req, res) => {
  const result = await CommunityService.deleteComment(req.params.commentId, req.user._id, req.user.role);
  sendSuccess(res, result, 'Comment deleted');
});

const getComments = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const data = await CommunityService.getComments(req.params.id, {
    page:  Number(page)  || 1,
    limit: Number(limit) || 20,
  });
  sendSuccess(res, data, 'Comments retrieved');
});

// ─── Likes ──────────────────────────────────────────────────────────────────

const toggleLike = asyncHandler(async (req, res) => {
  const result = await CommunityService.toggleLike(req.params.id, req.user._id);
  sendSuccess(res, result, result.liked ? 'Post liked' : 'Post unliked');
});

// ─── Bookmarks ───────────────────────────────────────────────────────────────

const toggleBookmark = asyncHandler(async (req, res) => {
  const result = await CommunityService.toggleBookmark(req.params.id, req.user._id);
  sendSuccess(res, result, result.bookmarked ? 'Post bookmarked' : 'Bookmark removed');
});

const getBookmarks = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const data = await CommunityService.getBookmarks(req.user._id, {
    page:  Number(page)  || 1,
    limit: Number(limit) || 10,
  });
  sendSuccess(res, data, 'Bookmarks retrieved');
});

// ─── Follow System ───────────────────────────────────────────────────────────

const followUser = asyncHandler(async (req, res) => {
  const result = await CommunityService.followUser(req.user._id, req.params.userId);
  sendSuccess(res, result, 'Followed user', 201);
});

const unfollowUser = asyncHandler(async (req, res) => {
  const result = await CommunityService.unfollowUser(req.user._id, req.params.userId);
  sendSuccess(res, result, 'Unfollowed user');
});

const getFollowers = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const data = await CommunityService.getFollowers(req.params.userId, {
    page:  Number(page)  || 1,
    limit: Number(limit) || 20,
  });
  sendSuccess(res, data, 'Followers retrieved');
});

const getFollowing = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const data = await CommunityService.getFollowing(req.params.userId, {
    page:  Number(page)  || 1,
    limit: Number(limit) || 20,
  });
  sendSuccess(res, data, 'Following retrieved');
});

const getSuggestedUsers = asyncHandler(async (req, res) => {
  const { limit } = req.query;
  const users = await CommunityService.getSuggestedUsers(req.user._id, Number(limit) || 10);
  sendSuccess(res, users, 'Suggested users retrieved');
});

const getMutualFollowers = asyncHandler(async (req, res) => {
  const mutual = await CommunityService.getMutualFollowers(req.user._id, req.params.userId);
  sendSuccess(res, mutual, 'Mutual followers retrieved');
});

module.exports = {
  createPost, updatePost, deletePost, getPosts, getPost, getFeed,
  addComment, updateComment, deleteComment, getComments,
  toggleLike,
  toggleBookmark, getBookmarks,
  followUser, unfollowUser, getFollowers, getFollowing, getSuggestedUsers, getMutualFollowers,
};
