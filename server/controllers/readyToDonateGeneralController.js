// server/controllers/readyToDonateGeneralController.js
const ReadyToDonateGeneral = require('../models/ReadyToDonateGeneral');

const isPhone = (v = '') => /^[0-9]{6,15}$/.test(String(v).trim());

exports.create = async (req, res) => {
  try {
    const body = req.body || {};
    const {
      locationMode = 'none',
      location = '',
      city = '',
      country = '',
      availableUntil,
      note = '',
      extra = {},
      contactMethods = [],
    } = body;

    // فحص نوع التبرع
    if (!extra?.category) {
      return res
        .status(400)
        .json({ error: 'category is required in extra.category' });
    }

    // تاريخ انتهاء العرض
    if (!availableUntil) {
      return res.status(400).json({ error: 'availableUntil is required' });
    }
    const untilDate = new Date(availableUntil);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(untilDate.getTime()) || untilDate < today) {
      return res
        .status(400)
        .json({ error: 'availableUntil must be today or a future date' });
    }

    // وسائل التواصل: يجب أن يكون هناك واحد على الأقل صالح
    if (!Array.isArray(contactMethods) || contactMethods.length === 0) {
      return res
        .status(400)
        .json({ error: 'At least one contact method is required' });
    }

    for (const c of contactMethods) {
      if (!c?.method || !c?.number) {
        return res.status(400).json({ error: 'Invalid contact method' });
      }
      if (!isPhone(c.number)) {
        return res
          .status(400)
          .json({ error: 'Contact numbers must be 6–15 digits' });
      }
    }

    const doc = await ReadyToDonateGeneral.create({
      locationMode,
      location,
      city,
      country,
      availableUntil: untilDate,
      note,
      extra,
      contactMethods,
      createdBy: req.user?._id || null,
    });

    return res.status(201).json({ ok: true, data: doc });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('ReadyToDonateGeneral.create', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const { category, q = '' } = req.query || {};
    const filter = {};

    if (category) {
      filter['extra.category'] = category;
    }

    // إظهار العروض التي لم تنتهِ بعد فقط
    const now = new Date();
    filter.availableUntil = { $gte: now };

    if (q) {
      filter.$text = { $search: q };
    }

    const data = await ReadyToDonateGeneral.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('createdBy', 'firstName lastName profileImage');

    return res.json({ ok: true, data });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('ReadyToDonateGeneral.list', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
