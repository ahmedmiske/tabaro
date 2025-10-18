// server/models/ReadyToDonateBlood.js
const mongoose = require('mongoose');

const ContactMethodSchema = new mongoose.Schema({
  method: { type: String, enum: ['phone', 'whatsapp'], required: true },
  number: { type: String, required: true }
}, { _id: false });

const ReadyToDonateBloodSchema = new mongoose.Schema({
  location: { type: String, required: true },
  bloodType: { type: String, required: true, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-','غير معروف'] },
  note: { type: String, default: '' },
  contactMethods: { type: [ContactMethodSchema], validate: v => Array.isArray(v) && v.length > 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true, collection: 'ready_to_donate_blood' });

ReadyToDonateBloodSchema.index({ location: 'text', bloodType: 'text', note: 'text' });

module.exports = mongoose.model('ReadyToDonateBlood', ReadyToDonateBloodSchema);
