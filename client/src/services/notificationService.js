import api from './api';

// Sprint 9 — Notification Service

/**
 * Generate new in-app notifications for the current user by detecting execution events.
 * @returns {Promise<Notification[]>}
 */
export const generateNotifications = async () => {
  const res = await api.get('/notifications/generate');
  return res.data.data;
};

/**
 * List the 50 most recent notifications for the current user.
 * @returns {Promise<Notification[]>}
 */
export const listNotifications = async () => {
  const res = await api.get('/notifications');
  return res.data.data;
};

/**
 * Mark a notification as read.
 * @param {string} id  Notification ID
 * @returns {Promise<Notification>}
 */
export const markNotificationRead = async (id) => {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data.data;
};
