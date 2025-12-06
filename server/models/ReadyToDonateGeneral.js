const mongoose = require('mongoose');

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
  { _id: false },
);

// نفس الفئات الموجودة في GENERAL_CATEGORY_META
const GENERAL_CATEGORY_ENUM = [
  'medical_support',      // الإغاثة والدعم الطبي
  'water',                // سقيا الماء
  'orphans',              // كفالة ورعاية الأيتام
  'food',                 // إطعام الفقراء والمساكين
  'education',            // دعم التعليم والمعرفة
  'mahadir_quran',        // دعم المحاظر والقرآن الكريم
  'mosques',              // عمارة بيوت الله
  'housing',              // إسكان وإيواء المحتاجين
  'disability_support',   // تمكين ذوي الإعاقة
  'relief',               // جبر الخواطر وتفريج الكرب
  'debt_repayment',       // قضاء الديون
  'clothes_furniture',    // توزيع الملابس والأثاث
  'udhiyah',              // الأضحية
  'general_sadaqah',      // الصدقة العامة
  'zakat',                // زكاة المال
  'financial_aid',        // المساعدات المالية
  'other',                // مجالات خير أخرى
];

const AttachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },          // رابط الوصول للملف
    originalName: { type: String },                 // الاسم الأصلي
    mimeType: { type: String },                     // نوع الملف
    size: { type: Number },                         // الحجم بالبايت
  },
  { _id: false },
);

const ReadyToDonateGeneralSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: 'general',
      immutable: true,
    },

    // الموقع (اختياري)
    locationMode: {
      type: String,
      enum: ['none', 'mr', 'abroad'],
      default: 'none',
    },
    location: { type: String, default: '' }, // نص عام يجمع المدينة/الدولة
    city: { type: String, default: '' },
    country: { type: String, default: '' },

    // نوع التبرع وطبيعته
    extra: {
      donationType: {
        // مادي / عيني
        type: String,
        enum: ['financial', 'inkind'],
        required: true,
      },
      category: {
        // مجال التبرع من GENERAL_CATEGORY_ENUM
        type: String,
        enum: GENERAL_CATEGORY_ENUM,
        required: true,
      },
      amount: {
        // مبلغ التبرع (إن كان ماديًا)
        type: Number,
        min: 0,
      },
      attachments: {
        // مرفقات (صور/وثائق) في حالة التبرع العيني
        type: [AttachmentSchema],
        default: [],
      },
    },

    note: { type: String, default: '' },

    availableUntil: {
      type: Date,
      required: true,
    },

    contactMethods: {
      type: [ContactMethodSchema],
      validate: (v) => Array.isArray(v) && v.length > 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'ready_to_donate_general',
  },
);

ReadyToDonateGeneralSchema.index({
  location: 'text',
  city: 'text',
  country: 'text',
  note: 'text',
  'extra.category': 'text',
});

module.exports = mongoose.model(
  'ReadyToDonateGeneral',
  ReadyToDonateGeneralSchema,
);
