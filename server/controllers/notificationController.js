const Notification = require('../models/Notification');

// ✅ جلب جميع الإشعارات الخاصة بالمستخدم
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ userId }).sort({ date: -1 });

    res.status(200).json(notifications);
  } catch (err) {
    console.error('خطأ في جلب الإشعارات:', err.message);
    res.status(500).json({ message: 'فشل في جلب الإشعارات' });
  }
};

// ✅ تعليم إشعار كمقروء
exports.markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'الإشعار غير موجود' });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ message: 'تم وضع الإشعار كمقروء' });
  } catch (err) {
    console.error('خطأ في تحديث الإشعار:', err.message);
    res.status(500).json({ message: 'حدث خطأ أثناء تحديث الإشعار' });
  }
};

// ✅ جلب عدد الإشعارات غير المقروءة
exports.getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const count = await Notification.countDocuments({ userId, read: false });

    res.status(200).json({ count });
  } catch (err) {
    console.error('خطأ في حساب الإشعارات غير المقروءة:', err.message);
    res.status(500).json({ message: 'فشل في جلب العدد' });
  }
};

// This controller handles user notifications.
// It includes methods to fetch all notifications for a user and to get the count of unread notifications