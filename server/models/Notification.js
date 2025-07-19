const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },

  // ✅ نوع الإشعار: message | offer | system | alert ...
  type: {
    type: String,
    enum: ['message', 'offer', 'system', 'alert'],
    default: 'system'
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
// This model represents notifications in the system.
// It includes fields for user ID, title, message, read status, date, and type