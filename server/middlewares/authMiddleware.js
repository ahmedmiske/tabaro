// server/middlewares/authMiddelwere.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/user');

// استعماله حصراً أثناء تسجيل المستخدم عبر OTP
const protectRegisterUser = asyncHandler(async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded.id || decoded.id !== req.body.phoneNumber) {
        res.status(401);
        throw new Error('Not authorized, token failed');
      }
      return next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }
  res.status(401);
  throw new Error('Not authorized, no token');
});

// يحمي جميع المسارات الأخرى
const protect = asyncHandler(async (req, res, next) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ندعم أكثر من اسم محتمل داخل الـ JWT
    const idLike =
      decoded.id ||
      decoded._id ||
      decoded.userId ||
      decoded.phoneNumber ||
      (decoded.user && (decoded.user._id || decoded.user.id || decoded.user.userId || decoded.user.phoneNumber));

    if (!idLike) {
      res.status(401);
      throw new Error('Invalid token payload');
    }

    const isPhone = /^\d{6,15}$/.test(String(idLike));
    const user = isPhone
      ? await User.findOne({ phoneNumber: String(idLike) })
      : await User.findById(idLike);

    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

// تفويض بحسب الدور
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error('Not authorized');
    }
    next();
  };
};

module.exports = { protect, authorize, protectRegisterUser };
