// Controller functions for handling messages
const Message = require('../models/message');

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { recipient, content } = req.body;

    // Validate inputs
    if (!recipient || !content) {
      return res.status(400).json({ message: 'Recipient and content are required.' });
    }

    // Create and save the message
    const message = new Message({
      sender: req.user._id, // from auth middleware
      recipient,
      content,
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error('Failed to send message:', error);
    res.status(500).json({ message: 'Server error while sending message.' });
  }
};

// @desc    Get all messages between two users
// @route   GET /api/messages/:userId
// @access  Private
const getMessagesWithUser = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.user._id;

    // Find all messages where current user is either sender or recipient
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: currentUserId },
      ],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Failed to retrieve messages:', error);
    res.status(500).json({ message: 'Error retrieving messages.' });
  }
};

module.exports = { sendMessage, getMessagesWithUser };
// @desc    Get recent threads for the current user
// @route   GET /api/messages/threads       