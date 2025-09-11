// server/controllers/bloodRequestController.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const BloodRequest = require('../models/bloodRequest');
const DonationConfirmation = require('../models/DonationConfirmation');

/* ========= Helpers ========= */
const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);
const toRel = (folder, f) => `/uploads/${folder}/${f.filename}`;
const toDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

// contactMethods[0][method]/[number]  أو JSON كسلسلة
function parseBracketArray(body, root, fields) {
  const re = new RegExp(`^${root}\\[(\\d+)\\]\\[(${fields.join('|')})\\]$`);
  const map = new Map();
  for (const [k, val] of Object.entries(body)) {
    const m = k.match(re);
    if (!m) continue;
    const idx = Number(m[1]);
    const f = m[2];
    const obj = map.get(idx) || {};
    obj[f] = val;
    map.set(idx, obj);
  }
  return Array.from(map.keys())
    .sort((a, b) => a - b)
    .map((k) => map.get(k))
    .filter((o) => Object.values(o).some((v) => String(v || '').trim() !== ''));
}
function parseFlexibleArray(body, root, fields) {
  const bracket = parseBracketArray(body, root, fields);
  if (bracket.length) return bracket;

  const raw = body[root];
  if (typeof raw === 'string') {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    } catch { /* ignore */ }
  }
  if (Array.isArray(body[root])) return body[root];
  return [];
}

// اجمع كائنات multer نفسها
function collectMulterFiles(req) {
  const out = [];
  if (req.files?.docs)  out.push(...req.files.docs);
  if (req.files?.files) out.push(...req.files.files);
  if (Array.isArray(req.files)) out.push(...req.files);
  if (req.file) out.push(req.file);
  return out;
}

// حوّلها إلى كائنات تناسب الـSchema (subdocument)
function mapToDocumentObjects(multerFiles, folder = 'blood-requests') {
  return multerFiles.map((f) => {
    const url = toRel(folder, f);
    return {
      url,          // أو استخدم key = "path" حسب الـSchema لديك
      path: url,    // أضف كِلاهما لتوافق سهل
      name: f.originalname,
      mime: f.mimetype,
      size: f.size,
      uploadedAt: new Date(),
    };
  });
}

