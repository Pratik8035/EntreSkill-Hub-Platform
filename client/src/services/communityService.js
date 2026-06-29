import api from './api.js';

const communityService = {
  // ── Posts ────────────────────────────────────────────────────────────────
  getPosts: async (params = {}) => {
    const response = await api.get('/community/posts', { params });
    return response.data;
  },

  getPost: async (id) => {
    const response = await api.get(`/community/posts/${id}`);
    return response.data;
  },

  createPost: async (data) => {
    const response = await api.post('/community/posts', data);
    return response.data;
  },

  updatePost: async (id, data) => {
    const response = await api.put(`/community/posts/${id}`, data);
    return response.data;
  },

  deletePost: async (id) => {
    const response = await api.delete(`/community/posts/${id}`);
    return response.data;
  },

  // ── Feed ─────────────────────────────────────────────────────────────────
  getFeed: async (params = {}) => {
    const response = await api.get('/community/feed', { params });
    return response.data;
  },

  // ── Likes ────────────────────────────────────────────────────────────────
  toggleLike: async (postId) => {
    const response = await api.post(`/community/posts/${postId}/like`);
    return response.data;
  },

  // ── Bookmarks ────────────────────────────────────────────────────────────
  toggleBookmark: async (postId) => {
    const response = await api.post(`/community/posts/${postId}/bookmark`);
    return response.data;
  },

  getBookmarks: async (params = {}) => {
    const response = await api.get('/community/bookmarks', { params });
    return response.data;
  },

  // ── Comments ─────────────────────────────────────────────────────────────
  getComments: async (postId, params = {}) => {
    const response = await api.get(`/community/posts/${postId}/comments`, { params });
    return response.data;
  },

  addComment: async (postId, content, parentId = null) => {
    const response = await api.post(`/community/posts/${postId}/comments`, { content, parentId });
    return response.data;
  },

  updateComment: async (commentId, content) => {
    const response = await api.put(`/community/comments/${commentId}`, { content });
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await api.delete(`/community/comments/${commentId}`);
    return response.data;
  },

  // ── Follow System ────────────────────────────────────────────────────────
  followUser: async (userId) => {
    const response = await api.post(`/community/follow/${userId}`);
    return response.data;
  },

  unfollowUser: async (userId) => {
    const response = await api.delete(`/community/unfollow/${userId}`);
    return response.data;
  },

  getFollowers: async (userId, params = {}) => {
    const response = await api.get(`/community/followers/${userId}`, { params });
    return response.data;
  },

  getFollowing: async (userId, params = {}) => {
    const response = await api.get(`/community/following/${userId}`, { params });
    return response.data;
  },

  getSuggestedUsers: async (params = {}) => {
    const response = await api.get('/community/suggested', { params });
    return response.data;
  },

  getMutualFollowers: async (userId) => {
    const response = await api.get(`/community/mutual/${userId}`);
    return response.data;
  },
};

export default communityService;
