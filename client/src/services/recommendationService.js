// src/services/recommendationService.js
import api from './api.js';

const recommendationService = {
  // Get list of recommended business ideas
  getRecommendations: async () => {
    const response = await api.get('/recommendations');
    return response.data;
  },

  // Get details for a specific recommendation
  getRecommendationDetails: async (id) => {
    const response = await api.get(`/recommendations/${id}`);
    return response.data;
  }
};

export default recommendationService;
