// server/utils/notify.js
const Notification = require('../models/Notification');

exports.notifyUser = async ({
  app,                // لارسال socket لاحقًا
  userId,
  sender,
  title = '',
  message = '',
  type = 'system',
  referenceId = null,
  meta = null,
}) => {
  // upsert: لو موجود بنفس (userId/type/referenceId) يحدثه، وإلا ينشئ جديد
  const doc = await Notification.findOneAndUpdate(
    { userId, type, referenceId },
    {
      $setOnInsert: {
        userId,
        sender,
        title,
        message,
        type,
        referenceId,
        meta,
        read: false,
      },
      $set: { updatedAt: new Date() },
    },
    { new: true, upsert: true }
  );

  // بث سوكِت (اختياري)
  try {
    const io = app.get('io');
    if (io && userId) {
      io.to(String(userId)).emit('notification:new', {
        _id: doc._id,
        title: doc.title,
        message: doc.message,
        type: doc.type,
        referenceId: doc.referenceId,
        createdAt: doc.createdAt,
      });
    }
  } catch (_) {}

  return doc;
};
