// server/models/DonationRequest.js
const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema(
  {
    method: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true }, // 8 أرقام
  },
  { _id: false }
);

const contactMethodSchema = new mongoose.Schema(
  {
    method: { type: String, required: true, trim: true }, // phone | whatsapp | ...
    number: { type: String, required: true, trim: true }, // 8 أرقام
  },
  { _id: false }
);

const donationRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // أساسي
    category: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // الموقع
    place: { type: String, required: true, trim: true },

    // مالية (اختياري)
    amount: { type: Number, default: 0 },

    // دائمًا مصفوفة
    paymentMethods: {
      type: [paymentMethodSchema],
      default: [],
    },

    // تواصل
    contactMethods: {
      type: [contactMethodSchema],
      default: [],
    },

    // مهلة واستعجال
    deadline: { type: Date },
    isUrgent: { type: Boolean, default: false },

    // دم/اختياري
    bloodType: { type: String, trim: true },

    // ملفات مرفوعة (مسارات)
    proofDocuments: {
      type: [String],
      default: [],
    },

    // وقت الإنشاء (قديم)
    date: { type: Date, default: Date.now },

    status: {
      type: String,
      enum: ["active", "paused", "completed", "cancelled"],
      default: "active",
    },

    // ⬇️ جديد: معلومات إيقاف النشر
    closedReason: { type: String, trim: true },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.DonationRequest ||
  mongoose.model("DonationRequest", donationRequestSchema);
