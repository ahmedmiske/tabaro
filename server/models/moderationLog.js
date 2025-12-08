// server/models/moderationLog.js
const mongoose = require('mongoose');

const moderationLogSchema = new mongoose.Schema(
  {
    // نوع الهدف: طلب دم، طلب عام، عرض دم، عرض عام، أو مستخدم
    targetType: {
      type: String,
      required: true,
      enum: ['user', 'bloodRequest', 'generalRequest', 'bloodOffer', 'generalOffer'],
    },

    // معرف الهدف (id الخاص بالطلب أو العرض أو المستخدم)
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // نوع العملية: إيقاف، تفعيل، حذف، إلخ
    action: {
      type: String,
      required: true,
      enum: ['create', 'update', 'pause', 'resume', 'delete', 'autoExpire'],
    },

    // من قام بالعملية (أدمن أو صاحب الطلب)
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // دور الفاعل: admin أو owner (صاحب الطلب/العرض) أو system
    performedByRole: {
      type: String,
      enum: ['admin', 'owner', 'system'],
      default: 'admin',
    },

    // السبب الذي يكتبه الأدمن أو المستخدم
    reason: {
      type: String,
      trim: true,
    },

    // بيانات إضافية اختيارية (مثلاً الحالة القديمة والجديدة)
    meta: {
      type: Object,
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: false, // لا نحتاج updatedAt في اللوج
    },
  },
);

module.exports = mongoose.model('ModerationLog', moderationLogSchema);
