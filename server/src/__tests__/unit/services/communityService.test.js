'use strict';
/**
 * Unit tests – communityService (Sprint 11)
 *
 * Uses real MongoDB (in-memory or test DB via setup.js) and real models.
 * Tests core CRUD, likes, bookmarks, and follow system logic.
 */

const mongoose = require('mongoose');
const CommunityService = require('../../../services/communityService');
const CommunityPost   = require('../../../models/CommunityPost');
const PostLike        = require('../../../models/PostLike');
const PostBookmark    = require('../../../models/PostBookmark');
const PostComment     = require('../../../models/PostComment');
const UserFollow      = require('../../../models/UserFollow');
const User            = require('../../../models/User');

// Helper: create a minimal user document
const makeUser = async (overrides = {}) => {
  return User.create({
    name:     overrides.name     || 'Test User',
    email:    overrides.email    || `test_${Date.now()}_${Math.random()}@example.com`,
    password: 'hashed_password',
    role:     overrides.role     || 'user',
  });
};

// ─── createPost ─────────────────────────────────────────────────────────────

describe('CommunityService.createPost()', () => {
  it('creates a post with valid data', async () => {
    const user = await makeUser();
    const post = await CommunityService.createPost(user._id, {
      content: 'Hello community!',
      category: 'General',
      tags: ['startup'],
    });
    expect(post._id).toBeDefined();
    expect(post.content).toBe('Hello community!');
    expect(post.authorId.toString()).toBe(user._id.toString());
  });

  it('throws 400 when content is empty', async () => {
    const user = await makeUser();
    await expect(
      CommunityService.createPost(user._id, { content: '' })
    ).rejects.toThrow('Post content is required');
  });
});

// ─── updatePost ──────────────────────────────────────────────────────────────

describe('CommunityService.updatePost()', () => {
  it('updates a post owned by the user', async () => {
    const user = await makeUser();
    const post = await CommunityService.createPost(user._id, { content: 'Original' });
    const updated = await CommunityService.updatePost(post._id, user._id, { content: 'Updated content' });
    expect(updated.content).toBe('Updated content');
  });

  it('throws 403 when a different user tries to update', async () => {
    const owner   = await makeUser({ email: `owner_${Date.now()}@x.com` });
    const other   = await makeUser({ email: `other_${Date.now()}@x.com` });
    const post    = await CommunityService.createPost(owner._id, { content: 'Owned post' });
    await expect(
      CommunityService.updatePost(post._id, other._id, { content: 'Hacked' })
    ).rejects.toThrow('Not authorised');
  });
});

// ─── deletePost ──────────────────────────────────────────────────────────────

describe('CommunityService.deletePost()', () => {
  it('deletes post and cascades to comments, likes, bookmarks', async () => {
    const user = await makeUser();
    const post = await CommunityService.createPost(user._id, { content: 'Delete me' });
    await PostLike.create({ postId: post._id, userId: user._id });
    await PostBookmark.create({ postId: post._id, userId: user._id });

    const result = await CommunityService.deletePost(post._id, user._id, 'user');
    expect(result.deleted).toBe(true);

    const gone = await CommunityPost.findById(post._id);
    expect(gone).toBeNull();
    const likes = await PostLike.find({ postId: post._id });
    expect(likes).toHaveLength(0);
    const bookmarks = await PostBookmark.find({ postId: post._id });
    expect(bookmarks).toHaveLength(0);
  });

  it('allows admin to delete any post', async () => {
    const owner = await makeUser({ email: `owner2_${Date.now()}@x.com` });
    const admin = await makeUser({ email: `admin_${Date.now()}@x.com`, role: 'admin' });
    const post  = await CommunityService.createPost(owner._id, { content: 'Admin delete test' });
    const result = await CommunityService.deletePost(post._id, admin._id, 'admin');
    expect(result.deleted).toBe(true);
  });
});

// ─── toggleLike ──────────────────────────────────────────────────────────────

describe('CommunityService.toggleLike()', () => {
  it('likes a post (first toggle)', async () => {
    const user = await makeUser();
    const post = await CommunityService.createPost(user._id, { content: 'Like me' });
    const result = await CommunityService.toggleLike(post._id, user._id);
    expect(result.liked).toBe(true);
    expect(result.likeCount).toBe(1);
  });

  it('unlikes a post (second toggle)', async () => {
    const user = await makeUser();
    const post = await CommunityService.createPost(user._id, { content: 'Like/unlike' });
    await CommunityService.toggleLike(post._id, user._id);   // like
    const result = await CommunityService.toggleLike(post._id, user._id); // unlike
    expect(result.liked).toBe(false);
  });
});

