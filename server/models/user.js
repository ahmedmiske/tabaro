const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  phoneNumber: { type: String, unique: true, required: true, trim: true },
  userType: { type: String, enum: ['individual', 'institutional'] },
  username: { type: String, unique: true, sparse: true, trim: true },
  password: { type: String },

  // معلومات المؤسسة
  institutionName: { type: String },
  institutionLicenseNumber: { type: String },
  institutionAddress: { type: String },
  institutionEstablishmentDate: { type: Date },
  institutionWebsite: { type: String },

  // عنوان المستخدم
  address: { type: String },

  // ✅ صورة المستخدم
  profileImage: {
    type: String,
    default: '' // يمكنك وضع '/default-avatar.png' إذا أردت صورة افتراضية
  },

  // ✅ الدور والحالة
  role: {
    type: String,
    enum: ['user', 'admin', 'beneficiary', 'donor', 'public_institution', 'charity_organization'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'valid', 'suspended'],
    default: 'pending'
  }

}, { timestamps: true });

// ✅ تشفير كلمة المرور قبل الحفظ
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ التحقق من كلمة المرور
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ إزالة الحقول الحساسة تلقائيًا عند التحويل إلى JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
// This code defines the User model for the application, including schema and methods for password handling.