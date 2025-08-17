const Notification = require('../models/Notification');

/**
 * إرسال إشعار إلى مستخدم + دفع Socket (إن وُجد)
 * مع منع التكرار القريب: لا تنشئ نفس (userId,type,referenceId) خلال آخر 2 دقيقة
 */
exports.notifyUser = async ({
  app,
  userId,
  sender,
  title = '',
  message = '',
  type = 'system',
  referenceId = null,
  meta = null,
  dedupeWindowMs = 2 * 60 * 1000, // دقيقتان
}) => {
  try {
    if (!userId) return null;

    const since = new Date(Date.now() - dedupeWindowMs);

    const duplicate = await Notification.findOne({
      userId,
      type,
      ...(referenceId ? { referenceId } : {}),
      createdAt: { $gte: since },
    });

    if (duplicate) return duplicate;

    const notif = await Notification.create({
      userId,
      sender,
      title,
      message,
      type,
      referenceId,
      meta,
    });

    // ادفع عبر Socket.IO (إن كان مهيأ)
    const io = app?.get?.('io');
    if (io) {
      io.to(String(userId)).emit('notification', {
        _id: notif._id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        referenceId: notif.referenceId,
        createdAt: notif.createdAt,
      });
    }

    return notif;
  } catch (err) {
    console.error('notifyUser error:', err?.message || err);
    return null;
  }
};
