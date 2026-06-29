import api from './api.js';

const mentorService = {
  getMentors: async () => {
    const response = await api.get('/mentors');
    return response.data;
  },

  getRecommendedMentors: async () => {
    const response = await api.get('/mentors/recommended');
    return response.data;
  },

  getMentorById: async (id) => {
    const response = await api.get(`/mentors/${id}`);
    return response.data;
  },

  requestMentor: async (mentorId, message) => {
    const response = await api.post('/mentors/request', { mentorId, message });
    return response.data;
  },

  getPendingRequests: async () => {
    const response = await api.get('/mentors/requests/pending');
    return response.data;
  },

  acceptRequest: async (requestId) => {
    const response = await api.put(`/mentors/requests/${requestId}/accept`);
    return response.data;
  },

  rejectRequest: async (requestId) => {
    const response = await api.put(`/mentors/requests/${requestId}/reject`);
    return response.data;
  },

  getAssignments: async () => {
    const response = await api.get('/mentors/assignments');
    return response.data;
  },

  getEntrepreneurStatus: async () => {
    const response = await api.get('/mentors/my-status');
    return response.data;
  },
};

export default mentorService;
