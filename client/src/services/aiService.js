// src/services/aiService.js
// Frontend service to wrap AI Mentor Assistant endpoints

import api from './api.js';

const aiService = {
  // Get all chat sessions for the logged-in user
  getSessions: async () => {
    const response = await api.get('/ai/sessions');
    return response.data;
  },

  // Create a new chat session (optional businessIdeaId and title)
  createSession: async (businessIdeaId = null, title = null) => {
    const response = await api.post('/ai/sessions', { businessIdeaId, title });
    return response.data;
  },

  // Get a single session details
  getSessionDetails: async (sessionId) => {
    const response = await api.get(`/ai/sessions/${sessionId}`);
    return response.data;
  },

  // Delete a chat session and its messages
  deleteSession: async (sessionId) => {
    const response = await api.delete(`/ai/sessions/${sessionId}`);
    return response.data;
  },

  // Get paginated messages for a session
  getMessages: async (sessionId, page = 1, limit = 50) => {
    const response = await api.get(`/ai/sessions/${sessionId}/messages`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Post a user message and get AI response
  sendMessage: async (sessionId, content) => {
    const response = await api.post(`/ai/sessions/${sessionId}/message`, { content });
    return response.data;
  },
};

export default aiService;
