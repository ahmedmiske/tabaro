const mongoose = require("mongoose");

const donationRequestConfirmationSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DonationRequest",
      required: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: { type: String, trim: true },
    amount: { type: Number, default: 0 },

    // ✅ أضفنا "chat" حتى لا يفشل الـenum
    method: {
      type: String,
      enum: ["phone", "whatsapp", "call", "chat"],
      default: "call",
    },
    proposedTime: { type: Date },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "in_progress", "completed"],
      default: "accepted", // بما أنك تريد قبولًا فوريًا
    },

    // مسارات ملفات الإثبات
    proofFiles: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "DonationRequestConfirmation",
  donationRequestConfirmationSchema
);
