const mongoose = require('mongoose');

// ✅ مخطط لطرق التواصل المرتبطة بالطلب
const contactMethodSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true,
  },
  number: {
    type: String,
    required: true,
  },
});

// ✅ مخطط طلب التبرع بالدم
const bloodRequestSchema = new mongoose.Schema({
  bloodType: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
  },
  isUrgent: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  contactMethods: [contactMethodSchema],
  status: {
    type: Number,
    default: 1, // 1 = نشط
  },
  files: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

// ✅ تسجيل الموديل تحت اسم 'BloodRequest'
const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);

module.exports = BloodRequest;
