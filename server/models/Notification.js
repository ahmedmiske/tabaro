const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // ✅ جيد: يتم ربط المرسل بجدول المستخدمين
  },
  title: String,
  message: String,
  type: {
    type: String,
    enum: ['message', 'offer', 'system'], // ✅ خيارات واضحة
    default: 'system'
  },
  referenceId: String, // 🔄 يمكن أن تستخدمه لربط الإشعار بأي كيان مثل محادثة أو طلب
  read: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
// This model defines the structure of a notification in the database.
// It includes fields for the user ID, sender, title, message, type, reference ID, read status, and date.