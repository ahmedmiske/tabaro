// models/message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, trim: true },
  timestamp: { type: Date, default: Date.now },
  // track read status for recipient
  read: { type: Boolean, default: false },
}, { timestamps: false });

// Helpful indexes for queries and pagination
MessageSchema.index({ conversationId: 1, timestamp: 1 });
MessageSchema.index({ sender: 1, recipient: 1, timestamp: 1 });
MessageSchema.index({ recipient: 1, read: 1 });

module.exports = mongoose.model('Message', MessageSchema);
