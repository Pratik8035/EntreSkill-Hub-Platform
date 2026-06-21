// src/services/interestService.js
// Service layer for interest‑related API calls. Uses the shared Axios instance (api.js).

import api from './api.js';

const interestService = {
  // GET /api/interests – fetch all interests (optional query params)
  getInterests: async (params = {}) => {
    const response = await api.get('/interests', { params });
    return response.data;
  },

  // GET /api/interests/categories – fetch interest categories
  getInterestCategories: async () => {
    const response = await api.get('/interests/categories');
    return response.data;
  },

  // POST /api/users/interests – save user selected interests (batch)
  saveUserInterests: async (interests) => {
    // payload must match SaveUserInterestsSchema: { interests: [{ interestId, preferenceWeight }] }
    const response = await api.post('/interests/users', { interests });
    return response.data;
  },

  // GET /api/users/interests – retrieve current user's saved interests
  getUserInterests: async () => {
    const response = await api.get('/interests/users');
    return response.data;
  },

  // PUT /api/users/interests – update previously saved interests (draft)
  updateUserInterests: async (interests) => {
    const response = await api.put('/interests/users', { interests });
    return response.data;
  },
};

export default interestService;
