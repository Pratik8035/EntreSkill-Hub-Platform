'use strict';
/**
 * communityRoutes.js — Sprint 11
 * Routes for community posts, comments, likes, bookmarks, follow system, and feed.
 */

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/communityController');

// ─── Feed ─────────────────────────────────────────────────────────────────────
// GET /api/community/feed
router.get('/feed', protect, ctrl.getFeed);

// ─── Posts ────────────────────────────────────────────────────────────────────
// GET  /api/community/posts
// POST /api/community/posts
router.get('/posts',  protect, ctrl.getPosts);
router.post('/posts', protect, ctrl.createPost);

// GET    /api/community/posts/:id
// PUT    /api/community/posts/:id
// DELETE /api/community/posts/:id
router.get('/posts/:id',    protect, ctrl.getPost);
router.put('/posts/:id',    protect, ctrl.updatePost);
router.delete('/posts/:id', protect, ctrl.deletePost);

// ─── Likes ────────────────────────────────────────────────────────────────────
// POST /api/community/posts/:id/like  (toggle)
router.post('/posts/:id/like', protect, ctrl.toggleLike);

// ─── Bookmarks ────────────────────────────────────────────────────────────────
// POST /api/community/posts/:id/bookmark  (toggle)
// GET  /api/community/bookmarks
router.post('/posts/:id/bookmark', protect, ctrl.toggleBookmark);
router.get('/bookmarks',           protect, ctrl.getBookmarks);

// ─── Comments ────────────────────────────────────────────────────────────────
// GET  /api/community/posts/:id/comments
// POST /api/community/posts/:id/comments
router.get('/posts/:id/comments',  protect, ctrl.getComments);
router.post('/posts/:id/comments', protect, ctrl.addComment);

// PUT    /api/community/comments/:commentId
// DELETE /api/community/comments/:commentId
router.put('/comments/:commentId',    protect, ctrl.updateComment);
router.delete('/comments/:commentId', protect, ctrl.deleteComment);

// ─── Follow System ───────────────────────────────────────────────────────────
// POST   /api/community/follow/:userId
// DELETE /api/community/unfollow/:userId
// GET    /api/community/followers/:userId
// GET    /api/community/following/:userId
// GET    /api/community/suggested
// GET    /api/community/mutual/:userId
router.post('/follow/:userId',     protect, ctrl.followUser);
router.delete('/unfollow/:userId', protect, ctrl.unfollowUser);
router.get('/followers/:userId',   protect, ctrl.getFollowers);
router.get('/following/:userId',   protect, ctrl.getFollowing);
router.get('/suggested',           protect, ctrl.getSuggestedUsers);
router.get('/mutual/:userId',      protect, ctrl.getMutualFollowers);

module.exports = router;
