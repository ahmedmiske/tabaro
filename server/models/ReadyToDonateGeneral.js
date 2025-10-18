const mongoose = require('mongoose');

const ContactMethodSchema = new mongoose.Schema({
  method: { type: String, enum: ['phone', 'whatsapp'], required: true },
  number: { type: String, required: true }
}, { _id: false });

const ReadyToDonateGeneralSchema = new mongoose.Schema({
  city: { type: String, required: true },
  extra: {
    category: { type: String, enum: ['money','goods','time','other'], default: 'money' } // نوع التبرع
  },
  note: { type: String, default: '' },
  contactMethods: { type: [ContactMethodSchema], validate: v => Array.isArray(v) && v.length > 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true, collection: 'ready_to_donate_general' });

ReadyToDonateGeneralSchema.index({ city: 'text', note: 'text', 'extra.category': 1 });

module.exports = mongoose.model('ReadyToDonateGeneral', ReadyToDonateGeneralSchema);
