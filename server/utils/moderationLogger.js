const ModerationLog = require('../models/ModerationLog');

async function addModerationLog({
  action,
  targetType,
  targetId,
  performedBy,
  performedByRole,
  reason,
  meta,
}) {
  try {
    await ModerationLog.create({
      action,
      targetType,
      targetId,
      performedBy,
      performedByRole,
      reason,
      meta,
    });
  } catch (err) {
    // لا نوقف الطلب إذا فشل اللوج، فقط نطبع الخطأ
    console.error('Failed to write moderation log', err);
  }
}

module.exports = { addModerationLog };
