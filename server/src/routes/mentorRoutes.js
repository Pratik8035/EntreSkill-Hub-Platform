const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  listMentors,
  getRecommendedMentors,
  getMentorById,
  requestMentor,
  getPendingRequests,
  acceptRequest,
  rejectRequest,
  getAssignments,
  getEntrepreneurMentorStatus
} = require('../controllers/mentorController');

router.get('/', protect, listMentors);
router.get('/recommended', protect, getRecommendedMentors);
router.get('/requests/pending', protect, getPendingRequests);
router.get('/assignments', protect, getAssignments);
router.get('/my-status', protect, getEntrepreneurMentorStatus);
router.get('/:id', protect, getMentorById);
router.post('/request', protect, requestMentor);
router.put('/requests/:requestId/accept', protect, acceptRequest);
router.put('/requests/:requestId/reject', protect, rejectRequest);

module.exports = router;
