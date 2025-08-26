// server/controllers/otpController.js
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const { generateToken } = require("../utils/otpUtils");
const User = require("../models/user");

const DEV_OTP = "3229";
const useTwilio = process.env.USE_TWILIO === "true";

// @desc    generate and send otp
// @route   POST /api/otp/send-otp
// @access  Public
const sendOtp = asyncHandler(async (req, res) => {
  // في وضع التطوير، لا نرسل SMS فعليًا
  if (!useTwilio) {
    return res.status(201).send({ message: "OTP sent (dev)", dev: true, code: DEV_OTP });
  }
  // إن كنت تستخدم Twilio، فالتحقق الفعلي تم في middleware
  return res.status(201).send({ message: "OTP sent" });
});

// @desc    Verify OTP
// @route   POST /api/otp/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
  const { phoneNumber, otp } = req.body;
  if (!phoneNumber) {
    res.status(400);
    throw new Error("phoneNumber is required");
  }

  if (!useTwilio) {
    if (!otp || String(otp) !== DEV_OTP) {
      res.status(400);
      throw new Error("Invalid OTP (dev)");
    }
    // تحقق ناجح: هل المستخدم موجود؟
    const user = await User.findOne({ phoneNumber });
    if (user) {
      // دخول مباشر
      return res.send({
        message: "OTP verified - logged in",
        token: generateToken(user._id),
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          phoneNumber: user.phoneNumber,
          email: user.email,
          userType: user.userType,
          profileImage: user.profileImage || "",
        },
      });
    }
    // مستخدم جديد: نُصدر توكن تسجيل قصير العمر
    const registrationToken = jwt.sign({ id: String(phoneNumber) }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });
    return res.send({
      message: "OTP verified - proceed to register",
      registrationToken,
    });
  }

  // عند تمكين Twilio، التحقق الفعلي تم في middleware
  const user = await User.findOne({ phoneNumber });
  if (user) {
    return res.send({
      message: "OTP verified - logged in",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        phoneNumber: user.phoneNumber,
        email: user.email,
        userType: user.userType,
        profileImage: user.profileImage || "",
      },
    });
  }
  const registrationToken = jwt.sign({ id: String(phoneNumber) }, process.env.JWT_SECRET, {
    expiresIn: "10m",
  });
  return res.send({
    message: "OTP verified - proceed to register",
    registrationToken,
  });
});

module.exports = { sendOtp, verifyOTP };
