const mongoose = require('mongoose');
const statusPlugin = require('../models/plugins/statusPlugin'); // نفس ما كان عندك

const ContactMethodSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ['phone', 'whatsapp'],
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

// نفس الفئات الموجودة في GENERAL_CATEGORY_META
const GENERAL_CATEGORY_ENUM = [
  'medical_support',
  'water',
  'orphans',
  'food',
  'education',
  'mahadir_quran',
  'mosques',
  'housing',
  'disability_support',
  'relief',
  'debt_repayment',
  'clothes_furniture',
  'udhiyah',
  'general_sadaqah',
  'zakat',
  'financial_aid',
  'other',
];

const AttachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    originalName: { type: String },
    mimeType: { type: String },
    size: { type: Number },
  },
  { _id: false }
);

const HistoryActionSchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // create, user_stop, user_reactivate...
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    role: { type: String, default: 'user' }, // user, admin...
    fromStatus: { type: String },
    toStatus: { type: String },
    reason: { type: String },
    note: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ReadyToDonateGeneralSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: 'general',
      immutable: true,
    },

    // الموقع
    locationMode: {
      type: String,
      enum: ['none', 'mr', 'abroad'],
      default: 'none',
    },
    location: { type: String, default: '' },
    city: { type: String, default: '' },
    country: { type: String, default: '' },

    // نوع التبرع وطبيعته
    extra: {
      donationType: {
        type: String,
        enum: ['financial', 'inkind'],
        required: true,
      },
      category: {
        type: String,
        enum: GENERAL_CATEGORY_ENUM,
        required: true,
      },
      amount: {
        type: Number,
        min: 0,
      },
      attachments: {
        type: [AttachmentSchema],
        default: [],
      },
    },

    note: { type: String, default: '' },

    // تُستخدم لتحديد انتهاء الصلاحية
    availableUntil: {
      type: Date,
      required: true,
    },

    contactMethods: {
      type: [ContactMethodSchema],
      validate: (v) => Array.isArray(v) && v.length > 0,
    },

    // ✅ صاحب الإعلان
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // ✅ معلومات الإيقاف (اختياري)
    closedReason: { type: String, default: '' },
    closedAt: { type: Date, default: null },

    // ✅ أرشيف العمليات
    historyActions: {
      type: [HistoryActionSchema],
      default: [],
    },

    // status يأتي من الـ plugin (يضيف الحقل ويحدثه)
  },
  {
    timestamps: true,
    collection: 'ready_to_donate_general',
  }
);

// 🔌 Plugin: يحسب status الفعلية بناءً على availableUntil
ReadyToDonateGeneralSchema.plugin(statusPlugin, {
  dateField: 'availableUntil',
});

ReadyToDonateGeneralSchema.index({
  location: 'text',
  city: 'text',
  country: 'text',
  note: 'text',
  'extra.category': 'text',
});

module.exports =
  mongoose.models.ReadyToDonateGeneral ||
  mongoose.model('ReadyToDonateGeneral', ReadyToDonateGeneralSchema);
