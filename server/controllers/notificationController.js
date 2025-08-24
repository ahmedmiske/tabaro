// server/controllers/notificationController.js
const Notification = require("../models/Notification");

// POST /api/notifications
exports.createNotification = async (req, res) => {
  try {
    const {
      targetUser, // المفضّل من الفرونت
      userId,     // اسم بديل
      sender,
      title = "",
      message = "",
      type = "system",
      referenceId = null,
      meta = null,
    } = req.body || {};

    const toUser = targetUser || userId;
    if (!toUser) return res.status(400).json({ message: "targetUser مطلوب" });

    const notif = await Notification.create({
      userId: toUser,
      sender: sender || req.user?._id || undefined,
      title,
      message,
      type,
      referenceId,
      meta,
    });

    res.status(201).json({ data: notif });
  } catch (err) {
    console.error("خطأ إنشاء الإشعار:", err);
    res.status(500).json({ message: "فشل إنشاء الإشعار" });
  }
};

// GET /api/notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate("sender", "firstName lastName profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({ data: notifications });
  } catch (err) {
    console.error("خطأ في جلب الإشعارات:", err);
    res.status(500).json({ message: "فشل في جلب الإشعارات" });
  }
};

// PATCH /api/notifications/:id/read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!notification) return res.status(404).json({ message: "الإشعار غير موجود" });

    notification.read = true;
    await notification.save();
    res.status(200).json({ message: "تم وضع الإشعار كمقروء" });
  } catch (err) {
    console.error("خطأ في تحديث الإشعار:", err);
    res.status(500).json({ message: "حدث خطأ أثناء تحديث الإشعار" });
  }
};

// GET /api/notifications/unread-count
exports.getUnreadNotificationCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.status(200).json({ count });
  } catch (err) {
    console.error("خطأ في حساب الإشعارات غير المقروءة:", err);
    res.status(500).json({ message: "فشل في جلب العدد" });
  }
};

// POST /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { $set: { read: true } });
    res.status(200).json({ message: "تم تعليم كل الإشعارات كمقروءة" });
  } catch (err) {
    console.error("markAllAsRead error:", err);
    res.status(500).json({ message: "فشل العملية" });
  }
};
