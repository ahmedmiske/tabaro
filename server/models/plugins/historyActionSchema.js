// server/models/plugins/historyActionSchema.js
const mongoose = require("mongoose");

const HistoryActionSchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // create / user_stop / user_reactivate / admin_toggle / admin_delete / system_expire ...

    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    role: {
      type: String,
      enum: ["user", "admin", "system"],
      default: "user",
    },

    fromStatus: { type: String },
    toStatus: { type: String },

    reason: { type: String }, // سبب رسمي
    note: { type: String },   // ملاحظة إضافية

    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

module.exports = HistoryActionSchema;
