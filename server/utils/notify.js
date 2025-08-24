// server/utils/notify.js
const Notification = require("../models/Notification");

exports.notifyUser = async ({
  app,
  io, // 👈 يمكن تمرير io مباشرة أو app لاستخراجه
  userId,
  sender,
  title = "",
  message = "",
  type = "system",
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

  // بث سوكِت (يدعم io مباشرة أو استخراجها من app)
  try {
    const ioInstance = io || (app && app.get ? app.get("io") : null);
    if (ioInstance && userId) {
      ioInstance.to(String(userId)).emit("notification:new", {
        _id: doc._id,
        title: doc.title,
        message: doc.message,
        type: doc.type,
        referenceId: doc.referenceId,
        createdAt: doc.createdAt,
      });
    }
  } catch (error) {
    // سجل الخطأ بدل ترك الكتلة فارغة (يرضي ESLint ويُسهّل التتبع)
    console.error("notifyUser socket emit failed:", error);
  }

  return doc;
};
