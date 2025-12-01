// server/middlewares/adminMiddleware.js
const User = require('../models/User');

exports.requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'غير مصرح. سجل الدخول.' });
    }

    const user = await User.findById(userId).select('role isAdmin');
    if (!user) {
      return res.status(401).json({ message: 'المستخدم غير موجود.' });
    }

    const isAdmin = user.isAdmin === true || user.role === 'admin';
    if (!isAdmin) {
      return res.status(403).json({ message: 'هذه الصفحة مخصصة للإدارة فقط.' });
    }

    req.admin = user;
    next();
  } catch (err) {
    console.error('requireAdmin error:', err);
    res.status(500).json({ message: 'خطأ في التحقق من صلاحيات الأدمن.' });
  }
};
