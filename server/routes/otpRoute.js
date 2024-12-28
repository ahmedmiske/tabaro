const express = require('express');
const { sendOtp, verifyOTP } = require('../controllers/otpController');
const { sendOTPMiddleware, verifyOTPMiddleware } = require('../middlewares/otpMiddleware');

const router = express.Router();

router.post(
    '/send-otp', 
    sendOTPMiddleware, 
    sendOtp
);

router.post(
    '/verify-otp', 
    verifyOTPMiddleware, 
    verifyOTP
);
module.exports.otpRoutes = router;
