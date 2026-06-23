// src/services/fundingAdvisorService.js
// Frontend service for the Funding Advisor API (Sprint 5 Phase 5)

import api from './api.js';

const fundingAdvisorService = {
  /**
   * GET /api/funding/advisor
   * Returns { eligibility, recommendations, advisorSummary }
   */
  getAdvisor: async () => {
    const response = await api.get('/funding/advisor');
    return response.data;
  },

  /**
   * GET /api/funding/eligibility
   * Returns { eligibleSchemes, partiallyEligibleSchemes, notEligibleSchemes }
   */
  getEligibility: async () => {
    const response = await api.get('/funding/eligibility');
    return response.data;
  },

  /**
   * GET /api/funding/recommendations
   * Returns { recommendations, totalMatches }
   */
  getRecommendations: async () => {
    const response = await api.get('/funding/recommendations');
    return response.data;
  },
};

export default fundingAdvisorService;
