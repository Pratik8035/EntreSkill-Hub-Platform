'use strict';
/**
 * mentorSessionRoutes.js — Sprint 11
 * Routes for mentor session booking, management, and history.
 */

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/mentorSessionController');

// POST /api/mentor-sessions         — book a session
router.post('/',              protect, ctrl.bookSession);

// GET  /api/mentor-sessions/upcoming
router.get('/upcoming',       protect, ctrl.getUpcomingSessions);

// GET  /api/mentor-sessions/completed
router.get('/completed',      protect, ctrl.getCompletedSessions);

// GET    /api/mentor-sessions/:id
// PATCH  /api/mentor-sessions/:id/cancel
// PATCH  /api/mentor-sessions/:id/confirm
// PATCH  /api/mentor-sessions/:id/complete
// PATCH  /api/mentor-sessions/:id/notes
router.get('/:id',             protect, ctrl.getSession);
router.patch('/:id/cancel',    protect, ctrl.cancelSession);
router.patch('/:id/confirm',   protect, ctrl.confirmSession);
router.patch('/:id/complete',  protect, ctrl.completeSession);
router.patch('/:id/notes',     protect, ctrl.updateNotes);

module.exports = router;
