// server/models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, trim: true },
    message: { type: String, trim: true },
    type: { type: String, default: "system", trim: true }, // offer | message | system | ...
    referenceId: { type: mongoose.Schema.Types.Mixed, default: null },
    read: { type: Boolean, default: false },
    meta: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

notificationSchema.index(
  { userId: 1, type: 1, referenceId: 1 },
  { unique: true, sparse: true, name: "uniq_user_type_ref" }
);

module.exports = mongoose.model("Notification", notificationSchema);
