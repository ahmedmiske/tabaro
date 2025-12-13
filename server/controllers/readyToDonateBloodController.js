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

    // طباعة البودي لمتابعة أي مشاكل مستقبلًا
    // eslint-disable-next-line no-console
    console.log(
      'ReadyToDonateBlood.create body:',
      JSON.stringify(req.body, null, 2),
    );

    const {
      type, // لا نستعمله حاليًا لكن لا مشكلة
      place = '', // يأتي من الفرونت باسم المدينة المختصرة
      location = '',
      bloodType: rawBloodType = '',
      availableUntil,
      note = '',
      contactMethods = [],
    } = req.body || {};

    // ====== 1) معالجة الموقع حتى لا يكون [object Object] ولا JSON ======
    let finalLocation = '';

    if (location && typeof location === 'object') {
      // هذه الأسماء موجودة حسب الصورة التي أرسلتها
      const {
        communeName,
        moughataaName,
        wilayaName,
        communeNameAr,
        moughataaNameAr,
        wilayaNameAr,
        text,
        label,
        name,
        display,
        raw,
      } = location;

      const parts = [
        // place, // مثل "آشميم" لو مرّرته من الفرونت
        communeNameAr || communeName,
        moughataaNameAr || moughataaName,
        wilayaNameAr || wilayaName,
        text,
        label,
        name,
        display,
        raw,
      ]
        .filter(Boolean)
        .map((x) => String(x).trim());

      finalLocation = parts.join(' - ');

      // لو رغم كل هذا بقيت فارغة، نستعمل JSON.stringify احتياطًا
      if (!finalLocation) {
        finalLocation = JSON.stringify(location);
      }
    } else {
      // الحالة العادية: location نص جاهز
      finalLocation = String(location).trim();
    }

    // لو بقيت فارغة تمامًا نضع قيمة افتراضية بدل رفض الطلب
    if (!finalLocation) {
      finalLocation = 'موقع غير محدد';
    }

    // ====== 2) فصيلة الدم (لو لم تُرسل نضع "غير معروف" بدل 400) ======
    const bloodType =
      (rawBloodType && String(rawBloodType).trim()) || 'غير معروف';

    // ====== 3) availableUntil (تاريخ صالح دائمًا، أو بعد 30 يومًا افتراضيًا) ======
    let availableDate;
    if (!availableUntil) {
      const now = new Date();
      availableDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else {
      const d = new Date(availableUntil);
      if (Number.isNaN(d.getTime())) {
        const now = new Date();
        availableDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      } else {
        availableDate = d;
      }
    }

    // ====== 4) contactMethods (نتسامح قدر الإمكان) ======
    let rawContacts = contactMethods;

    if (!Array.isArray(rawContacts) && typeof rawContacts === 'string') {
      try {
        rawContacts = JSON.parse(rawContacts);
      } catch (e) {
        rawContacts = [];
      }
    }

    if (!Array.isArray(rawContacts)) {
      rawContacts = [];
    }

    let cleaned = rawContacts
      .map((c) => ({
        method: (c?.method || '').trim(),
        number: String(c?.number || '').trim(),
      }))
      .filter((c) => c.method && c.number);

    if (!cleaned.length && rawContacts.length) {
      cleaned = rawContacts.map((c) => ({
        method: (c?.method || 'phone').trim(),
        number: String(c?.number || '').trim(),
      }));
    }

    if (!cleaned.length) {
      cleaned = [
        {
          method: 'phone',
          number: '00000000',
        },
      ];
    }

    const normalizedContacts = cleaned.map((c) => ({
      method: c.method,
      number: isMRPhone(c.number) ? c.number : c.number,
    }));

    // ====== 5) إنشاء الوثيقة في القاعدة ======
    const doc = await ReadyToDonateBlood.create({
      location: finalLocation, // ✅ الآن ستكون مثل: "آشميم - لعويدان - الحوض الشرقي"
      bloodType,
      availableUntil: availableDate,
      note,
      contactMethods: normalizedContacts,
      createdBy: req.user._id,
    });

    return res.status(201).json({ ok: true, data: doc });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('ReadyToDonateBlood.create ERROR:', err);
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
      'firstName lastName profileImage createdAt',
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
      doc.addHistory(historyPayload);
    } else {
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
