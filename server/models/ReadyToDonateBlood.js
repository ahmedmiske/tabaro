// server/models/ReadyToDonateBlood.js
const mongoose = require('mongoose');

const ContactMethodSchema = new mongoose.Schema({
  method: { type: String, enum: ['phone', 'whatsapp'], required: true },
  number: { type: String, required: true }
}, { _id: false });

const ReadyToDonateBloodSchema = new mongoose.Schema({
  type: { type: String, default: 'blood' },           // constant "blood"
  location: { type: String, required: true },         // e.g., "نواكشوط"
  bloodType: { type: String, required: true, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-','غير معروف'] },
  note: { type: String, default: '' },
  contactMethods: { type: [ContactMethodSchema], validate: v => v && v.length > 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

module.exports = mongoose.model('ReadyToDonateBlood', ReadyToDonateBloodSchema);
