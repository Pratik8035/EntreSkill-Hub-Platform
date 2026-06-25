const express = require('express');
const router = express.Router();
const {
  verifyCertificate,
  getUserCertificates,
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

// ─── Public Routes ─────────────────────────────────────────────────────────
router.get('/:certificateNumber', verifyCertificate);

// ─── Protected Routes ─────────────────────────────────────────────────────
router.get('/', protect, getUserCertificates);

module.exports = router;
