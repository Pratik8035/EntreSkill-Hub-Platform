import api from './api.js';

const chatService = {
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  getOrCreateConversation: async (userId) => {
    const response = await api.post(`/chat/conversations/${userId}`);
    return response.data;
  },

  getMessages: async (conversationId, params = {}) => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`, { params });
    return response.data;
  },

  sendMessage: async (conversationId, content) => {
    const response = await api.post(`/chat/conversations/${conversationId}/messages`, { content });
    return response.data;
  },

  getTotalUnread: async () => {
    const response = await api.get('/chat/unread');
    return response.data;
  },

  deleteMessage: async (messageId) => {
    const response = await api.delete(`/chat/messages/${messageId}`);
    return response.data;
  },
};

export default chatService;
