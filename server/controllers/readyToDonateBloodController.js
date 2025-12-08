// server/controllers/readyToDonateBloodController.js
const ReadyToDonateBlood = require('../models/ReadyToDonateBlood');
const { addHistory } = require('../models/plugins/statusPlugin'); // 👈 مهم

// رقم موريتاني: 8 أرقام ويبدأ بـ 2 أو 3 أو 4
const isMRPhone = (v = '') => /^(2|3|4)\d{7}$/.test(String(v).trim());

/**
 * إنشاء استعداد للتبرع بالدم
 */
exports.create = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: 'غير مصرح، يرجى تسجيل الدخول' });
    }

    const {
      location = '',
      bloodType = '',
      availableUntil,
      note = '',
      contactMethods = [],
    } = req.body || {};

    if (!location || !String(location).trim()) {
      return res.status(400).json({ error: 'location is required' });
    }

    if (!bloodType) {
      return res.status(400).json({ error: 'bloodType is required' });
    }

    if (!availableUntil) {
      return res.status(400).json({ error: 'availableUntil is required' });
    }
    const availableDate = new Date(availableUntil);
    if (Number.isNaN(availableDate.getTime())) {
      return res.status(400).json({ error: 'availableUntil is invalid date' });
    }

    if (!Array.isArray(contactMethods)) {
      return res.status(400).json({ error: 'contactMethods must be an array' });
    }

    const cleaned = contactMethods
      .map((c) => ({
        method: (c?.method || '').trim(),
        number: (c?.number || '').trim(),
      }))
      .filter(
        (c) =>
          c.method &&
          ['phone', 'whatsapp'].includes(c.method) &&
          isMRPhone(c.number),
      );

    if (!cleaned.length) {
      return res.status(400).json({
        error:
          'At least one valid contact (phone or whatsapp Mauritanian number) is required',
      });
    }

    const doc = await ReadyToDonateBlood.create({
      location: String(location).trim(),
      bloodType,
      availableUntil: availableDate,
      note,
      contactMethods: cleaned,
      createdBy: req.user._id,
      // status & historyActions من الـ plugin
    });

    return res.status(201).json({ ok: true, data: doc });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('ReadyToDonateBlood.create', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * قائمة المتبرعين المستعدين
 */
exports.list = async (req, res) => {
  try {
    const { q = '', bloodType, location, status = 'active' } = req.query || {};
    const filter = {};

    if (bloodType) filter.bloodType = bloodType;
    if (location) filter.location = location;

    // افتراضيًا: فقط النشطة
    if (status && status !== 'all') {
      filter.status = status;
    }

    if (q) {
      filter.$text = { $search: q };
    }

    const data = await ReadyToDonateBlood.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('createdBy', 'firstName lastName profileImage');

    return res.json({ ok: true, data });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('ReadyToDonateBlood.list', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * جلب تفاصيل استعداد واحد للتبرع بالدم
 */
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await ReadyToDonateBlood.findById(id).populate(
      'createdBy',
      'firstName lastName profileImage createdAt'
    );

    if (!doc) {
      return res
        .status(404)
        .json({ message: 'عرض الاستعداد للتبرع بالدم غير موجود' });
    }

    return res.json({ ok: true, data: doc });
  } catch (err) {
    console.error('❌ getOne ReadyToDonateBlood:', err);
    return res.status(500).json({
      message: 'خطأ أثناء جلب تفاصيل عرض الاستعداد',
      error: err.message,
    });
  }
};


/**
 * إيقاف / إعادة تفعيل استعداد التبرع بالدم
 */
exports.stopReadyToDonateBlood = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = '' } = req.body || {};
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'غير مصرح، يرجى تسجيل الدخول' });
    }

    const doc = await ReadyToDonateBlood.findById(id);
    if (!doc) {
      return res
        .status(404)
        .json({ message: 'عرض الاستعداد للتبرع بالدم غير موجود' });
    }

    // فقط صاحب الإعلان
    if (String(doc.createdBy) !== String(userId)) {
      return res
        .status(403)
        .json({ message: 'غير مسموح لك بتعديل حالة هذا العرض' });
    }

    const oldStatus = doc.status || 'active';
    const willPause = oldStatus === 'active';

    let newStatus;
    if (willPause) {
      newStatus = 'paused';
      doc.closedReason = reason.trim() || doc.closedReason || '';
      doc.closedAt = new Date();
    } else {
      newStatus = 'active';
      // إن أردت مسح سبب الإيقاف عند التفعيل:
      // doc.closedReason = '';
      // doc.closedAt = null;
    }

    doc.status = newStatus;

    // 📝 تسجيل الحركة في historyActions
    const historyPayload = {
      action: willPause ? 'user_stop' : 'user_reactivate',
      by: userId,
      role: 'user',
      fromStatus: oldStatus,
      toStatus: newStatus,
      reason: willPause ? reason : undefined,
    };

    if (typeof doc.addHistory === 'function') {
      // method من الـ plugin
      doc.addHistory(historyPayload);
    } else {
      // احتياطاً لو الميثود غير موجودة
      if (!Array.isArray(doc.historyActions)) doc.historyActions = [];
      doc.historyActions.push({
        ...historyPayload,
        createdAt: new Date(),
      });
    }

    await doc.save();

    const populated = await ReadyToDonateBlood.findById(doc._id).populate(
      'createdBy',
      'firstName lastName profileImage',
    );

    return res.json({
      message: willPause ? 'تم إيقاف نشر العرض.' : 'تم إعادة تفعيل العرض.',
      data: populated,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('❌ stopReadyToDonateBlood:', err);
    return res.status(500).json({
      message: 'خطأ أثناء تحديث حالة العرض',
      error: err.message,
    });
  }
};
