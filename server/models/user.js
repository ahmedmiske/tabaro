const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },

    // email اختياري (sparse+unique يسمح بوجود null لمستخدمين مختلفين)
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    // الهاتف إجباري ويجب أن يكون فريدًا
    phoneNumber: { type: String, unique: true, required: true, trim: true },

    userType: { type: String, enum: ["individual", "institutional"] },

    // username اختياري لكن فريد إن وُجد
    username: { type: String, unique: true, sparse: true, trim: true },

    // كلمة المرور قد لا تكون موجودة لو كنا نعتمد OTP فقط
    password: { type: String },

    // معلومات المؤسسة (اختيارية)
    institutionName: { type: String },
    institutionLicenseNumber: { type: String },
    institutionAddress: { type: String },
    institutionEstablishmentDate: { type: Date },
    institutionWebsite: { type: String },

    // عنوان المستخدم
    address: { type: String },
    wilaya: { type: String, trim: true },
    moughataa: { type: String, trim: true },

    // صورة المستخدم
    profileImage: { type: String, default: "" },

    // ⭐ تقييم المستخدم كمتبرِّع (يُقيّمه أصحاب الطلبات)
    ratingAsDonor: {
      avg: { type: Number, default: 0 },   // متوسط التقييم 1–5
      count: { type: Number, default: 0 }, // عدد التقييمات
    },

    // ⭐ تقييم المستخدم كصاحب طلب (يُقيّمه المتبرعون)
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

// تشفير كلمة المرور قبل الحفظ (إن وُجدت وتغيّرت)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// مقارنة كلمة المرور (عند وجودها)
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

// إزالة الحقول الحساسة من الـ JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
