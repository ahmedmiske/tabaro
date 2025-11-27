// server/controllers/readyToDonateGeneralController.js
const ReadyToDonateGeneral = require('../models/ReadyToDonateGeneral');

const isGenericPhone = (v = '') => /^[0-9]{6,15}$/.test(String(v).trim());

exports.create = async (req, res) => {
  try {
    const {
      type,              // يمكن تجاهله، الموديل يضع 'general'
      locationMode = 'none',
      location = '',
      city = '',
      country = '',
      availableUntil,
      note = '',
      extra = {},
      contactMethods = [],
    } = req.body || {};

    // نوع التبرع
    if (!extra || !extra.category) {
      return res.status(400).json({ error: 'category is required' });
    }

    // تاريخ الانتهاء
    if (!availableUntil) {
      return res.status(400).json({ error: 'availableUntil is required' });
    }
    const availableDate = new Date(availableUntil);
    if (Number.isNaN(availableDate.getTime())) {
      return res.status(400).json({ error: 'availableUntil is invalid date' });
    }

    // وسائل التواصل
    if (!Array.isArray(contactMethods) || contactMethods.length === 0) {
      return res
        .status(400)
        .json({ error: 'At least one contact method is required' });
    }

    for (const c of contactMethods) {
      if (!c?.method || !c?.number) {
        return res.status(400).json({ error: 'Invalid contact method' });
      }
      if (!['phone', 'whatsapp'].includes(c.method)) {
        return res.status(400).json({ error: 'Invalid contact method type' });
      }
      if (!isGenericPhone(c.number)) {
        return res.status(400).json({
          error: 'Contact numbers must be digits only (6–15 chars).',
        });
      }
    }

    const doc = await ReadyToDonateGeneral.create({
      locationMode,
      location: (location || '').trim(),
      city: (city || '').trim(),
      country: (country || '').trim(),
      availableUntil: availableDate,
      note,
      extra,
      contactMethods,
      createdBy: req.user?._id || null,
    });

    return res.status(201).json({ ok: true, data: doc });
  } catch (err) {
    console.error('ReadyToDonateGeneral.create', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const { q = '', city, country, category } = req.query || {};
    const filter = { type: 'general' };

    if (city) filter.city = city;
    if (country) filter.country = country;
    if (category) filter['extra.category'] = category;
    if (q) filter.$text = { $search: q };

    const data = await ReadyToDonateGeneral.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('createdBy', 'firstName lastName profileImage');

    return res.json({ ok: true, data });
  } catch (err) {
    console.error('ReadyToDonateGeneral.list', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
