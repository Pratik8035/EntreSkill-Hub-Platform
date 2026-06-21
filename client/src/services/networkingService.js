import api from './api.js';

const networkingService = {
  /**
   * Get all platform users annotated with connection status
   * @param {object} params - search, role, state, skill
   */
  getDirectoryUsers: async (params = {}) => {
    const response = await api.get('/network/users', { params });
    return response.data;
  },

  /**
   * Send a connection request to another user
   * @param {string} receiverId
   */
  sendConnection: async (receiverId) => {
    const response = await api.post('/network/connect', { receiverId });
    return response.data;
  },

  /**
   * Send a collaboration proposal to a connected contact
   * @param {string} receiverId
   * @param {string} projectTitle
   * @param {string} description
   */
  sendCollaboration: async (receiverId, projectTitle, description) => {
    const response = await api.post('/network/collaborate', { receiverId, projectTitle, description });
    return response.data;
  },

  /**
   * Get all accepted connections for the logged-in user
   */
  getConnections: async () => {
    const response = await api.get('/network/connections');
    return response.data;
  },

  /**
   * Get all pending incoming requests and sent collaboration proposals
   */
  getRequests: async () => {
    const response = await api.get('/network/requests');
    return response.data;
  },

  /**
   * Accept a connection or collaboration request
   * @param {string} id
   */
  acceptRequest: async (id) => {
    const response = await api.put(`/network/accept/${id}`);
    return response.data;
  },

  /**
   * Reject a connection or collaboration request
   * @param {string} id
   */
  rejectRequest: async (id) => {
    const response = await api.put(`/network/reject/${id}`);
    return response.data;
  },
};

export default networkingService;
