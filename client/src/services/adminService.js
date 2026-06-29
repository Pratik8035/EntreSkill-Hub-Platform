import api from './api.js';

const adminService = {
  // ── Dashboard ──────────────────────────────────────────────────────────────
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // ── Users ──────────────────────────────────────────────────────────────────
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },
  updateUser: async (id, data) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // ── Mentors ────────────────────────────────────────────────────────────────
  getMentors: async (params = {}) => {
    const response = await api.get('/admin/mentors', { params });
    return response.data;
  },
  updateMentor: async (id, data) => {
    const response = await api.put(`/admin/mentors/${id}`, data);
    return response.data;
  },
  deleteMentor: async (id) => {
    const response = await api.delete(`/admin/mentors/${id}`);
    return response.data;
  },

  // ── Business Ideas ─────────────────────────────────────────────────────────
  getBusinessIdeas: async (params = {}) => {
    const response = await api.get('/admin/business-ideas', { params });
    return response.data;
  },
  createBusinessIdea: async (data) => {
    const response = await api.post('/admin/business-ideas', data);
    return response.data;
  },
  updateBusinessIdea: async (id, data) => {
    const response = await api.put(`/admin/business-ideas/${id}`, data);
    return response.data;
  },
  deleteBusinessIdea: async (id) => {
    const response = await api.delete(`/admin/business-ideas/${id}`);
    return response.data;
  },

  // ── Government Schemes ────────────────────────────────────────────────────
  getSchemes: async (params = {}) => {
    const response = await api.get('/admin/schemes', { params });
    return response.data;
  },
  createScheme: async (data) => {
    const response = await api.post('/admin/schemes', data);
    return response.data;
  },
  updateScheme: async (id, data) => {
    const response = await api.put(`/admin/schemes/${id}`, data);
    return response.data;
  },
  deleteScheme: async (id) => {
    const response = await api.delete(`/admin/schemes/${id}`);
    return response.data;
  },

  // ── Funding Programs ──────────────────────────────────────────────────────
  getFunding: async (params = {}) => {
    const response = await api.get('/admin/funding', { params });
    return response.data;
  },
  createFunding: async (data) => {
    const response = await api.post('/admin/funding', data);
    return response.data;
  },
  updateFunding: async (id, data) => {
    const response = await api.put(`/admin/funding/${id}`, data);
    return response.data;
  },
  deleteFunding: async (id) => {
    const response = await api.delete(`/admin/funding/${id}`);
    return response.data;
  },

  // ── Courses ───────────────────────────────────────────────────────────────
  getCourses: async (params = {}) => {
    const response = await api.get('/admin/courses', { params });
    return response.data;
  },
  createCourse: async (data) => {
    const response = await api.post('/admin/courses', data);
    return response.data;
  },
  updateCourse: async (id, data) => {
    const response = await api.put(`/admin/courses/${id}`, data);
    return response.data;
  },
  deleteCourse: async (id) => {
    const response = await api.delete(`/admin/courses/${id}`);
    return response.data;
  },

  // ── Analytics ─────────────────────────────────────────────────────────────
  getAdminAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },
  getEnhancedAnalytics: async () => {
    const response = await api.get('/admin/analytics/enhanced');
    return response.data;
  },
};

export default adminService;
