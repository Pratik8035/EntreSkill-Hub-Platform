import React, { useState } from 'react';
import { MessageCircle, Reply, Trash2, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * CommentItem — renders a single comment with optional replies
 */
const CommentItem = ({ comment, onDelete, onReply }) => {
  const { user } = useAuth();
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying]   = useState(false);

  const isOwn = user?._id === comment.authorId?._id || user?._id === comment.authorId;

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      await onReply(replyText.trim(), comment._id);
      setReplyText('');
      setShowReply(false);
    } finally {
      setReplying(false);
    }
  };

  const initials = comment.authorId?.name
    ? comment.authorId.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  return (
    <div className="flex gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary-400 to-secondary-400 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl px-3 py-2">
          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
            {comment.authorId?.name || 'Unknown'}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {comment.content}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-1 px-1">
          <span className="text-[10px] text-slate-400">
            {new Date(comment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
          {onReply && (
            <button
              onClick={() => setShowReply(!showReply)}
              className="text-[10px] text-slate-400 hover:text-primary-500 flex items-center gap-0.5 transition-colors"
            >
              <Reply className="w-3 h-3" />
              Reply
            </button>
          )}
          {isOwn && onDelete && (
            <button
              onClick={() => onDelete(comment._id)}
              className="text-[10px] text-slate-400 hover:text-rose-500 flex items-center gap-0.5 transition-colors"
              aria-label="Delete comment"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          )}
        </div>

        {/* Reply input */}
        {showReply && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 text-xs px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
              onKeyDown={e => { if (e.key === 'Enter') handleReply(); }}
            />
            <button
              onClick={handleReply}
              disabled={replying || !replyText.trim()}
              className="text-primary-500 hover:text-primary-600 disabled:opacity-40 transition-colors"
              aria-label="Send reply"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Replies */}
        {comment.replies?.length > 0 && (
          <div className="mt-2 space-y-2 pl-2 border-l-2 border-slate-100 dark:border-slate-700">
            {comment.replies.map(reply => (
              <CommentItem key={reply._id} comment={reply} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * CommentList — Sprint 11
 * Full comment thread for a post.
 *
 * Props:
 *   comments   {array}  — list of comments with optional replies
 *   onAdd      {fn}     — async fn(content, parentId?) called to add a comment
 *   onDelete   {fn}     — async fn(commentId) called to delete
 *   loading    {bool}
 */
const CommentList = ({ comments = [], onAdd, onDelete, loading = false }) => {
  const [text, setText]       = useState('');
  const [adding, setAdding]   = useState(false);

  const handleAdd = async () => {
    if (!text.trim()) return;
    setAdding(true);
    try {
      await onAdd(text.trim());
      setText('');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-primary-500" />
        Comments ({comments.length})
      </h3>

      {/* Add comment */}
      <div className="flex gap-2.5">
        <div className="flex-1">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write a comment..."
            rows={2}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white placeholder-slate-400 resize-none"
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd(); } }}
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={adding || !text.trim()}
          className="self-end px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl transition-colors"
          aria-label="Post comment"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onDelete={onDelete}
              onReply={onAdd}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentList;