// ─── toggleBookmark ──────────────────────────────────────────────────────────

describe('CommunityService.toggleBookmark()', () => {
  it('bookmarks a post', async () => {
    const user = await makeUser();
    const post = await CommunityService.createPost(user._id, { content: 'Bookmark me' });
    const result = await CommunityService.toggleBookmark(post._id, user._id);
    expect(result.bookmarked).toBe(true);
  });

  it('removes bookmark on second call', async () => {
    const user = await makeUser();
    const post = await CommunityService.createPost(user._id, { content: 'Bookmark toggle' });
    await CommunityService.toggleBookmark(post._id, user._id);
    const result = await CommunityService.toggleBookmark(post._id, user._id);
    expect(result.bookmarked).toBe(false);
  });
});

// ─── addComment / getComments ────────────────────────────────────────────────

describe('CommunityService comments', () => {
  it('adds a comment and increments commentCount', async () => {
    const user = await makeUser();
    const post = await CommunityService.createPost(user._id, { content: 'Comment test' });
    const comment = await CommunityService.addComment(post._id, user._id, 'Great post!');
    expect(comment._id).toBeDefined();
    expect(comment.content).toBe('Great post!');

    const updated = await CommunityPost.findById(post._id);
    expect(updated.commentCount).toBe(1);
  });

  it('throws 400 for empty comment content', async () => {
    const user = await makeUser();
    const post = await CommunityService.createPost(user._id, { content: 'Empty comment test' });
    await expect(
      CommunityService.addComment(post._id, user._id, '')
    ).rejects.toThrow('Comment content is required');
  });
});

// ─── Follow system ────────────────────────────────────────────────────────────

describe('CommunityService follow system', () => {
  it('follows a user', async () => {
    const follower  = await makeUser({ email: `follower_${Date.now()}@x.com` });
    const following = await makeUser({ email: `following_${Date.now()}@x.com` });
    const result = await CommunityService.followUser(follower._id, following._id);
    expect(result.following).toBe(true);
  });

  it('throws 409 if already following', async () => {
    const follower  = await makeUser({ email: `follower2_${Date.now()}@x.com` });
    const following = await makeUser({ email: `following2_${Date.now()}@x.com` });
    await CommunityService.followUser(follower._id, following._id);
    await expect(
      CommunityService.followUser(follower._id, following._id)
    ).rejects.toThrow('Already following');
  });

  it('throws 400 if trying to follow yourself', async () => {
    const user = await makeUser({ email: `self_${Date.now()}@x.com` });
    await expect(
      CommunityService.followUser(user._id, user._id)
    ).rejects.toThrow('Cannot follow yourself');
  });

  it('unfollows a user', async () => {
    const follower  = await makeUser({ email: `uf1_${Date.now()}@x.com` });
    const following = await makeUser({ email: `uf2_${Date.now()}@x.com` });
    await CommunityService.followUser(follower._id, following._id);
    const result = await CommunityService.unfollowUser(follower._id, following._id);
    expect(result.following).toBe(false);
  });

  it('throws 404 when unfollowing a non-followed user', async () => {
    const userA = await makeUser({ email: `ua_${Date.now()}@x.com` });
    const userB = await makeUser({ email: `ub_${Date.now()}@x.com` });
    await expect(
      CommunityService.unfollowUser(userA._id, userB._id)
    ).rejects.toThrow('Not following');
  });
});

// ─── getPosts / getPost ───────────────────────────────────────────────────────

describe('CommunityService.getPosts()', () => {
  it('returns paginated public posts', async () => {
    const user = await makeUser({ email: `lister_${Date.now()}@x.com` });
    await CommunityService.createPost(user._id, { content: 'Post A', category: 'Business' });
    await CommunityService.createPost(user._id, { content: 'Post B', category: 'General' });
    const result = await CommunityService.getPosts({ page: 1, limit: 10 });
    expect(result.posts.length).toBeGreaterThanOrEqual(2);
    expect(result.total).toBeGreaterThanOrEqual(2);
  });
});

describe('CommunityService.getPost()', () => {
  it('returns a post and increments view count', async () => {
    const user = await makeUser({ email: `viewer_${Date.now()}@x.com` });
    const post = await CommunityService.createPost(user._id, { content: 'View count test' });
    const result = await CommunityService.getPost(post._id);
    expect(result._id.toString()).toBe(post._id.toString());

    const updated = await CommunityPost.findById(post._id);
    expect(updated.viewCount).toBe(1);
  });

  it('throws 404 for non-existent post', async () => {
    await expect(
      CommunityService.getPost(new mongoose.Types.ObjectId())
    ).rejects.toThrow('Post not found');
  });
});
