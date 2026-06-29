'use strict';

// notificationController.js — Sprint 9 Phase 2

const asyncHandler = require('express-async-handler');
const NotificationService = require('../services/notificationService');
const { sendSuccess } = require('../utils/responseHandler');

/**
 * GET /api/notifications/generate
 * Detect execution events and create new in-app notifications for the user.
 */
const generateNotifications = asyncHandler(async (req, res) => {
  const notifications = await NotificationService.generateNotifications(req.user._id);
  sendSuccess(res, notifications, `${notifications.length} notification(s) generated`);
});

/**
 * GET /api/notifications
 * List the 50 most recent notifications for the authenticated user.
 */
const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await NotificationService.listNotifications(req.user._id);
  sendSuccess(res, notifications, 'Notifications retrieved successfully');
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read.
 */
const markRead = asyncHandler(async (req, res) => {
  const notification = await NotificationService.markRead(req.params.id, req.user._id);
  sendSuccess(res, notification, 'Notification marked as read');
});

module.exports = { generateNotifications, listNotifications, markRead };
