const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now  },
  senderName: { type: String } // Optional field to store sender's name
}, {
  timestamps: true // createdAt & updatedAt
});

module.exports = mongoose.model('Message', messageSchema);
// This model defines the structure of a message in the database.
// It includes fields for sender, recipient, content, read status, and timestamps.