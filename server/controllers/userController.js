// server/controllers/userController.js
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Wilaya = require("../models/wilayas");
const asyncHandler = require("../utils/asyncHandler");
const { generateToken } = require("../utils/otpUtils");

const isWilayaValid = async (raw) => {
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  if (!trimmed) return false;

  const match = await Wilaya.findOne({
    is_active: true,
    name_ar: trimmed
  })
    .select("code name_ar")
    .lean();

  if (!match) return false;
  return true;
};

// @desc Register a new user (بعد verify-otp)
// @route POST /api/users
// @access Protected by protectRegisterUser
const registerUser = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    username,
    userType,
    institutionName,
    institutionLicenseNumber,
    institutionAddress,
    institutionEstablishmentDate,
    institutionWebsite,
    address,
    phoneNumber,
    wilaya,
  } = req.body;

  if (!phoneNumber) {
    res.status(400);
    throw new Error("رقم الهاتف مطلوب للتسجيل");
  }

  const profileImage = req.file?.filename;
  const isWilayaValidResult = await isWilayaValid(wilaya);
  if (wilaya?.trim() && !isWilayaValidResult) {
    res.status(400);
    throw new Error("الولاية غير معروفة أو غير مفعلة");
  }

  const newUser = new User({
    firstName,
    lastName,
    email: email || null, // ✅ نخليه null لو ما جاش
    username,
    password,
    userType,
    institutionName,
    institutionLicenseNumber,
    institutionAddress,
    institutionEstablishmentDate,
    institutionWebsite,
    address,
    phoneNumber,
    wilaya,
    profileImage,
    status: "verified", // مؤقتًا لحد ما نربط OTP
  });

  const savedUser = await newUser.save();
  res.status(201).json({
    _id: savedUser._id,
    name: savedUser.firstName + " " + savedUser.lastName,
    phoneNumber: savedUser.phoneNumber,
    email: savedUser.email, // ممكن يرجع null
    wilaya: savedUser.wilaya || null,
    token: generateToken(savedUser._id),
  });
});

// @desc    Auth user & get token (تسجيل دخول بكلمة مرور - اختياري)
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { loginInput, password } = req.body;

  // ✅ ندور بالهاتف أو اليوزرنيم فقط
  const user = await User.findOne({
    $or: [{ username: loginInput }, { phoneNumber: loginInput }],
  });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        phoneNumber: user.phoneNumber,
        email: user.email || null, // ممكن null
        userType: user.userType,
        wilaya: user.wilaya || null,
        profileImage: user.profileImage || "",
      },
    });
  } else {
    res.status(400);
    throw new Error("رقم الهاتف أو كلمة المرور غير صحيحة");
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private (admin)
const getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const [total, users] = await Promise.all([
    User.countDocuments({}),
    User.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
  ]);

  res.json({ result: users, page, pages: Math.ceil(total / limit), total });
});

// @desc    Get user profile (المدخل من التوكن)
// @route   GET /api/users/profile
// @access  Private
const getUser = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// @desc    Update user information (whitelist)
// @route   PUT /api/users/profile
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const allowed = [
    "firstName",
    "lastName",
    "institutionName",
    "institutionLicenseNumber",
    "institutionAddress",
    "institutionEstablishmentDate",
    "institutionWebsite",
    "address",
  ];

  for (const k of allowed) {
    if (k in req.body) user[k] = req.body[k];
  }

  if ("wilaya" in req.body) {
    const isWilayaValidResult = await isWilayaValid(req.body.wilaya);
    if (req.body.wilaya?.trim() && !isWilayaValidResult) {
      res.status(400);
      throw new Error("الولاية غير معروفة أو غير مفعلة");
    }
    user.wilaya = req.body.wilaya;
  }

  if (req.file?.filename) user.profileImage = req.file.filename;

  await user.save();
  res.json(user);
});

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const freshUser = await User.findById(req.user._id).select("+password");
  if (!freshUser) {
    res.status(404);
    throw new Error("User not found");
  }

  const ok = await freshUser.matchPassword(currentPassword);
  if (!ok) {
    res.status(400);
    throw new Error("Current password is incorrect");
  }

  freshUser.password = newPassword;
  await freshUser.save();
  res.json({ message: "Password updated successfully" });
});

// @desc    Reset user password (محمية بتوكن تسجيل - protectRegisterUser)
// @route   PUT /api/users/reset-password
// @access  Private (special)
const resetPassword = asyncHandler(async (req, res) => {
  const { phoneNumber, newPassword } = req.body;
  const user = await User.findOne({ phoneNumber }).select("+password");
  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }
  user.password = newPassword;
  await user.save();
  res.json({
    message: "Password reset successfully",
    token: generateToken(user._id),
    _id: user._id,
    name: user.firstName + " " + (user.lastName || ""),
    email: user.email,
  });
});

// @desc    Delete user profile
// @route   DELETE /api/users/profile
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
  await User.deleteOne({ _id: req.user._id });
  res.json({ message: "User profile deleted" });
});

// @desc    Get public user profile (مُتاح للجميع لزيارة بروفايل أي مستخدم)
// @route   GET /api/users/:userId/public-profile
// @access  Public
const getPublicProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select(
    'firstName lastName profileImage address wilaya userType phoneNumber email ratingAsDonor ratingAsRecipient createdAt'
  );

  if (!user) {
    res.status(404);
    throw new Error('المستخدم غير موجود');
  }

  const donor = user.ratingAsDonor || { avg: 0, count: 0 };
  const recipient = user.ratingAsRecipient || { avg: 0, count: 0 };

  const totalCount = (donor.count || 0) + (recipient.count || 0);
  let avgRating = 0;

  if (totalCount > 0) {
    avgRating =
      ((donor.avg || 0) * (donor.count || 0) +
        (recipient.avg || 0) * (recipient.count || 0)) /
      totalCount;
  }

  res.json({
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    profileImage: user.profileImage || '',
    address: user.address || '',
    wilaya: user.wilaya || '',
    userType: user.userType || 'individual',

    // 👇 المهم هنا
    phoneNumber: user.phoneNumber || '',
    email: user.email || '',

    ratingAsDonor: donor,
    ratingAsRecipient: recipient,
    avgRating,
    totalRatings: totalCount,
    createdAt: user.createdAt,
  });
});


module.exports = {
  registerUser,
  authUser,
  getUsers,
  updateUser,
  getUser,
  changePassword,
  deleteUser,
  resetPassword,
  getPublicProfile, // ✅ مضاف
};
