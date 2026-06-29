'use strict';

// notificationRoutes.js — Sprint 9 Phase 2

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/notificationController');

// POST /api/notifications/generate — detect & create notifications
router.get('/generate', protect, ctrl.generateNotifications);

// GET /api/notifications — list notifications
router.get('/', protect, ctrl.listNotifications);

// PATCH /api/notifications/:id/read — mark as read
router.patch('/:id/read', protect, ctrl.markRead);

module.exports = router;
