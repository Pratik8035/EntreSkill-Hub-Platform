import api from './api.js';

const schemeService = {
  /**
   * Get all government schemes with optional filters
   * @param {object} params - search, category, state
   */
  getSchemes: async (params = {}) => {
    const response = await api.get('/schemes', { params });
    return response.data;
  },

  /**
   * Get personalized recommended schemes for the logged-in user
   */
  getRecommendedSchemes: async () => {
    const response = await api.get('/schemes/recommended');
    return response.data;
  },

  /**
   * Check eligibility for a specific scheme
   * @param {string} schemeId
   */
  checkEligibility: async (schemeId) => {
    const response = await api.get(`/schemes/check-eligibility/${schemeId}`);
    return response.data;
  },

  /**
   * Get all commercial funding options with optional filters
   * @param {object} params - search, industry, provider
   */
  getFundingPrograms: async (params = {}) => {
    const response = await api.get('/funding', { params });
    return response.data;
  },

  /**
   * Get personalized recommended funding programs
   */
  getRecommendedFunding: async () => {
    const response = await api.get('/funding/recommended');
    return response.data;
  },
};

export default schemeService;
