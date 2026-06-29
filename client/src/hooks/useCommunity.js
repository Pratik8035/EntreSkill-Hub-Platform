import { useState, useEffect, useCallback } from 'react';
import communityService from '../services/communityService';

/**
 * useCommunityFeed — paginated feed for logged-in user
 */
export function useCommunityFeed(initialPage = 1) {
  const [posts, setPosts]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [page, setPage]         = useState(initialPage);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const load = useCallback(async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const res = await communityService.getFeed({ page: p, limit: 10 });
      const data = res.data;
      setPosts(data.posts || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(p);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(1); }, []);

  return { posts, total, pages, page, loading, error, reload: load, setPage: (p) => load(p) };
}

/**
 * useCommunityPosts — public posts list with filters
 */
export function useCommunityPosts(filters = {}) {
  const [posts, setPosts]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const load = useCallback(async (p = 1, f = filters) => {
    setLoading(true);
    setError(null);
    try {
      const res = await communityService.getPosts({ ...f, page: p, limit: 10 });
      const data = res.data;
      setPosts(data.posts || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(p);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1, filters); }, [JSON.stringify(filters)]);

  return { posts, total, pages, page, loading, error, reload: load };
}

/**
 * useCommunityPost — single post detail with comments
 */
export function useCommunityPost(postId) {
  const [post, setPost]           = useState(null);
  const [comments, setComments]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const loadPost = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    setError(null);
    try {
      const [postRes, commentsRes] = await Promise.all([
        communityService.getPost(postId),
        communityService.getComments(postId),
      ]);
      setPost(postRes.data);
      setComments(commentsRes.data?.comments || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => { loadPost(); }, [loadPost]);

  const toggleLike = async () => {
    try {
      const res = await communityService.toggleLike(postId);
      setPost(prev => ({ ...prev, liked: res.data.liked, likeCount: res.data.likeCount }));
    } catch (err) {
      console.error('toggleLike error', err);
    }
  };

  const toggleBookmark = async () => {
    try {
      const res = await communityService.toggleBookmark(postId);
      setPost(prev => ({ ...prev, bookmarked: res.data.bookmarked }));
    } catch (err) {
      console.error('toggleBookmark error', err);
    }
  };

  const addComment = async (content, parentId = null) => {
    const res = await communityService.addComment(postId, content, parentId);
    setComments(prev => [...prev, res.data]);
    setPost(prev => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
    return res.data;
  };

  return { post, comments, loading, error, reload: loadPost, toggleLike, toggleBookmark, addComment };
}

/**
 * useFollowSystem — follow/unfollow and follow list management
 */
export function useFollowSystem(targetUserId) {
  const [followers, setFollowers]   = useState([]);
  const [following, setFollowing]   = useState([]);
  const [suggested, setSuggested]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  const loadFollowers = useCallback(async () => {
    if (!targetUserId) return;
    try {
      const res = await communityService.getFollowers(targetUserId);
      setFollowers(res.data?.followers || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load followers');
    }
  }, [targetUserId]);

  const loadFollowing = useCallback(async () => {
    if (!targetUserId) return;
    try {
      const res = await communityService.getFollowing(targetUserId);
      setFollowing(res.data?.following || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load following');
    }
  }, [targetUserId]);

  const loadSuggested = useCallback(async () => {
    try {
      const res = await communityService.getSuggestedUsers();
      setSuggested(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load suggestions');
    }
  }, []);

  useEffect(() => {
    if (targetUserId) {
      setLoading(true);
      Promise.all([loadFollowers(), loadFollowing()]).finally(() => setLoading(false));
    }
    loadSuggested();
  }, [targetUserId]);

  const follow = async (userId) => {
    await communityService.followUser(userId);
    setSuggested(prev => prev.filter(u => u._id !== userId));
  };

  const unfollow = async (userId) => {
    await communityService.unfollowUser(userId);
    setFollowing(prev => prev.filter(u => u._id !== userId));
  };

  return { followers, following, suggested, loading, error, follow, unfollow, loadFollowers, loadFollowing };
}
