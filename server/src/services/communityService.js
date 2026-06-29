'use strict';
/**
 * communityService.js — Sprint 11
 * Business logic for community posts, comments, likes, bookmarks and follow system.
 */

const CommunityPost = require('../models/CommunityPost');
const PostComment   = require('../models/PostComment');
const PostLike      = require('../models/PostLike');
const PostBookmark  = require('../models/PostBookmark');
const UserFollow    = require('../models/UserFollow');
const User          = require('../models/User');
const AppError      = require('../utils/AppError');

// ─── Posts ────────────────────────────────────────────────────────────────────

class CommunityService {

  // ── Create Post ────────────────────────────────────────────────────────────
  static async createPost(authorId, data) {
    const { title, content, category, tags, visibility, status, imageUrl } = data;
    if (!content || content.trim().length === 0) {
      throw new AppError('Post content is required', 400);
    }
    return CommunityPost.create({
      authorId,
      title: title || '',
      content: content.trim(),
      category: category || 'General',
      tags: Array.isArray(tags) ? tags : [],
      visibility: visibility || 'public',
      status: status || 'published',
      imageUrl: imageUrl || null,
    });
  }

  // ── Update Post ────────────────────────────────────────────────────────────
  static async updatePost(postId, userId, data) {
    const post = await CommunityPost.findById(postId);
    if (!post) throw new AppError('Post not found', 404);
    if (post.authorId.toString() !== userId.toString()) throw new AppError('Not authorised', 403);

    const fields = ['title', 'content', 'category', 'tags', 'visibility', 'status', 'isPinned', 'imageUrl'];
    fields.forEach(f => { if (data[f] !== undefined) post[f] = data[f]; });
    await post.save();
    return post;
  }

  // ── Delete Post ────────────────────────────────────────────────────────────
  static async deletePost(postId, userId, userRole) {
    const post = await CommunityPost.findById(postId);
    if (!post) throw new AppError('Post not found', 404);
    if (post.authorId.toString() !== userId.toString() && userRole !== 'admin') {
      throw new AppError('Not authorised', 403);
    }
    await Promise.all([
      CommunityPost.findByIdAndDelete(postId),
      PostComment.deleteMany({ postId }),
      PostLike.deleteMany({ postId }),
      PostBookmark.deleteMany({ postId }),
    ]);
    return { deleted: true };
  }

