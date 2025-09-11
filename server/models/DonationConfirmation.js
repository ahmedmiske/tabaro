const mongoose = require('mongoose');
const { Schema } = mongoose;

const DonationConfirmationSchema = new Schema(
  {
    // طرفا العملية
    donor:       { type: Schema.Types.ObjectId, ref: 'User', required: true },      // المتبرع
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },      // صاحب الطلب

    // مربوط بطلب الدم
    requestId:   { type: Schema.Types.ObjectId, ref: 'BloodRequest', required: true },

    // معلومات إضافية
    message:     { type: String, trim: true },

    // ✅ اختيارية مع افتراضي
    method: {
      type: String,
      enum: ['call', 'phone', 'whatsapp', 'chat'],
      default: 'chat',
    },

    proposedTime: { type: Date },

    // الحالة (لا يوجد "rejected")
    status:      { type: String, enum: ['pending', 'accepted', 'fulfilled', 'rated'], default: 'pending' },

    // تواريخ انتقال الحالة
    acceptedAt:  { type: Date },
    fulfilledAt: { type: Date },

    // تقييمات (اختياري)
    ratingByDonor:     { type: Number, min: 1, max: 5 },
    ratingByRecipient: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

// فهرسة مفيدة للاستعلامات المتكررة
DonationConfirmationSchema.index({ recipientId: 1, createdAt: -1 });
DonationConfirmationSchema.index({ donor: 1, createdAt: -1 });
DonationConfirmationSchema.index({ requestId: 1, createdAt: -1 });

// 👇 منع التكرار: متبرّع واحد لكل طلب
DonationConfirmationSchema.index({ requestId: 1, donor: 1 }, { unique: true });

module.exports = mongoose.model('DonationConfirmation', DonationConfirmationSchema);
