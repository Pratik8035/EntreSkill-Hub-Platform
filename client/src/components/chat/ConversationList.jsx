import React from 'react';
import { MessageSquare, Circle } from 'lucide-react';

/**
 * ConversationList — Sprint 11
 * Sidebar list of all conversations.
 *
 * Props:
 *   conversations     {array}   — list of conversation objects
 *   selectedId        {string}  — currently selected conversation id
 *   onSelect          {fn}      — called with conversation object
 *   loading           {bool}
 */
const ConversationList = ({ conversations = [], selectedId, onSelect, loading = false }) => {
  if (loading) {
    return (
      <div className="space-y-2 p-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
        <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-xs text-slate-400">No conversations yet.</p>
        <p className="text-[11px] text-slate-400 mt-1">Start chatting from a user's profile or the community.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {conversations.map(convo => {
        const other  = convo.otherParticipant;
        const initials = other?.name
          ? other.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
          : '??';
        const unread = convo.unreadCount || 0;
        const isSelected = convo._id === selectedId;

        return (
          <button
            key={convo._id}
            onClick={() => onSelect(convo)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
              isSelected
                ? 'bg-primary-50 dark:bg-primary-900/20'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
            aria-label={`Conversation with ${other?.name || 'Unknown'}`}
            aria-current={isSelected ? 'true' : undefined}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-400 to-secondary-400 text-white text-xs font-bold flex items-center justify-center">
                {initials}
              </div>
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-xs font-semibold truncate ${
                  isSelected ? 'text-primary-700 dark:text-primary-400' : 'text-slate-800 dark:text-slate-200'
                }`}>
                  {other?.name || 'Unknown User'}
                </p>
                <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">
                  {convo.lastMessageAt
                    ? new Date(convo.lastMessageAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                    : ''}
                </span>
              </div>
              <p className={`text-[11px] truncate mt-0.5 ${
                unread > 0
                  ? 'text-slate-600 dark:text-slate-300 font-semibold'
                  : 'text-slate-400 dark:text-slate-500'
              }`}>
                {convo.lastMessage || 'No messages yet'}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ConversationList;
