const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const messageController = require('../controllers/messageController');

// All routes require authentication
router.use(authMiddleware);

// Send message
router.post('/apps/:appId/send', messageController.sendMessage);

// Get messages for app
router.get('/apps/:appId/messages', messageController.getMessages);

// Get conversation with specific phone number
router.get('/apps/:appId/conversation/:phoneNumber', messageController.getConversation);

// Get message statistics
router.get('/apps/:appId/stats', messageController.getMessageStats);

// Mark message as read
router.put('/:messageId/read', messageController.markAsRead);

module.exports = router;
