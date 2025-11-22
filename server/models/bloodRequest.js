// server/models/bloodRequest.js
const mongoose = require("mongoose");

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

    // ✅ مدينة / منطقة (اختياري)
    city: { type: String, default: "" },

    // ✅ اسم المستشفى (اختياري)
    hospitalName: { type: String, default: "" },

    // حقل عام قديم/حر (يقبل أي وصف للمكان – نحافظ عليه للتوافق)
    location: { type: String, default: "" },

    deadline: { type: Date, required: true },
    description: { type: String, default: "" },

    contactMethods: [{ method: String, number: String }],

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // الحقل المعتمد لعرض الوثائق:
    documents: { type: [DocumentSchema], default: [] },

    // (اختياري) توافق للخلف — لو موجودة في سجلات قديمة
    files: { type: [String], default: [] },
  },
  { timestamps: true }
);

// ✅ هذا يمنع OverwriteModelError
module.exports =
  mongoose.models.BloodRequest ||
  mongoose.model("BloodRequest", BloodRequestSchema);
