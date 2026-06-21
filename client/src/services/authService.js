// src/services/authService.js
// Centralized authentication service that leverages the shared Axios instance (api.js)
// This ensures Vite compatibility, token interceptor usage, and consistent 401 handling.

import api from './api.js';

const authService = {
  // Login with email/password. Returns the standardized response from the backend.
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Register a new user. Role defaults to "user" if not provided.
  register: async (name, email, password, role = 'user') => {
    const response = await api.post('/auth/register', { name, email, password, role });
    return response.data;
  },

  // Fetch the currently authenticated user's profile using the token interceptor.
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
