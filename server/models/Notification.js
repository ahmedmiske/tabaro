const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    title:   { type: String, trim: true },
    message: { type: String, trim: true },

    // حرّ لتفادي مشاكل enum
    // أمثلة مستخدمة: 'message','offer','blood_donation_confirmation','donation_request_confirmation','report','system'
    type: { type: String, default: 'system', trim: true },

    // قد يكون ObjectId أو string
    referenceId: { type: mongoose.Schema.Types.Mixed, default: null },

    read: { type: Boolean, default: false },

    // بيانات إضافية اختيارية
    meta: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true } // createdAt / updatedAt
);

module.exports = mongoose.model('Notification', notificationSchema);
