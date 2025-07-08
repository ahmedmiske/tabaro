const express = require('express');
const router = express.Router();
const { sendMessage, getMessagesWithUser } = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

// Routes are protected by authentication middleware
router.post('/', protect, sendMessage);             // Send a message
router.get('/:userId', protect, getMessagesWithUser); // Get messages with specific user

module.exports = router;
// This file defines the routes for handling messages in the application.
// It includes routes for sending messages and retrieving messages with a specific user.