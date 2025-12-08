// utils/historyLogger.js
function addHistory(doc, payload = {}) {
  if (!doc) return;

  const {
    action,
    by,      // يمكن أن نرسلها باسم by
    user,    // أو باسم user (توافق مع الكود القديم)
    role,
    fromStatus,
    toStatus,
    reason,
    note,
    extra,
  } = payload;

  const entry = {
    action: action || 'unknown',
    // 👈 هنا المهم: نحاول by أولاً، وبعدها user
    by: by || user || null,
    role: role || 'system',
    fromStatus: fromStatus ?? null,
    toStatus: toStatus ?? null,
    reason: reason || undefined,
    note: note || undefined,
    extra: extra || undefined,
    createdAt: new Date(),
  };

  if (!Array.isArray(doc.historyActions)) {
    doc.historyActions = [];
  }

  doc.historyActions.push(entry);
}

module.exports = { addHistory };

