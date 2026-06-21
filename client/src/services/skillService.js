// src/services/skillService.js
// Service layer for skill‑related API calls. Uses the shared Axios instance (api.js).

import api from './api.js';

const skillService = {
  // GET /api/skills – fetch all skills (with optional query params)
  getSkills: async (params = {}) => {
    const response = await api.get('/skills', { params });
    return response.data;
  },

  // GET /api/skills/categories – fetch skill categories
  getSkillCategories: async () => {
    const response = await api.get('/skills/categories');
    return response.data;
  },

  // POST /api/users/skills – save user selected skills (batch)
  saveUserSkills: async (skills) => {
    // payload must match SaveUserSkillsSchema: { skills: [{ skillId, proficiencyLevel }] }
    const response = await api.post('/skills/users', { skills });
    return response.data;
  },

  // GET /api/users/skills – retrieve current user's saved skills
  getUserSkills: async () => {
    const response = await api.get('/skills/users');
    return response.data;
  },

  // PUT /api/users/skills – update previously saved skills (draft)
  updateUserSkills: async (skills) => {
    const response = await api.put('/skills/users', { skills });
    return response.data;
  },
};

export default skillService;
