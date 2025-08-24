const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
    senderName: { type: String },

    // ✅ روابط اختيارية
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodRequest" },
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DonationConfirmation",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Message", messageSchema);
// This model defines the structure of a message in the database.
// It includes fields for sender, recipient, content, read status, timestamp, and optional references
