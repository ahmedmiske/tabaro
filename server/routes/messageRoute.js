const express = require("express");

const router = express.Router();
const {
  sendMessage,
  getMessagesWithUser,
  getRecentThreads,
} = require("../controllers/messageController");
const { protect } = require("../middlewares/authMiddleware");

// Routes are protected by authentication middleware
router.post("/", protect, sendMessage); // Send a message
router.get("/:userId", protect, getMessagesWithUser); // Get messages with specific user
router.get("/threads", protect, getRecentThreads);

module.exports = router;
// This file defines the routes for handling messages in the application.
// It includes routes for sending messages and retrieving messages with a specific user.
