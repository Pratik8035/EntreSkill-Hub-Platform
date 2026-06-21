// src/services/assessmentService.js
// Service layer for assessment‑related API calls. Uses the shared Axios instance (api.js).

import api from './api.js';

const assessmentService = {
  // GET /api/assessment – retrieve full assessment data for the authenticated user
  getAssessment: async () => {
    const response = await api.get('/assessment');
    return response.data;
  },

  // GET /api/assessment/status – lightweight status used for redirects/guards
  getAssessmentStatus: async () => {
    const response = await api.get('/assessment/status');
    return response.data;
  },

  // POST /api/assessment – submit a complete assessment (skills, interests, experience)
  saveAssessment: async (payload) => {
    // payload must match SubmitAssessmentSchema:
    // { experienceLevel, skills: [{ skillId, proficiencyLevel }], interests: [{ interestId, preferenceWeight }] }
    const response = await api.post('/assessment', payload);
    return response.data;
  },

  // PUT /api/assessment – update an existing assessment (partial updates allowed)
  updateAssessment: async (payload) => {
    const response = await api.put('/assessment', payload);
    return response.data;
  },
};

export default assessmentService;
