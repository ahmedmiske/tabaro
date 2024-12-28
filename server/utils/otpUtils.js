const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const checkPhoneNumber = (phoneNumber) => {
  if (!/^[234]\d{7}$/.test(phoneNumber)){
    throw new Error("Invalid phone number");
  }
}

const checkOtp = (otp) => {
  if(!/^\d{4}$/.test(otp)){
    throw new Error("Invalid otp");
  }
}

module.exports.generateToken = generateToken;
module.exports.checkPhoneNumber = checkPhoneNumber;
module.exports.checkOtp = checkOtp;
