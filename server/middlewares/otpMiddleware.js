const twilio = require('twilio');
const { checkPhoneNumber, checkOtp } = require('../utils/otpUtils');
const asyncHandler = require('../utils/asyncHandler');

const useTwilio = process.env.USE_TWILIO === 'true';
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceId = process.env.TWILIO_SERVICE_ID;

if (useTwilio) {
    if (!accountSid) throw new Error("no accountSid was provided!");
    if (!authToken) throw new Error("no authToken was provided!");
    if (!serviceId) throw new Error("no serviceId was provided!");
}

const client = useTwilio ? twilio(accountSid, authToken) : null;

const sendOTPMiddleware = asyncHandler(async (req, res, next) => {
    const { phoneNumber } = req.body;
    checkPhoneNumber(phoneNumber);

    if (!useTwilio) {
        console.log("Twilio is disabled");
        return next();
    }

    try {
        const verification = await client.verify.v2.services(serviceId)
          .verifications
          .create({ to: '+222' + phoneNumber, channel: 'sms' });

        if (verification.status === 'pending') {
            req.verification = verification;
            next();
        } else if (verification.status === 'max_attempts_reached') {
            next(new Error("Max attempts reached!"));
        } else {
            console.log('SMS send-otp unknown error!', verification);
            next(new Error("SMS unknown error!"));
        }
    } catch (error) {
        console.error(error);
        throw new Error("internal server error");
    }
});

const verifyOTPMiddleware = asyncHandler(async (req, res, next) => {
    const { phoneNumber, otp } = req.body;
    checkPhoneNumber(phoneNumber);

    if (!useTwilio) {
        console.log("Twilio is disabled");
        return next();
    }

    try {
        const verification = await client.verify.v2.services(serviceId)
          .verificationChecks
          .create({ to: '+222' + phoneNumber, code: otp });

        if (['approved', 'max_attempts_reached', 'deleted', 'failed', 'expired'].includes(verification.status)) {
            next(new Error(`${verification.status.charAt(0).toUpperCase() + verification.status.slice(1)} error!`));
        } else {
            req.verification = verification;
            next();
        }
    } catch (error) {
        console.error(error);
        throw new Error("internal server error");
    }
});

module.exports = {
    sendOTPMiddleware,
    verifyOTPMiddleware
};
