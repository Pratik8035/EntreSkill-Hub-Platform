import React, { useState } from 'react';
import { Plus, Users, Bookmark, Home, Search, Filter } from 'lucide-react';
import { useCommunityFeed, useCommunityPosts } from '../hooks/useCommunity';
import PostCard from '../components/community/PostCard';
import PostForm from '../components/community/PostForm';
import communityService from '../services/communityService';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'General', 'Business', 'Marketing', 'Finance', 'Legal', 'Tech'];
const SORT_OPTIONS = [
  { value: 'newest',   label: 'Newest' },
  { value: 'popular',  label: 'Popular' },
  { value: 'trending', label: 'Trending' },
];

const CommunityPage = () => {
  const [tab, setTab]           = useState('feed');       // 'feed' | 'explore' | 'bookmarks'
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Explore filters
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort]         = useState('newest');

  const feed    = useCommunityFeed();
  const explore = useCommunityPosts({ search, category: category !== 'All' ? category : undefined, sort });

  const handleCreatePost = async (data) => {
    setFormLoading(true);
    try {
      await communityService.createPost(data);
      toast.success('Post published!');
      setShowForm(false);
      feed.reload();
      explore.reload();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to publish post');
    } finally {
      setFormLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await communityService.toggleLike(postId);
      feed.reload();
      explore.reload();
    } catch (err) {
      toast.error('Failed to like post');
    }
  };

  const handleBookmark = async (postId) => {
    try {
      await communityService.toggleBookmark(postId);
      toast.success('Bookmark updated');
      feed.reload();
      explore.reload();
    } catch (err) {
      toast.error('Failed to update bookmark');
    }
  };

  const currentPosts = tab === 'feed' ? feed.posts : explore.posts;
  const currentLoading = tab === 'feed' ? feed.loading : explore.loading;
  const currentError   = tab === 'feed' ? feed.error   : explore.error;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-outfit text-2xl font-bold text-slate-900 dark:text-white">Community</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Connect, share, and grow together
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      {/* Create Post Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Create post">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg p-6">
            <h2 className="font-outfit text-lg font-bold text-slate-900 dark:text-white mb-5">Create a Post</h2>
            <PostForm
              onSubmit={handleCreatePost}
              onCancel={() => setShowForm(false)}
              loading={formLoading}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
        {[
          { key: 'feed',      icon: Home,     label: 'Feed' },
          { key: 'explore',   icon: Search,   label: 'Explore' },
          { key: 'bookmarks', icon: Bookmark, label: 'Bookmarks' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 flex-1 justify-center py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
              tab === t.key
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Explore Filters */}
      {tab === 'explore' && (
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
              aria-label="Search posts"
            />
          </div>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
            aria-label="Filter by category"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
            aria-label="Sort posts"
          >
            {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      )}

      {/* Posts Grid */}
      {currentError && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl px-4 py-3">
          <p className="text-sm text-rose-600 dark:text-rose-400">{currentError}</p>
        </div>
      )}

      {currentLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-56 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : currentPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {tab === 'feed' ? 'Your feed is empty.' : tab === 'bookmarks' ? 'No bookmarks yet.' : 'No posts found.'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {tab === 'feed' ? 'Follow people or explore posts to build your feed.' : 'Start exploring and bookmarking posts.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {currentPosts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              onLike={handleLike}
              onBookmark={handleBookmark}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
