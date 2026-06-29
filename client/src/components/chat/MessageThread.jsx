import React, { useEffect, useRef, useState } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * MessageBubble — single message display
 */
const MessageBubble = ({ message, isOwn, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isOwn && (
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-slate-400 to-slate-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mb-1">
          {message.senderId?.name?.charAt(0).toUpperCase() || '?'}
        </div>
      )}

      {/* Bubble */}
      <div
        className={`relative max-w-[70%] group`}
        onMouseEnter={() => setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}
      >
        <div className={`px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
          isOwn
            ? 'bg-primary-600 text-white rounded-br-sm'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm'
        }`}>
          {message.content}
        </div>
        <p className={`text-[9px] mt-0.5 ${isOwn ? 'text-right text-slate-400' : 'text-slate-400'}`}>
          {new Date(message.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>

        {/* Delete (own messages only) */}
        {isOwn && onDelete && showMenu && (
          <button
            onClick={() => onDelete(message._id)}
            className="absolute -top-2 -left-6 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-slate-400 hover:text-rose-500 transition-colors"
            aria-label="Delete message"
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * MessageThread — Sprint 11
 * Chat message thread with send input.
 *
 * Props:
 *   messages    {array}   — sorted oldest→newest
 *   onSend      {fn}      — async fn(content) to send message
 *   onDelete    {fn}      — async fn(messageId) to delete
 *   loading     {bool}
 *   otherUser   {object}  — { name } for header display
 */
const MessageThread = ({ messages = [], onSend, onDelete, loading = false, otherUser }) => {
  const { user } = useAuth();
  const [text, setText]       = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef             = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await onSend(text.trim());
      setText('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {otherUser && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-400 to-secondary-400 text-white text-xs font-bold flex items-center justify-center">
            {otherUser.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{otherUser.name}</p>
            <p className="text-[10px] text-slate-400">{otherUser.role || 'Member'}</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" role="log" aria-label="Message history" aria-live="polite">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
                <div className="h-10 w-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <p className="text-xs text-slate-400">No messages yet.</p>
            <p className="text-[11px] text-slate-400 mt-1">Say hello! 👋</p>
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwn={msg.senderId?._id === user?._id || msg.senderId === user?._id}
              onDelete={onDelete}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Send input */}
      <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-1.5">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none"
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            aria-label="Message input"
          />
          <button
            onClick={handleSend}
            disabled={sending || !text.trim()}
            className="text-primary-500 hover:text-primary-600 disabled:opacity-40 transition-colors flex-shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageThread;
