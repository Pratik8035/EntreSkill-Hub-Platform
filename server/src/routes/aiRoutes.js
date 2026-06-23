const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');
const aiController = require('../controllers/aiController');

// Create a new chat session
router.post('/sessions', protect, aiLimiter, aiController.createSession);

// Get all chat sessions for user
router.get('/sessions', protect, aiLimiter, aiController.getSessions);

// Get session details
router.get('/sessions/:id', protect, aiLimiter, aiController.getSession);

// Delete a session
router.delete('/sessions/:id', protect, aiLimiter, aiController.deleteSession);

// Get messages (paginated)
router.get('/sessions/:id/messages', protect, aiLimiter, aiController.getMessages);

// Get context snapshot for a session (must be declared before /:id/message)
router.get('/sessions/:id/context', protect, aiLimiter, aiController.getSessionContext);

// Post a message and get AI response
router.post('/sessions/:id/message', protect, aiLimiter, aiController.postMessage);

module.exports = router;
