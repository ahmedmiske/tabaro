// server/controllers/readyToDonateBloodController.js
const ReadyToDonateBlood = require('../models/ReadyToDonateBlood');

// رقم موريتاني: 8 أرقام ويبدأ بـ 2 أو 3 أو 4
const isMRPhone = (v = '') => /^(2|3|4)\d{7}$/.test(String(v).trim());

exports.create = async (req, res) => {
  try {
    const {
      location = '',
      bloodType = '',
      availableUntil,
      note = '',
      contactMethods = [],
      // type موجود في الفورم لكن لا نحتاجه هنا
    } = req.body || {};

    // ✅ الموقع (اسم البلدية) إلزامي
    if (!location || !String(location).trim()) {
      return res.status(400).json({ error: 'location is required' });
    }

    // ✅ فصيلة الدم إلزامية
    if (!bloodType) {
      return res.status(400).json({ error: 'bloodType is required' });
    }

    // ✅ تاريخ الانتهاء
    if (!availableUntil) {
      return res.status(400).json({ error: 'availableUntil is required' });
    }
    const availableDate = new Date(availableUntil);
    if (Number.isNaN(availableDate.getTime())) {
      return res.status(400).json({ error: 'availableUntil is invalid date' });
    }

    // ✅ وسائل التواصل من الفورم: contactMethods: [{method, number}, ...]
    if (!Array.isArray(contactMethods)) {
      return res
        .status(400)
        .json({ error: 'contactMethods must be an array' });
    }

    // نزيل العناصر الفارغة، ونقبل phone / whatsapp فقط، ورقم موريتاني صحيح
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

    const createdBy = req.user?._id || null;

    const doc = await ReadyToDonateBlood.create({
      location: String(location).trim(),
      bloodType,
      availableUntil: availableDate,
      note,
      contactMethods: cleaned,
      createdBy,
    });

    return res.status(201).json({ ok: true, data: doc });
  } catch (err) {
    console.error('ReadyToDonateBlood.create', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const { q = '', bloodType, location } = req.query || {};
    const filter = {};

    if (bloodType) filter.bloodType = bloodType;
    if (location) filter.location = location;

    // بحث نصي بسيط
    if (q) {
      filter.$text = { $search: q };
    }

    const data = await ReadyToDonateBlood.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('createdBy', 'firstName lastName profileImage');

    return res.json({ ok: true, data });
  } catch (err) {
    console.error('ReadyToDonateBlood.list', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