  // ── Get All Posts (paginated, filtered, sorted) ────────────────────────────
  static async getPosts({ search, category, tags, status, authorId, page = 1, limit = 10, sort = 'newest' } = {}) {
    const filter = { visibility: 'public', status: 'published' };

    if (search) {
      filter.$or = [
        { title:   { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }
    if (category && category !== 'All') filter.category = category;
    if (tags && tags.length)           filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (authorId)                      filter.authorId = authorId;

    // Allow caller to see drafts only for own author
    if (status === 'draft')            filter.status = 'draft';

    const sortMap = {
      newest:  { isPinned: -1, createdAt: -1 },
      oldest:  { isPinned: -1, createdAt:  1 },
      popular: { isPinned: -1, likeCount: -1, createdAt: -1 },
      trending:{ isPinned: -1, commentCount: -1, viewCount: -1, createdAt: -1 },
    };
    const sortOrder = sortMap[sort] || sortMap.newest;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await CommunityPost.countDocuments(filter);
    const posts = await CommunityPost.find(filter)
      .sort(sortOrder)
      .skip(skip)
      .limit(Number(limit))
      .populate('authorId', 'name email profile.location role')
      .lean();

    return { posts, total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
  }

  // ── Get Single Post ────────────────────────────────────────────────────────
  static async getPost(postId, viewerId = null) {
    const post = await CommunityPost.findById(postId)
      .populate('authorId', 'name email profile.location role')
      .lean();
    if (!post) throw new AppError('Post not found', 404);

    // Increment view count
    await CommunityPost.findByIdAndUpdate(postId, { $inc: { viewCount: 1 } });

    let liked = false;
    let bookmarked = false;
    if (viewerId) {
      const [like, bm] = await Promise.all([
        PostLike.exists({ postId, userId: viewerId }),
        PostBookmark.exists({ postId, userId: viewerId }),
      ]);
      liked = !!like;
      bookmarked = !!bm;
    }
    return { ...post, liked, bookmarked };
  }

  // ── Comments ───────────────────────────────────────────────────────────────
  static async addComment(postId, authorId, content, parentId = null) {
    const post = await CommunityPost.findById(postId);
    if (!post) throw new AppError('Post not found', 404);
    if (!content || !content.trim()) throw new AppError('Comment content is required', 400);

    if (parentId) {
      const parent = await PostComment.findById(parentId);
      if (!parent || parent.postId.toString() !== postId.toString()) {
        throw new AppError('Parent comment not found', 404);
      }
      await PostComment.findByIdAndUpdate(parentId, { $inc: { replyCount: 1 } });
    }

    const comment = await PostComment.create({ postId, authorId, content: content.trim(), parentId: parentId || null });
    await CommunityPost.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });
    return comment;
  }

  static async updateComment(commentId, userId, content) {
    const comment = await PostComment.findById(commentId);
    if (!comment || comment.isDeleted) throw new AppError('Comment not found', 404);
    if (comment.authorId.toString() !== userId.toString()) throw new AppError('Not authorised', 403);
    comment.content = content.trim();
    await comment.save();
    return comment;
  }

  static async deleteComment(commentId, userId, userRole) {
    const comment = await PostComment.findById(commentId);
    if (!comment || comment.isDeleted) throw new AppError('Comment not found', 404);
    if (comment.authorId.toString() !== userId.toString() && userRole !== 'admin') {
      throw new AppError('Not authorised', 403);
    }
    comment.isDeleted = true;
    comment.content = '[deleted]';
    await comment.save();
    await CommunityPost.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -1 } });
    return { deleted: true };
  }

  static async getComments(postId, { page = 1, limit = 20 } = {}) {
    const skip = (Number(page) - 1) * Number(limit);
    const total = await PostComment.countDocuments({ postId, parentId: null, isDeleted: false });
    const comments = await PostComment.find({ postId, parentId: null })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('authorId', 'name role')
      .lean();
    // Attach top replies (up to 3 per comment)
    for (const c of comments) {
      c.replies = await PostComment.find({ parentId: c._id, isDeleted: false })
        .sort({ createdAt: 1 })
        .limit(3)
        .populate('authorId', 'name role')
        .lean();
    }
    return { comments, total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
  }

  // ── Likes ──────────────────────────────────────────────────────────────────
  static async toggleLike(postId, userId) {
    const post = await CommunityPost.findById(postId);
    if (!post) throw new AppError('Post not found', 404);

    const existing = await PostLike.findOne({ postId, userId });
    if (existing) {
      await PostLike.findByIdAndDelete(existing._id);
      await CommunityPost.findByIdAndUpdate(postId, { $inc: { likeCount: -1 } });
      return { liked: false, likeCount: Math.max(0, post.likeCount - 1) };
    }
    await PostLike.create({ postId, userId });
    await CommunityPost.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } });
    return { liked: true, likeCount: post.likeCount + 1 };
  }

  // ── Bookmarks ──────────────────────────────────────────────────────────────
  static async toggleBookmark(postId, userId) {
    const post = await CommunityPost.findById(postId);
    if (!post) throw new AppError('Post not found', 404);

    const existing = await PostBookmark.findOne({ postId, userId });
    if (existing) {
      await PostBookmark.findByIdAndDelete(existing._id);
      return { bookmarked: false };
    }
    await PostBookmark.create({ postId, userId });
    return { bookmarked: true };
  }

  static async getBookmarks(userId, { page = 1, limit = 10 } = {}) {
    const skip = (Number(page) - 1) * Number(limit);
    const total = await PostBookmark.countDocuments({ userId });
    const bookmarks = await PostBookmark.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate({ path: 'postId', populate: { path: 'authorId', select: 'name role' } })
      .lean();
    return {
      bookmarks: bookmarks.map(b => b.postId).filter(Boolean),
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    };
  }

  // ── Follow System ──────────────────────────────────────────────────────────
  static async followUser(followerId, followingId) {
    if (followerId.toString() === followingId.toString()) {
      throw new AppError('Cannot follow yourself', 400);
    }
    const target = await User.findById(followingId);
    if (!target) throw new AppError('User not found', 404);

    const existing = await UserFollow.findOne({ followerId, followingId });
    if (existing) throw new AppError('Already following this user', 409);

    await UserFollow.create({ followerId, followingId });
    return { following: true };
  }

  static async unfollowUser(followerId, followingId) {
    const follow = await UserFollow.findOneAndDelete({ followerId, followingId });
    if (!follow) throw new AppError('Not following this user', 404);
    return { following: false };
  }

  static async getFollowers(userId, { page = 1, limit = 20 } = {}) {
    const skip = (Number(page) - 1) * Number(limit);
    const total = await UserFollow.countDocuments({ followingId: userId });
    const rows  = await UserFollow.find({ followingId: userId })
      .sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
      .populate('followerId', 'name email role profile.location')
      .lean();
    return { followers: rows.map(r => r.followerId), total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
  }

  static async getFollowing(userId, { page = 1, limit = 20 } = {}) {
    const skip = (Number(page) - 1) * Number(limit);
    const total = await UserFollow.countDocuments({ followerId: userId });
    const rows  = await UserFollow.find({ followerId: userId })
      .sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
      .populate('followingId', 'name email role profile.location')
      .lean();
    return { following: rows.map(r => r.followingId), total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
  }

  static async getSuggestedUsers(userId, limit = 10) {
    // Users not followed and not self
    const followingRows = await UserFollow.find({ followerId: userId }).lean();
    const followingIds  = followingRows.map(r => r.followingId);
    const excluded      = [...followingIds, userId];

    const users = await User.find({ _id: { $nin: excluded } })
      .select('name email role profile.location')
      .limit(Number(limit))
      .lean();
    return users;
  }

  static async getMutualFollowers(userAId, userBId) {
    const [aFollowing, bFollowing] = await Promise.all([
      UserFollow.find({ followerId: userAId }).lean(),
      UserFollow.find({ followerId: userBId }).lean(),
    ]);
    const aSet = new Set(aFollowing.map(r => r.followingId.toString()));
    const mutual = bFollowing
      .filter(r => aSet.has(r.followingId.toString()))
      .map(r => r.followingId);
    return mutual;
  }

  // ── Community Feed ─────────────────────────────────────────────────────────
  static async getFeed(userId, { page = 1, limit = 10 } = {}) {
    const followingRows = await UserFollow.find({ followerId: userId }).lean();
    const followingIds  = followingRows.map(r => r.followingId);
    const authorIds     = [...followingIds, userId];

    const skip  = (Number(page) - 1) * Number(limit);
    const filter = {
      authorId:   { $in: authorIds },
      status:     'published',
      visibility: { $in: ['public', 'followers'] },
    };
    const total = await CommunityPost.countDocuments(filter);
    const posts = await CommunityPost.find(filter)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('authorId', 'name role profile.location')
      .lean();

    // If following feed is sparse, backfill with public posts
    if (posts.length < Number(limit)) {
      const needed = Number(limit) - posts.length;
      const existingIds = posts.map(p => p._id);
      const backfill = await CommunityPost.find({
        _id: { $nin: existingIds },
        status: 'published',
        visibility: 'public',
      })
        .sort({ likeCount: -1, createdAt: -1 })
        .limit(needed)
        .populate('authorId', 'name role profile.location')
        .lean();
      posts.push(...backfill);
    }

    return { posts, total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
  }
}

module.exports = CommunityService;
