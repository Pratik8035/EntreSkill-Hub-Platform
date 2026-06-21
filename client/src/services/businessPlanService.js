import api from './api';

export const generateBusinessPlan = async (businessIdeaId) => {
  const response = await api.post(`/business-plan/generate/${businessIdeaId}`);
  return response.data;
};

export const getBusinessPlan = async (businessIdeaId) => {
  const response = await api.get(`/business-plan/${businessIdeaId}`);
  return response.data;
};

export const getCostEstimate = async (businessIdeaId) => {
  const response = await api.get(`/business-plan/cost/${businessIdeaId}`);
  return response.data;
};

export const getRevenueProjection = async (businessIdeaId) => {
  const response = await api.get(`/business-plan/revenue/${businessIdeaId}`);
  return response.data;
};
