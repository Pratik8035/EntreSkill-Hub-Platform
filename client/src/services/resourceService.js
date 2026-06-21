import api from './api.js';

const resourceService = {
  getResources: async (businessIdeaId) => {
    const response = await api.get(`/resources/${businessIdeaId}`);
    return response.data;
  },
};

export default resourceService;