/* ========= CREATE ========= */
exports.createBloodRequest = async (req, res) => {
  try {
    if (!req.user?._id) return res.status(401).json({ message: 'غير مصرح' });

    const {
      bloodType,
      description,
      location,
      isUrgent,
      deadline,
      title,
    } = req.body;

    const contactMethods = parseFlexibleArray(req.body, 'contactMethods', ['method', 'number']);

    // كل الرفع يصبح داخل documents فقط
    const uploaded = collectMulterFiles(req);
    const documentObjs = mapToDocumentObjects(uploaded, 'blood-requests');

    const created = await BloodRequest.create({
      userId: req.user._id,
      title: title || undefined,
      bloodType: bloodType || undefined,
      description: description || undefined,
      location: location || undefined,
      isUrgent: String(isUrgent) === 'true' || isUrgent === true,
      deadline: toDate(deadline),
      contactMethods,
      documents: documentObjs,  // ✅ فقط هذا الحقل
      // لا نكتب files نهائيًا بعد الآن
    });

    const populated = await BloodRequest.findById(created._id).populate({
      path: 'userId',
      model: 'User',
      select: 'firstName lastName profileImage phoneNumber email',
    });

    return res.status(201).json(populated);
  } catch (err) {
    console.error('❌ createBloodRequest:', err);
    return res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};

/* ========= LIST ========= */
exports.getBloodRequests = async (req, res) => {
  try {
    const { page = '1', limit = '12' } = req.query;
    const p = Math.max(parseInt(page, 10) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);
    const extra = req._extraFilter || {};

    const total = await BloodRequest.countDocuments(extra);
    const data = await BloodRequest.find(extra)
      .sort({ createdAt: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .populate({ path: 'userId', select: 'firstName lastName profileImage' });

    res.json({ total, page: p, pages: Math.ceil(total / l), limit: l, data });
  } catch (err) {
    console.error('❌ getBloodRequests:', err);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};

/* ========= READ ONE ========= */
exports.getBloodRequestById = async (req, res) => {
  try {
    const doc = await BloodRequest.findById(req.params.id).populate({
      path: 'userId',
      model: 'User',
      select: 'firstName lastName profileImage phoneNumber email',
    });
    if (!doc) return res.status(404).json({ message: 'طلب التبرع غير موجود' });
    res.json({ data: doc });
  } catch (e) {
    console.error('getBloodRequestById:', e);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};

/* ========= UPDATE ========= */
exports.updateBloodRequest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ message: 'معرّف غير صالح' });

    const doc = await BloodRequest.findById(id);
    if (!doc) return res.status(404).json({ message: 'غير موجود' });
    if (String(doc.userId) !== String(req.user?._id)) {
      return res.status(403).json({ message: 'غير مصرح' });
    }

    const { bloodType, description, location, isUrgent, deadline, title } = req.body;
    if (title !== undefined) doc.title = title;
    if (bloodType !== undefined) doc.bloodType = bloodType;
    if (description !== undefined) doc.description = description;
    if (location !== undefined) doc.location = location;
    if (isUrgent !== undefined) doc.isUrgent = String(isUrgent) === 'true' || isUrgent === true;
    if (deadline !== undefined) doc.deadline = toDate(deadline);

    const incomingContact = parseFlexibleArray(req.body, 'contactMethods', ['method', 'number']);
    if (incomingContact.length) doc.contactMethods = incomingContact;

    // أضف ملفات جديدة إلى documents فقط
    const uploaded = collectMulterFiles(req);
    if (uploaded.length) {
      const documentObjs = mapToDocumentObjects(uploaded, 'blood-requests');
      doc.documents = [...(doc.documents || []), ...documentObjs];
      // لا نلمس doc.files إطلاقًا
    }

    await doc.save();

    const populated = await BloodRequest.findById(doc._id).populate({
      path: 'userId',
      select: 'firstName lastName profileImage phoneNumber email',
    });
    res.json(populated);
  } catch (err) {
    console.error('❌ updateBloodRequest:', err);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};

/* ========= DELETE ========= */
exports.deleteBloodRequest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ message: 'معرّف غير صالح' });

    const doc = await BloodRequest.findById(id);
    if (!doc) return res.status(404).json({ message: 'غير موجود' });
    if (String(doc.userId) !== String(req.user?._id)) {
      return res.status(403).json({ message: 'غير مصرح' });
    }

    // اجمع المسارات من documents (url/path) + أي legacy داخل files للتنظيف فقط
    const fromDocs = (doc.documents || [])
      .map((d) => d?.url || d?.path)
      .filter(Boolean);
    const legacy = (doc.files || []); // قديم – لا نكتب له مستقبلًا
    const delFiles = Array.from(new Set([...fromDocs, ...legacy]));

    for (const rel of delFiles) {
      try {
        const abs = path.join(__dirname, '..', rel.replace(/^\/+/, ''));
        if (fs.existsSync(abs)) fs.unlinkSync(abs);
      } catch (_) {}
    }

    await doc.deleteOne();
    res.json({ message: 'تم الحذف' });
  } catch (err) {
    console.error('❌ deleteBloodRequest:', err);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};

/* ========= CUSTOM ========= */
exports.getMineWithOffers = async (req, res) => {
  try {
    const myId = req.user._id;
    const requests = await BloodRequest.find({ userId: myId }).sort({ createdAt: -1 }).lean();
    const reqIds = requests.map((r) => r._id);
    const confirmations = await DonationConfirmation.find({ requestId: { $in: reqIds } })
      .populate('donor', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();

    const grouped = confirmations.reduce((acc, c) => {
      const k = String(c.requestId);
      (acc[k] ||= []).push(c);
      return acc;
    }, {});
    res.json(requests.map((r) => ({ ...r, offers: grouped[String(r._id)] || [] })));
  } catch (err) {
    console.error('❌ getMineWithOffers:', err);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};

exports.getMyBloodRequests = async (req, res) => {
  try {
    const items = await BloodRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error('❌ getMyBloodRequests:', err);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};
