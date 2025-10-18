// server/controllers/readyToDonateBloodController.js
const ReadyToDonateBlood = require('../models/ReadyToDonateBlood');
const isEight = (v='') => /^\d{8}$/.test(v);

exports.create = async (req, res) => {
  try {
    const { location, bloodType, note = '', contactMethods = [] } = req.body || {};
    if (!location || !bloodType) return res.status(400).json({ error: 'location & bloodType are required' });
    if (!Array.isArray(contactMethods) || contactMethods.length === 0) {
      return res.status(400).json({ error: 'At least one contact method is required' });
    }
    for (const c of contactMethods) {
      if (!c?.method || !c?.number) return res.status(400).json({ error: 'Invalid contact method' });
      if (!isEight(c.number)) return res.status(400).json({ error: 'Contact numbers must be 8 digits' });
    }

    const doc = await ReadyToDonateBlood.create({
      location, bloodType, note, contactMethods, createdBy: req.user?._id || null
    });
    res.status(201).json({ ok: true, data: doc });
  } catch (err) {
    console.error('Blood.create', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const { q = '', bloodType, location } = req.query || {};
    const filter = {};
    if (bloodType) filter.bloodType = bloodType;
    if (location) filter.location = location;
    if (q) filter.$text = { $search: q };

    const data = await ReadyToDonateBlood
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('createdBy', 'firstName lastName profileImage'); // ⬅️ مهم

    res.json({ ok: true, data });
  } catch (err) {
    console.error('Blood.list', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
