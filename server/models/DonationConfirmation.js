const mongoose = require('mongoose');

const donationConfirmationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ✅ جديد
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodDonationRequest', required: true },
  message: { type: String },
  method: { type: String },
  proposedTime: { type: Date },
  status: {
    type: String,
    enum: ['initiated', 'accepted', 'fulfilled', 'rated'],
    default: 'initiated'
  },
  acceptedAt: Date,
  fulfilledAt: Date,
  ratingByDonor: Number,
  ratingByRecipient: Number
}, { timestamps: true });

module.exports = mongoose.model('DonationConfirmation', donationConfirmationSchema);
// This model represents a donation confirmation, which includes details about the donor, recipient, request, and status of the donation process.
// It allows tracking the donation process from initiation to acceptance, fulfillment, and rating by both parties