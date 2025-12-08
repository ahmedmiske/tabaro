const mongoose = require("mongoose");
const statusPlugin = require("./plugins/statusPlugin");
const HistoryActionSchema = require("./plugins/historyActionSchema");

const paymentMethodSchema = new mongoose.Schema(
  {
    method: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const contactMethodSchema = new mongoose.Schema(
  {
    method: { type: String, required: true, trim: true },
    number: { type: String, required: true, trim: true },
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

    category: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    place: { type: String, required: true, trim: true },

    amount: { type: Number, default: 0 },

    paymentMethods: {
      type: [paymentMethodSchema],
      default: [],
    },

    contactMethods: {
      type: [contactMethodSchema],
      default: [],
    },

    deadline: { type: Date },
    isUrgent: { type: Boolean, default: false },

    bloodType: { type: String, trim: true },

    proofDocuments: {
      type: [String],
      default: [],
    },

    date: { type: Date, default: Date.now },

    status: {
      type: String,
      enum: ["active", "paused", "finished", "cancelled"],
      default: "active",
      index: true,
    },

    closedReason: { type: String, trim: true },
    closedAt: { type: Date },

    // ✅ الأرشيف
    historyActions: {
      type: [HistoryActionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Plugin: يحدد finished بناءً على deadline
donationRequestSchema.plugin(statusPlugin, { dateField: "deadline" });

module.exports =
  mongoose.models.DonationRequest ||
  mongoose.model("DonationRequest", donationRequestSchema);
