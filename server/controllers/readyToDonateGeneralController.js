const ReadyToDonateGeneral = require('../models/ReadyToDonateGeneral');
const isEight = (v='') => /^\d{8}$/.test(v);

exports.create = async (req, res) => {
  try {
    const { city, note = '', extra = {}, contactMethods = [] } = req.body || {};

    if (!city) return res.status(400).json({ error: 'city is required' });
    if (!Array.isArray(contactMethods) || contactMethods.length === 0) {
      return res.status(400).json({ error: 'At least one contact method is required' });
    }
    for (const c of contactMethods) {
      if (!c?.method || !c?.number) return res.status(400).json({ error: 'Invalid contact method' });
      if (!isEight(c.number)) return res.status(400).json({ error: 'Contact numbers must be 8 digits' });
    }

    const category = extra?.category || 'money';
    if (!['money','goods','time','other'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const doc = await ReadyToDonateGeneral.create({
      city, note, extra: { category }, contactMethods,
      createdBy: req.user?._id || null
    });
    res.status(201).json({ ok: true, data: doc });
  } catch (err) {
    console.error('General.create', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const { q = '', city, category } = req.query || {};
    const filter = {};
    if (city) filter.city = city;
    if (category) filter['extra.category'] = category;
    if (q) filter.$text = { $search: q };

    const data = await ReadyToDonateGeneral.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json({ ok: true, data });
  } catch (err) {
    console.error('General.list', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
