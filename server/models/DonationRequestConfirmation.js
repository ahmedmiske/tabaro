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

    method: {
      type: String,
      enum: ["phone", "whatsapp", "call", "chat"],
      default: "call",
    },
    proposedTime: { type: Date },

    // ⛔️ لا يوجد رفض — نفس منطق الدم
    status: {
      type: String,
      enum: ["pending", "accepted", "fulfilled", "rated"],
      default: "pending",
    },

    // إثباتات التحويل / التبرع (صور / PDF)
    proofFiles: { type: [String], default: [] },

    acceptedAt: { type: Date },
    fulfilledAt: { type: Date },

    ratingByDonor: { type: Number, min: 1, max: 5 },
    ratingByRecipient: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

donationRequestConfirmationSchema.index({ requestId: 1, createdAt: -1 });
donationRequestConfirmationSchema.index({ donor: 1, createdAt: -1 });

module.exports = mongoose.model(
  "DonationRequestConfirmation",
  donationRequestConfirmationSchema
);
