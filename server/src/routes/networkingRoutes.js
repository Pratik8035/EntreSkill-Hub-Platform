const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getDirectoryUsers,
  connect,
  collaborate,
  getConnections,
  getRequests,
  acceptRequest,
  rejectRequest
} = require('../controllers/networkingController');

router.get('/users', protect, getDirectoryUsers);
router.post('/connect', protect, connect);
router.post('/collaborate', protect, collaborate);
router.get('/connections', protect, getConnections);
router.get('/requests', protect, getRequests);
router.put('/accept/:id', protect, acceptRequest);
router.put('/reject/:id', protect, rejectRequest);

module.exports = router;
