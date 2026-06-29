import React, { useState } from 'react';
import { Send, X, Tag } from 'lucide-react';

const CATEGORIES = ['General', 'Business', 'Marketing', 'Finance', 'Legal', 'Tech'];

/**
 * PostForm — Sprint 11
 * Create / Edit community post form.
 *
 * Props:
 *   initialData  {object}  — for editing (optional)
 *   onSubmit     {fn}      — async fn called with form data
 *   onCancel     {fn}      — called when user cancels
 *   loading      {bool}    — disable submit while loading
 */
const PostForm = ({ initialData = {}, onSubmit, onCancel, loading = false }) => {
  const [title, setTitle]       = useState(initialData.title || '');
  const [content, setContent]   = useState(initialData.content || '');
  const [category, setCategory] = useState(initialData.category || 'General');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags]         = useState(initialData.tags || []);
  const [error, setError]       = useState('');

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => setTags(tags.filter(t => t !== tag));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) { setError('Post content is required'); return; }
    setError('');
    await onSubmit({ title: title.trim(), content: content.trim(), category, tags });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-3 py-2 rounded-xl" role="alert">
          {error}
        </p>
      )}

      {/* Title */}
      <div>
        <label htmlFor="post-title" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Title <span className="text-slate-400">(optional)</span>
        </label>
        <input
          id="post-title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Give your post a title..."
          maxLength={120}
          className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white placeholder-slate-400"
        />
      </div>

      {/* Content */}
      <div>
        <label htmlFor="post-content" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Content <span className="text-rose-400">*</span>
        </label>
        <textarea
          id="post-content"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Share your thoughts, experiences, or questions..."
          rows={5}
          maxLength={2000}
          className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white placeholder-slate-400 resize-none"
          required
        />
        <p className="text-[10px] text-slate-400 text-right mt-0.5">{content.length}/2000</p>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="post-category" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Category
        </label>
        <select
          id="post-category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Tags <span className="text-slate-400">(up to 5)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
            placeholder="Add a tag..."
            maxLength={30}
            className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white placeholder-slate-400"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl transition-colors text-xs font-semibold"
          >
            Add
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 text-[11px] bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full">
                <Tag className="w-2.5 h-2.5" />
                {tag}
                <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Send className="w-4 h-4" />
          {loading ? 'Publishing...' : initialData._id ? 'Update Post' : 'Publish Post'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default PostForm;
