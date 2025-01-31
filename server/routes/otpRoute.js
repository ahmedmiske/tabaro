const express = require('express');
const { sendOtp, verifyOTP } = require('../controllers/otpController');
const { sendOTPMiddleware, verifyOTPMiddleware } = require('../middlewares/otpMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: OTP
 *   description: OTP operations
*/

/**
 * @swagger
 * components:
 *   schemas:
 *     OTPInput:
 *       type: object
 *       properties:
 *         phoneNumber:
 *           type: string
 *           required: true
 *           description: The user's phone number
 *           example: 36363636
 * 
 *     VerifyOTPInput:
 *       allOf:
 *         - $ref: '#/components/schemas/OTPInput'
 *         - type: object
 *           properties:
 *             otp:
 *               type: string
 *               required: true
 *               description: The OTP sent to the user's phone number
 *               example: 123456
 * 
 *   requestBodies:
 *     sendOTPInput:
 *       description: Input data for sending OTP
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OTPInput'
 *     verifyOTPInput:
 *       description: Input data for verifying OTP
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOTPInput'
 */

/**
 * @swagger
 * /otp/send-otp:
 *   post:
 *     summary: Send OTP
 *     tags: [OTP]
 *     description: Send OTP to the user's phone number
 *     requestBody:
 *       $ref: '#/components/requestBodies/sendOTPInput'
 *     responses:
 *       201:
 *         description: OTP sent
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post(
    '/send-otp',
    sendOTPMiddleware,
    sendOtp
);

/**
 * @swagger
 * /otp/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     tags: [OTP]
 *     description: Verify OTP sent to the user's phone number
 *     requestBody:
 *       $ref: '#/components/requestBodies/verifyOTPInput'
 *     responses:
 *       200:
 *         description: OTP verified
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post(
    '/verify-otp',
    verifyOTPMiddleware,
    verifyOTP
);

module.exports.otpRoutes = router;
