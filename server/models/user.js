const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },

    // ✅ email اختياري ويمكن أن يتكرر
    email: {
      type: String,
      lowercase: true,
      trim: true,
      // لا يوجد unique ولا sparse هنا
    },

    // الهاتف إجباري ويجب أن يكون فريدًا
    phoneNumber: { type: String, unique: true, required: true, trim: true },

    // رقم واتساب (اختياري – قد يكون نفس رقم الهاتف أو مختلف)
    whatsappNumber: {
      type: String,
      trim: true,
      // لا نضع unique حتى نسمح بتكراره عند الحاجة
    },

    userType: { type: String, enum: ["individual", "institutional"] },

    // username فريد (هذا مناسب أن يبقى فريد)
    username: { type: String, unique: true, sparse: true, trim: true },

    password: { type: String },

    // معلومات المؤسسة
    institutionName: { type: String },
    institutionLicenseNumber: { type: String },
    institutionAddress: { type: String },
    institutionEstablishmentDate: { type: Date },
    institutionWebsite: { type: String },

    // العنوان والموقع
    address: { type: String },
    wilaya: { type: String, trim: true },
    moughataa: { type: String, trim: true },
    commune: { type: String, trim: true },

    // صورة المستخدم
    profileImage: { type: String, default: "" },

    // ⭐ تقييم المستخدم كمتبرِّع
    ratingAsDonor: {
      avg: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },

    // ⭐ تقييم المستخدم كصاحب طلب
    ratingAsRecipient: {
      avg: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },

    // الدور والحالة
    role: {
      type: String,
      enum: [
        "user",
        "admin",
        "beneficiary",
        "donor",
        "public_institution",
        "charity_organization",
      ],
      default: "user",
    },
    status: {
      type: String,
      enum: ["pending", "verified", "valid", "suspended"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// تشفير كلمة المرور
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// ✅ الحل لعدم إعادة تعريف الموديل أكثر من مرة
const User =
  mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
