// server/models/ReadyToDonateBlood.js
const mongoose = require('mongoose');
const statusPlugin = require('./plugins/statusPlugin'); // تأكد من المسار الصحيح

const ContactMethodSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ['phone', 'whatsapp'],
      required: true,
    },
    number: { type: String, required: true },
  },
  { _id: false },
);

// 👇 سكيمة حركة الأرشيف (نفس الفكرة التي استعملناها في التبرع العام)
const HistoryActionSchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // create, user_stop, user_reactivate...
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    role: { type: String, default: null }, // user | admin ...
    fromStatus: { type: String, default: null },
    toStatus: { type: String, default: null },
    reason: { type: String, default: '' },
    note: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const ReadyToDonateBloodSchema = new mongoose.Schema(
  {
    // 👈 الموقع إلزامي (اسم البلدية / الحي) – يُحفظ كنص جاهز للعرض
    location: { type: String, required: true, trim: true },

    bloodType: {
      type: String,
      required: true,
      enum: ['A+', 'A-', 'B+', 'AB+', 'AB-', 'O+', 'O-', 'غير معروف', 'B-'],
      // تأكد أن نفس القائمة المستعملة في الفرونت
    },

    // 👈 آخر أجل لمهلة التبرع
    availableUntil: {
      type: Date,
      required: true,
    },

    note: { type: String, default: '' },

    contactMethods: {
      type: [ContactMethodSchema],
      default: [],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one contact method is required',
      },
    },

    // ✅ المستخدم صاحب الاستعداد
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // حقول اختيارية لمعلومة الإيقاف
    closedReason: { type: String },
    closedAt: { type: Date },

    // ✅ هنا الأرشيف
    historyActions: {
      type: [HistoryActionSchema],
      default: [],
    },
  },
  { timestamps: true, collection: 'ready_to_donate_blood' },
);

// 🔌 يجعل status = finished تلقائياً إذا تعدّى availableUntil
ReadyToDonateBloodSchema.plugin(statusPlugin, { dateField: 'availableUntil' });

ReadyToDonateBloodSchema.index({
  location: 'text',
  bloodType: 'text',
  note: 'text',
});

module.exports =
  mongoose.models.ReadyToDonateBlood ||
  mongoose.model('ReadyToDonateBlood', ReadyToDonateBloodSchema);
