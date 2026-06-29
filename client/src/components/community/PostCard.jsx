import React, { useState } from 'react';
import { Heart, MessageCircle, Bookmark, Eye, Tag, MoreHorizontal, Share2 } from 'lucide-react';

/**
 * PostCard — Sprint 11
 * Displays a community post with like/bookmark actions.
 *
 * Props:
 *   post          {object}   — community post object
 *   onLike        {fn}       — called with post._id to toggle like
 *   onBookmark    {fn}       — called with post._id to toggle bookmark
 *   onClick       {fn}       — called when card is clicked (navigate to detail)
 */
const PostCard = ({ post, onLike, onBookmark, onClick }) => {
  const [likeLoading, setLikeLoading]       = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const authorInitials = post.authorId?.name
    ? post.authorId.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!onLike || likeLoading) return;
    setLikeLoading(true);
    try { await onLike(post._id); } finally { setLikeLoading(false); }
  };

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (!onBookmark || bookmarkLoading) return;
    setBookmarkLoading(true);
    try { await onBookmark(post._id); } finally { setBookmarkLoading(false); }
  };

  const categoryColor = {
    General:   'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    Business:  'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    Marketing: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
    Finance:   'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    Legal:     'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
    Tech:      'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
  };
  const catClass = categoryColor[post.category] || categoryColor.General;

  return (
    <div
      onClick={() => onClick && onClick(post._id)}
      className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 cursor-pointer group"
      role="article"
      aria-label={`Post by ${post.authorId?.name || 'Unknown'}`}
    >
      {/* Author row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-500 to-secondary-400 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
            {authorInitials}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {post.authorId?.name || 'Unknown'}
            </p>
            <p className="text-[10px] text-slate-400">
              {new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${catClass}`}>
          {post.category}
        </span>
      </div>

      {/* Title */}
      {post.title && (
        <h3 className="font-outfit text-sm font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">
          {post.title}
        </h3>
      )}

      {/* Content preview */}
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 mb-3">
        {post.content}
      </p>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="flex items-center gap-1 text-[10px] bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-150 dark:border-slate-700 px-2 py-0.5 rounded-full">
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
        <div className="flex items-center space-x-4">
          {/* Like */}
          <button
            onClick={handleLike}
            disabled={likeLoading}
            className={`flex items-center space-x-1.5 text-[11px] font-semibold transition-colors ${
              post.liked
                ? 'text-rose-500'
                : 'text-slate-400 dark:text-slate-500 hover:text-rose-500'
            }`}
            aria-label={post.liked ? 'Unlike post' : 'Like post'}
          >
            <Heart className={`w-3.5 h-3.5 ${post.liked ? 'fill-current' : ''}`} />
            <span>{post.likeCount || 0}</span>
          </button>

          {/* Comments */}
          <span className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{post.commentCount || 0}</span>
          </span>

          {/* Views */}
          <span className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            <Eye className="w-3.5 h-3.5" />
            <span>{post.viewCount || 0}</span>
          </span>
        </div>

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          disabled={bookmarkLoading}
          className={`transition-colors ${
            post.bookmarked
              ? 'text-amber-500'
              : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'
          }`}
          aria-label={post.bookmarked ? 'Remove bookmark' : 'Bookmark post'}
        >
          <Bookmark className={`w-4 h-4 ${post.bookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default PostCard;
