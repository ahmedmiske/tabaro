// server/controllers/readyToDonateBloodController.js
// Simple controller for creating "ready to donate blood" entries.
const ReadyToDonateBlood = require('../models/ReadyToDonateBlood');

const isEightDigits = (v = '') => /^\d{8}$/.test(v);

exports.create = async (req, res) => {
  try {
    const { type = 'blood', location, bloodType, note = '', contactMethods = [] } = req.body || {};

    // Basic validation
    if (!location || !bloodType) {
      return res.status(400).json({ error: 'location and bloodType are required' });
    }
    if (!Array.isArray(contactMethods) || contactMethods.length < 1) {
      return res.status(400).json({ error: 'At least one contact method is required' });
    }

    // Validate phone fields
    for (const c of contactMethods) {
      if (!c?.method || !c?.number) {
        return res.status(400).json({ error: 'Invalid contact method payload' });
      }
      if (!isEightDigits(c.number)) {
        return res.status(400).json({ error: 'Contact numbers must be 8 digits' });
      }
    }

    const doc = await ReadyToDonateBlood.create({
      type,
      location,
      bloodType,
      note,
      contactMethods,
      createdBy: req.user?._id || null   // if you attach user in auth middleware
    });

    return res.status(201).json({ ok: true, data: doc });
  } catch (err) {
    console.error('readyToDonate.create error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Optional: list/filter for admins or matching donors/requests
exports.list = async (req, res) => {
  try {
    const { q = '', bloodType, location } = req.query || {};
    const filter = { type: 'blood' };
    if (bloodType) filter.bloodType = bloodType;
    if (location) filter.location = location;
    if (q) filter.$text = { $search: q };

    const data = await ReadyToDonateBlood.find(filter).sort({ createdAt: -1 }).limit(100);
    return res.json({ ok: true, data });
  } catch (err) {
    console.error('readyToDonate.list error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
