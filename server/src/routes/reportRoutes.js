'use strict';

// reportRoutes.js — Sprint 9 Phase 3

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/reportController');

// GET /api/reports — list available report types
router.get('/', protect, ctrl.listReports);

// GET /api/reports/:type — generate specific report
router.get('/:type', protect, ctrl.getReport);

module.exports = router;
