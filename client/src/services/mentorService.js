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
};

export default mentorService;
