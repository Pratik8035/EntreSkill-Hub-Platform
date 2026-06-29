import { useState, useEffect, useCallback } from 'react';
import chatService from '../services/chatService';

/**
 * useConversations — lists all conversations for the current user
 */
export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [convRes, unreadRes] = await Promise.all([
        chatService.getConversations(),
        chatService.getTotalUnread(),
      ]);
      setConversations(convRes.data || []);
      setUnreadCount(unreadRes.data?.unreadCount || 0);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startConversation = async (userId) => {
    const res = await chatService.getOrCreateConversation(userId);
    const convo = res.data;
    setConversations(prev => {
      const exists = prev.find(c => c._id === convo._id);
      if (exists) return prev;
      return [convo, ...prev];
    });
    return convo;
  };

  return { conversations, unreadCount, loading, error, reload: load, startConversation };
}

/**
 * useMessages — manages messages in a single conversation
 */
export function useMessages(conversationId) {
  const [messages, setMessages] = useState([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const load = useCallback(async (p = 1) => {
    if (!conversationId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await chatService.getMessages(conversationId, { page: p, limit: 30 });
      const data = res.data;
      setMessages(data.messages || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(p);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => { load(1); }, [load]);

  const sendMessage = async (content) => {
    const res = await chatService.sendMessage(conversationId, content);
    const message = res.data;
    setMessages(prev => [...prev, message]);
    setTotal(prev => prev + 1);
    return message;
  };

  const deleteMessage = async (messageId) => {
    await chatService.deleteMessage(messageId);
    setMessages(prev => prev.filter(m => m._id !== messageId));
  };

  return { messages, total, pages, page, loading, error, reload: load, sendMessage, deleteMessage };
}
