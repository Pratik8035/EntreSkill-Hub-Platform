import api from './api.js';

const mentorSessionService = {
  bookSession: async (data) => {
    const response = await api.post('/mentor-sessions', data);
    return response.data;
  },

  getUpcomingSessions: async () => {
    const response = await api.get('/mentor-sessions/upcoming');
    return response.data;
  },

  getCompletedSessions: async () => {
    const response = await api.get('/mentor-sessions/completed');
    return response.data;
  },

  getSession: async (id) => {
    const response = await api.get(`/mentor-sessions/${id}`);
    return response.data;
  },

  cancelSession: async (id, reason = '') => {
    const response = await api.patch(`/mentor-sessions/${id}/cancel`, { reason });
    return response.data;
  },

  confirmSession: async (id) => {
    const response = await api.patch(`/mentor-sessions/${id}/confirm`);
    return response.data;
  },

  completeSession: async (id, notes = '') => {
    const response = await api.patch(`/mentor-sessions/${id}/complete`, { notes });
    return response.data;
  },

  updateNotes: async (id, notes) => {
    const response = await api.patch(`/mentor-sessions/${id}/notes`, { notes });
    return response.data;
  },
};

export default mentorSessionService;
