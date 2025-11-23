// server/controllers/userController.js
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Wilaya = require("../models/wilayas");
const Moughataa = require("../models/moughataas");
const Commune = require("../models/communes");
const asyncHandler = require("../utils/asyncHandler");
const { generateToken } = require("../utils/otpUtils");
const normalizeLocationValue = (value) =>
  typeof value === "string" ? value.trim() : "";

const getDisplayName = (doc) =>
  (doc?.name_ar || "").trim();

const buildLocationResolver = (Model) => async (raw) => {
  const trimmed = normalizeLocationValue(raw);
  if (!trimmed) return null;
  return Model.findOne({
    is_active: true,
    name_ar: trimmed
  })
    .select("code name_ar name_fr")
    .lean();
};

const findByCode = async (Model, code) => {
  if (!code) return null;
  return Model.findOne({ is_active: true, code })
    .select("code name_ar name_fr")
    .lean();
};

const resolveWilaya = buildLocationResolver(Wilaya);
const resolveMoughataa = buildLocationResolver(Moughataa);
const resolveCommune = buildLocationResolver(Commune);

const normalizeLocationsOrThrow = async ({ wilaya, moughataa, commune }) => {
  let resolvedWilaya = null;
  let resolvedMoughataa = null;
  let resolvedCommune = null;

  const wilayaInput = normalizeLocationValue(wilaya);
  const moughataaInput = normalizeLocationValue(moughataa);
  const communeInput = normalizeLocationValue(commune);

  if (wilayaInput) {
    resolvedWilaya = await resolveWilaya(wilayaInput);
    if (!resolvedWilaya) {
      throw new Error("الولاية غير معروفة أو غير مفعلة");
    }
  }

  if (moughataaInput) {
    resolvedMoughataa = await resolveMoughataa(moughataaInput);
    if (!resolvedMoughataa) {
      throw new Error("المقاطعة غير معروفة أو غير مفعلة");
    }
  }

  if (communeInput) {
    resolvedCommune = await resolveCommune(communeInput);
    if (!resolvedCommune) {
      throw new Error("البلدية غير معروفة أو غير مفعلة");
    }
  }

  if (resolvedCommune) {
    const communeMoughataaCode = resolvedCommune.code?.slice(0, 4);
    if (communeMoughataaCode) {
      if (!resolvedMoughataa || resolvedMoughataa.code !== communeMoughataaCode) {
        resolvedMoughataa =
          (await findByCode(Moughataa, communeMoughataaCode)) || resolvedMoughataa;
      }
      if (!resolvedMoughataa) {
        throw new Error("البلدية تشير إلى مقاطعة غير مفعلة");
      }
    }

    const communeWilayaCode = resolvedCommune.code?.slice(0, 2);
    if (communeWilayaCode) {
      if (!resolvedWilaya || resolvedWilaya.code !== communeWilayaCode) {
        resolvedWilaya =
          (await findByCode(Wilaya, communeWilayaCode)) || resolvedWilaya;
      }
      if (!resolvedWilaya) {
        throw new Error("البلدية تشير إلى ولاية غير مفعلة");
      }
    }
  }

  if (resolvedMoughataa) {
    const moughataaWilayaCode = resolvedMoughataa.code?.slice(0, 2);
    if (moughataaWilayaCode) {
      if (!resolvedWilaya || resolvedWilaya.code !== moughataaWilayaCode) {
        resolvedWilaya =
          (await findByCode(Wilaya, moughataaWilayaCode)) || resolvedWilaya;
      }
      if (!resolvedWilaya) {
        throw new Error("المقاطعة تشير إلى ولاية غير مفعلة");
      }
    }
  }

  if (
    resolvedWilaya &&
    resolvedMoughataa &&
    !resolvedMoughataa.code?.startsWith(resolvedWilaya.code || "")
  ) {
    throw new Error("المقاطعة لا تتبع الولاية المحددة");
  }

  if (
    resolvedMoughataa &&
    resolvedCommune &&
    !resolvedCommune.code?.startsWith(resolvedMoughataa.code || "")
  ) {
    throw new Error("البلدية لا تتبع المقاطعة المحددة");
  }

  return {
    wilaya: resolvedWilaya ? getDisplayName(resolvedWilaya) : wilayaInput ? wilayaInput : "",
    moughataa: resolvedMoughataa
      ? getDisplayName(resolvedMoughataa)
      : moughataaInput
      ? moughataaInput
      : "",
    commune: resolvedCommune
      ? getDisplayName(resolvedCommune)
      : communeInput
      ? communeInput
      : "",
  };
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
    moughataa,
    commune,
  } = req.body;

  if (!phoneNumber) {
    res.status(400);
    throw new Error("رقم الهاتف مطلوب للتسجيل");
  }

  const profileImage = req.file?.filename;
  let normalizedLocations;
  try {
    normalizedLocations = await normalizeLocationsOrThrow({
      wilaya,
      moughataa,
      commune,
    });
  } catch (err) {
    res.status(400);
    throw err;
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
    wilaya: normalizedLocations.wilaya,
    moughataa: normalizedLocations.moughataa,
    commune: normalizedLocations.commune,
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
    moughataa: savedUser.moughataa || null,
    commune: savedUser.commune || null,
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
        moughataa: user.moughataa || null,
        commune: user.commune || null,
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

  const locationFieldsTouched = ["wilaya", "moughataa", "commune"].some((field) =>
    Object.prototype.hasOwnProperty.call(req.body, field)
  );

  if (locationFieldsTouched) {
    let normalizedLocations;
    try {
      normalizedLocations = await normalizeLocationsOrThrow({
        wilaya: Object.prototype.hasOwnProperty.call(req.body, "wilaya")
          ? req.body.wilaya
          : user.wilaya,
        moughataa: Object.prototype.hasOwnProperty.call(req.body, "moughataa")
          ? req.body.moughataa
          : user.moughataa,
        commune: Object.prototype.hasOwnProperty.call(req.body, "commune")
          ? req.body.commune
          : user.commune,
      });
    } catch (err) {
      res.status(400);
      throw err;
    }

    user.wilaya = normalizedLocations.wilaya;
    user.moughataa = normalizedLocations.moughataa;
    user.commune = normalizedLocations.commune;
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
    'firstName lastName profileImage address wilaya moughataa commune userType phoneNumber email ratingAsDonor ratingAsRecipient createdAt'
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
    moughataa: user.moughataa || '',
    commune: user.commune || '',
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
