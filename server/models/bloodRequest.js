const mongoose = require("mongoose");
const statusPlugin = require("./plugins/statusPlugin");
const HistoryActionSchema = require("./plugins/historyActionSchema");

const DocumentSchema = new mongoose.Schema(
  {
    originalName: String,
    filename: String, // الاسم على القرص
    mimeType: String,
    size: Number,
    url: String, // مسار الوصول الجاهز للواجهة /uploads/...
  },
  { _id: false }
);

const BloodRequestSchema = new mongoose.Schema(
  {
    bloodType: { type: String, required: true },

    isUrgent: { type: Boolean, default: false },

    // حالة قديمة (للتوافق)
    isActive: { type: Boolean, default: true },

    closedReason: { type: String, default: "" },
    closedAt: { type: Date, default: null },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    city: { type: String, default: "" },
    hospitalName: { type: String, default: "" },
    location: { type: String, default: "" },

    // التاريخ الذي يتم بعده اعتبار الطلب منتهي الصلاحية
    deadline: { type: Date, required: true },

    description: { type: String, default: "" },

    contactMethods: [{ method: String, number: String }],

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    documents: { type: [DocumentSchema], default: [] },
    files: { type: [String], default: [] },

    // ✅ حالة موحدة: active | paused | finished | cancelled
    status: {
      type: String,
      enum: ["active", "paused", "finished", "cancelled"],
      default: "active",
      index: true,
    },

    // ✅ أرشيف الحركات على الطلب
    historyActions: {
      type: [HistoryActionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// 🔌 Plugin لتحديث status تلقائياً إلى finished بعد انتهاء deadline
BloodRequestSchema.plugin(statusPlugin, { dateField: "deadline" });

module.exports =
  mongoose.models.BloodRequest ||
  mongoose.model("BloodRequest", BloodRequestSchema);
