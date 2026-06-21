import React from 'react';
import { MessageSquare, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ChatSidebar = ({ sessions = [], currentSessionId, onSelectSession, onCreateSession, onDeleteSession }) => {
  return (
    <div className="w-80 border-r border-slate-150 dark:border-slate-800 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-4">
        <Link to="/dashboard" className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-450 hover:text-primary-600 dark:hover:text-primary-400 transition-colors space-x-1.5 group">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>
        <button
          onClick={() => onCreateSession(null)}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-2xl text-sm font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {sessions.length > 0 ? (
          sessions.map((session) => {
            const isSelected = session._id === currentSessionId;
            return (
              <div
                key={session._id}
                onClick={() => onSelectSession(session._id)}
                className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm text-primary-600 dark:text-primary-400 font-bold'
                    : 'text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-primary-500' : 'text-slate-400 dark:text-slate-500'}`} />
                  <div className="min-w-0">
                    <p className="text-xs truncate font-semibold leading-normal">{session.title}</p>
                    {session.lastMessage && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5 leading-normal">
                        {session.lastMessage}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session._id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-rose-600 dark:hover:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs">
            No chats started yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
