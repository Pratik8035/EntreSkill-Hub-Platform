import api from './api.js';

const roadmapService = {
  getRoadmap: async (businessIdeaId) => {
    const response = await api.get(`/roadmaps/${businessIdeaId}`);
    return response.data;
  },
};

export default roadmapService;
