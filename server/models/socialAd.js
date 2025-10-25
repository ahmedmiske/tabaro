const { Schema, model, Types } = require('mongoose');

const SOCIAL_AD_STATUS = Object.freeze({
  PendingReview: 'PendingReview',
  Published: 'Published',
  Expired: 'Expired',
  Archived: 'Archived',
  Rejected: 'Rejected',
});

const REPORT_REASON = Object.freeze({
  spam: 'spam',
  scam: 'scam',
  abuse: 'abuse',
  duplicate: 'duplicate',
  illegal: 'illegal',
  other: 'other',
});

const LocationSchema = new Schema(
  {
    wilaya: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    district: { type: String, trim: true }, // غير مستخدم الآن لكن محتفظ به إن لزم مستقبلًا
  },
  { _id: false }
);

const AttachmentSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    name: { type: String, trim: true },
    type: { type: String, trim: true },
    size: { type: Number },
  },
  { _id: false }
);

const SocialAdSchema = new Schema(
  {
    category: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 6, maxlength: 100 },
    description: { type: String, required: true, trim: true, minlength: 30 },
    location: { type: LocationSchema, required: true },
    imageUrl: { type: String }, // اختياري (رابط صورة واحدة)
    attachments: { type: [AttachmentSchema], default: [] }, // ملفات مرفوعة (صور/PDF)

    authorId: { type: Types.ObjectId, ref: 'User', required: true, index: true },

    // النشر الفوري افتراضيًا
    status: {
      type: String,
      enum: Object.values(SOCIAL_AD_STATUS),
      default: SOCIAL_AD_STATUS.Published,
      index: true,
    },

    durationDays: { type: Number, default: 30, min: 1, max: 180 },
    publishedAt: { type: Date },
    expiresAt: { type: Date, index: true },
    archivedAt: { type: Date },

    extraFields: { type: Schema.Types.Mixed },

    reports: {
      type: [
        {
          reporterId: { type: Types.ObjectId, ref: 'User', required: true },
          reason: { type: String, enum: Object.values(REPORT_REASON), required: true },
          comment: { type: String, trim: true, maxlength: 2000 },
          status: {
            type: String,
            enum: ['open', 'in_review', 'resolved', 'dismissed'],
            default: 'open',
          },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

// فهارس
SocialAdSchema.index({ 'location.wilaya': 1, 'location.city': 1 });
SocialAdSchema.index({ title: 'text', description: 'text' }, { weights: { title: 3, description: 1 } });

// حساب تواريخ النشر/الانقضاء عند الإنشاء لو الحالة Published
SocialAdSchema.pre('save', function (next) {
  if (this.isNew && (this.status === SOCIAL_AD_STATUS.Published || !this.status)) {
    if (!this.publishedAt) this.publishedAt = new Date();
    if (!this.expiresAt) {
      const days = this.durationDays || 30;
      const d = new Date(this.publishedAt);
      d.setDate(d.getDate() + days);
      this.expiresAt = d;
    }
  }
  next();
});

module.exports = {
  SocialAd: model('SocialAd', SocialAdSchema),
  SOCIAL_AD_STATUS,
  REPORT_REASON,
};
