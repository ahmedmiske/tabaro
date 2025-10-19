// server/models/ReadyToDonateGeneral.js
const mongoose = require('mongoose');

const ContactMethodSchema = new mongoose.Schema({
  method: { type: String, enum: ['phone', 'whatsapp'], required: true },
  number: { type: String, required: true }
}, { _id: false });

const ReadyToDonateGeneralSchema = new mongoose.Schema({
  city: { type: String, required: true },
  extra: {
    category: {
      type: String,
      enum: [
        'sadaqa',          // صدقة
        'zakat',           // زكاة
        'kafara',          // كفارة
        'orphans',         // الأيتام
        'awqaf',           // الأوقاف
        'livestock',       // الأنعام/أضاحي
        'money',           // مساعدات مالية
        'goods',           // مواد/أغراض
        'time',            // تطوع بالوقت/الجهد
        'mosque_services', // خدمات المسجد  ✅
        'mahadir_services',// خدمات المحاظر ✅
        'other'            // أخرى
      ],
      default: 'money'
    }
  },
  note: { type: String, default: '' },
  contactMethods: {
    type: [ContactMethodSchema],
    validate: v => Array.isArray(v) && v.length > 0
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true, collection: 'ready_to_donate_general' });

ReadyToDonateGeneralSchema.index({ city: 'text', note: 'text' });

module.exports = mongoose.model('ReadyToDonateGeneral', ReadyToDonateGeneralSchema);
