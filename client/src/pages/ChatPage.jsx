import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useConversations, useMessages } from '../hooks/useChat';
import { useAuth } from '../context/AuthContext';
import ConversationList from '../components/chat/ConversationList';
import MessageThread from '../components/chat/MessageThread';
import toast from 'react-hot-toast';

const ChatPage = () => {
  const { user }                            = useAuth();
  const conversations                       = useConversations();
  const [selectedConvo, setSelectedConvo]   = useState(null);
  const messages                            = useMessages(selectedConvo?._id);

  const otherUser = selectedConvo?.participants?.find(
    p => (p._id || p) !== user?._id
  );

  const handleSelectConvo = (convo) => {
    setSelectedConvo(convo);
  };

  const handleSend = async (content) => {
    try {
      await messages.sendMessage(content);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send message');
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await messages.deleteMessage(messageId);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete message');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-outfit text-2xl font-bold text-slate-900 dark:text-white">Messages</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Direct messages with mentors and community members
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex h-[calc(100vh-240px)] min-h-80">
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0 border-r border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Conversations
              {conversations.unreadCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-primary-600 text-white text-[10px] font-bold rounded-full">
                  {conversations.unreadCount}
                </span>
              )}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={conversations.conversations}
              selectedId={selectedConvo?._id}
              onSelect={handleSelectConvo}
              loading={conversations.loading}
            />
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 min-w-0">
          {selectedConvo ? (
            <MessageThread
              messages={messages.messages}
              onSend={handleSend}
              onDelete={handleDelete}
              loading={messages.loading}
              otherUser={otherUser}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Select a conversation
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Choose a conversation from the sidebar to start messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
