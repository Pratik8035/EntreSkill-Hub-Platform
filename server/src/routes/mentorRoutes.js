const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { listMentors, getRecommendedMentors, getMentorById, requestMentor } = require('../controllers/mentorController');

router.get('/', protect, listMentors);
router.get('/recommended', protect, getRecommendedMentors);
router.get('/:id', protect, getMentorById);
router.post('/request', protect, requestMentor);

module.exports = router;
