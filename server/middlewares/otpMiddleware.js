const twilio = require('twilio');
const { checkPhoneNumber, checkOtp } = require('../utils/otpUtils');
const asyncHandler = require('../utils/asyncHandler');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
if (!accountSid) throw new Error("no accountSid was provided!");
const authToken = process.env.TWILIO_AUTH_TOKEN;
if (!authToken) throw new Error("no authToken was provided!");
const serviceId = process.env.TWILIO_SERVICE_ID;
if (!serviceId) throw new Error("no serviceId was provided!");

const client = twilio(accountSid, authToken);

const sendOTPMiddleware = asyncHandler(async (req, res, next) => {
    const { phoneNumber } = req.body;
    checkPhoneNumber(phoneNumber);
    let verification 
    try {
        verification = await client.verify.v2.services(serviceId)
          .verifications
          .create({ to: '+222' + phoneNumber, channel: 'sms' });
    } catch (error) {
        console.error(error);
        throw new Error("internal server error");
    }

    // status values: pending, approved, canceled, max_attempts_reached, deleted, failed or expired
    switch (verification.status) {
        case 'pending':
            req.verification = verification;
            next();            
            break;
        case 'max_attempts_reached':
            next(new Error("Max attempts reached!"));            
            break;
    
        default:
            console.log('SMS send-otp unknown error!',verification);
            next(new Error("SMS unknown error!"));            
            break;
    }
});

const verifyOTPMiddleware = asyncHandler(async (req, res, next) => {
    const { phoneNumber,otp } = req.body;
    checkPhoneNumber(phoneNumber);
    // checkOtp(otp);
    let verification;
    try {
        verification = await client.verify.v2.services(serviceId)
          .verificationChecks
          .create({ to: '+222' + phoneNumber, code: otp });
    } catch (error) {
        console.error(error);
        throw new Error("internal server error")
    }

    // status values: pending, approved, canceled, max_attempts_reached, deleted, failed or expired

    switch (verification.status) {
        case 'approved':
            req.verification = verification;
            next();            
            break;
        case 'max_attempts_reached':
            next(new Error("Max attempts reached!"));            
            break;
        case 'deleted':
            next(new Error("Verification was deleted!"));            
            break;
        case 'failed':
            next(new Error("Verification was failed!"));            
            break;
        case 'expired':
            next(new Error("Verification was expired!"));            
            break;
        default:
            console.log('SMS verifiy-otp unknown error!',verification);
            next(new Error("SMS verification error!"));            
            break;
    }
})

module.exports = {
    sendOTPMiddleware,
    verifyOTPMiddleware
}
