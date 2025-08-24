// Controller functions for handling messages
const Message = require("../models/message");
const Notification = require("../models/Notification");

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { recipient, content } = req.body;

    if (!recipient || !content) {
      return res
        .status(400)
        .json({ message: "Recipient and content are required." });
    }

    // 1️⃣ إنشاء الرسالة
    const message = new Message({
      sender: req.user._id,
      recipient,
      content,
    });

    await message.save();

    // 2️⃣ إنشاء إشعار للمُستلم
    const notification = new Notification({
      userId: recipient, // المستلم الصحيح
      sender: req.user._id, // ✅  ما  لا يكون
      title: "💬 رسالة جديدة",
      message: content,
      type: "message",
      referenceId: req.user._id,
    });
    console.log("🔔 Notification will be saved with sender:", req.user._id);

    await notification.save();
    console.log("🔔 Notification created with sender:", req.user._id);
    res.status(201).json(message);
  } catch (error) {
    console.error("❌ Failed to send message:", error);
    res.status(500).json({ message: "Server error while sending message." });
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
    console.error("Failed to retrieve messages:", error);
    res.status(500).json({ message: "Error retrieving messages." });
  }
};
// @desc    Get recent threads for the current user
// @route   GET /api/messages/threads
const getRecentThreads = async (req, res) => {
  const currentUserId = req.user._id;

  try {
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { recipient: currentUserId }],
    }).sort({ updatedAt: -1 }); // الأحدث أولاً

    // أنشئ قائمة من المحادثات مع مستخدمين مختلفين
    const threadsMap = new Map();

    messages.forEach((msg) => {
      const otherUser = msg.sender.equals(currentUserId)
        ? msg.recipient
        : msg.sender;
      if (!threadsMap.has(otherUser.toString())) {
        threadsMap.set(otherUser.toString(), msg);
      }
    });

    // اجلب معلومات المستخدمين المرتبطين بالمحادثات
    const populatedMessages = await Promise.all(
      [...threadsMap.values()].map(async (msg) => {
        await msg.populate("sender", "firstName lastName");
        await msg.populate("recipient", "firstName lastName");
        return msg;
      }),
    );

    res.json(populatedMessages);
  } catch (err) {
    console.error("❌ فشل في جلب المحادثات:", err.message);
    res.status(500).json({ message: "فشل في جلب المحادثات" });
  }
};

module.exports = {
  sendMessage,
  getMessagesWithUser,
  getRecentThreads,
};
// This file defines the controller functions for handling messages in the application.
// It includes functions for sending messages, retrieving messages with a specific user, and getting recent threads
