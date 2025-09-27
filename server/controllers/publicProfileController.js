const mongoose = require('mongoose');
const User = require('../models/user');

exports.getPublicUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'معرّف غير صالح' });
    }

    // ✋ لا نرجّع حقول حساسة
    const user = await User.findById(id)
      .select('firstName lastName profileImage email phoneNumber bio rating averageRating');

    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

    // توحيد قيم التقييم عند الحاجة
    const avg =
      typeof user.averageRating === 'number'
        ? user.averageRating
        : (Array.isArray(user.rating) && user.rating.length
            ? user.rating.reduce((a, b) => a + b, 0) / user.rating.length
            : 0);

    return res.json({
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        bio: user.bio || '',
        averageRating: avg,
      },
    });
  } catch (e) {
    console.error('getPublicUser error:', e);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};

