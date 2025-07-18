const mongoose = require('mongoose');

const donationConfirmationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodDonationRequest', required: true }, // ✅ تم التصحيح هنا
  message: { type: String },
  method: { type: String },
  proposedTime: { type: Date },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'fulfilled'],
    default: 'pending'
  },
  acceptedAt: Date,
  fulfilledAt: Date,
  ratingByDonor: Number,
  ratingByRecipient: Number
}, { timestamps: true });

module.exports = mongoose.model('DonationConfirmation', donationConfirmationSchema);
