const { messaging } = require('firebase-admin');
const User = require('../models/user');
const asyncHandler = require('../utils/asyncHandler');
// const otpService = require('./config');
const { generateToken } = require('../utils/otpUtils');

// @desc    generate and send otp
// @route   POST /api/otp/send-otp
// @access  Public
const sendOtp = asyncHandler(async (req, res) => {
  // save user 
  const { phoneNumber } = req.body;
  const user = new User({ phoneNumber });
  await user.save();
  res.status(201).send({ message: 'OTP sent' });
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
  const { phoneNumber } = req.body;

  const user = await User.findOne({ phoneNumber });
  user.status = 'verified';
  await user.save();

  const token = generateToken(user.id);

  res.send({ message: 'OTP verified', token });

});

module.exports = { sendOtp, verifyOTP };
