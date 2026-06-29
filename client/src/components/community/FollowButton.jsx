import React, { useState } from 'react';
import { UserPlus, UserMinus, UserCheck } from 'lucide-react';

/**
 * FollowButton — Sprint 11
 * Toggle follow/unfollow for a user.
 *
 * Props:
 *   isFollowing  {bool}
 *   onFollow     {fn}   — async fn to follow
 *   onUnfollow   {fn}   — async fn to unfollow
 *   size         {'sm'|'md'}  default 'md'
 */
const FollowButton = ({ isFollowing, onFollow, onUnfollow, size = 'md' }) => {
  const [loading, setLoading]     = useState(false);
  const [hovered, setHovered]     = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      if (isFollowing) await onUnfollow();
      else await onFollow();
    } finally {
      setLoading(false);
    }
  };

  const sizeClass = size === 'sm'
    ? 'text-[11px] px-3 py-1.5 gap-1'
    : 'text-xs px-4 py-2 gap-1.5';

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  if (isFollowing) {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`flex items-center font-semibold rounded-xl transition-all disabled:opacity-50 ${sizeClass} ${
          hovered
            ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 border border-rose-200 dark:border-rose-800'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
        }`}
        aria-label="Unfollow"
      >
        {hovered
          ? <><UserMinus className={iconSize} />{loading ? 'Unfollowing...' : 'Unfollow'}</>
          : <><UserCheck className={iconSize} />Following</>
        }
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center font-semibold rounded-xl transition-all disabled:opacity-50 bg-primary-600 hover:bg-primary-700 text-white ${sizeClass}`}
      aria-label="Follow"
    >
      <UserPlus className={iconSize} />
      {loading ? 'Following...' : 'Follow'}
    </button>
  );
};

export default FollowButton;
