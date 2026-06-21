import api from './api.js';

const analyticsService = {
  getDashboard: async () => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },

  getProfileProgress: async () => {
    const response = await api.get('/profile/progress');
    return response.data;
  },
};

export default analyticsService;
