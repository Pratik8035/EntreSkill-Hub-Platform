// src/services/courseService.js
// Service for course, lesson, quiz, and certificate APIs

import api from './api';

const courseService = {
  // Courses
  getCourses: async (params = {}) => {
    const response = await api.get('/courses', { params });
    return response.data.data;
  },

  getCourseById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data.data;
  },

  getCourseModules: async (id) => {
    const response = await api.get(`/courses/${id}/modules`);
    return response.data.data;
  },

  // Lessons
  getLessonById: async (id) => {
    const response = await api.get(`/lessons/${id}`);
    return response.data.data;
  },

  markLessonComplete: async (id) => {
    const response = await api.post(`/lessons/${id}/complete`);
    return response.data.data;
  },

  // Progress
  getCourseProgress: async (id) => {
    const response = await api.get(`/courses/${id}/progress`);
    return response.data.data;
  },

  getDashboardProgress: async () => {
    const response = await api.get('/learning/progress');
    return response.data.data;
  },

  // Quizzes
  getQuizById: async (id) => {
    const response = await api.get(`/quizzes/${id}`);
    return response.data.data;
  },

  submitQuiz: async (id, answers) => {
    const response = await api.post(`/quizzes/${id}/submit`, { answers });
    return response.data.data;
  },

  getQuizHistory: async (quizId = null) => {
    const params = quizId ? { quizId } : {};
    const response = await api.get('/quizzes/history', { params });
    return response.data.data;
  },

  getQuizStatistics: async (quizId = null) => {
    const params = quizId ? { quizId } : {};
    const response = await api.get('/quizzes/statistics', { params });
    return response.data.data;
  },

  // Certificates
  generateCertificate: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/certificate`);
    return response.data.data;
  },

  verifyCertificate: async (certificateNumber) => {
    const response = await api.get(`/certificates/${certificateNumber}`);
    return response.data.data;
  },

  getUserCertificates: async () => {
    const response = await api.get('/certificates');
    return response.data.data;
  },
};

export default courseService;
