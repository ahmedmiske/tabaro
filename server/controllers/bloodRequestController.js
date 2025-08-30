const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const BloodRequest = require('../models/bloodRequest');
const DonationConfirmation = require('../models/DonationConfirmation');

/* ========= Helpers ========= */
const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);
const toSafeRelPath = (folder, file) => `/uploads/${folder}/${file.filename}`;

/* ========= CREATE ========= */
exports.createBloodRequest = async (req, res) => {
  try {
    if (!req.user?._id) return res.status(401).json({ message: 'غير مصرح' });

    const {
      bloodType,
      description,
      location,
      isUrgent,
      deadline,   // تاريخ آخر أجل (string/ISO)
      title,      // إن كان لديك عنوان للطلب
    } = req.body;

    // ملفات مرفوعة بواسطة multer (middlewares/upload -> uploadBloodReq)
    const docs = Array.isArray(req.files?.docs) ? req.files.docs.map(f => toSafeRelPath('blood-requests', f)) : [];
    const files = Array.isArray(req.files?.files) ? req.files.files.map(f => toSafeRelPath('blood-requests', f)) : [];

    const payload = {
      userId: req.user._id,
      title: title || undefined,
      bloodType: bloodType || undefined,
      description: description || undefined,
      location: location || undefined,
      isUrgent: String(isUrgent) === 'true',
      deadline: deadline ? new Date(deadline) : undefined,
      // حقول شائعة في نموذجك (سمّها بما لديك في الـ model)
      proofDocuments: docs,
      attachments: files,
    };

    const created = await BloodRequest.create(payload);
    return res.status(201).json(created);
  } catch (err) {
    console.error('❌ createBloodRequest:', err);
    return res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};

/* ========= LIST (with filters & pagination) ========= */
exports.getBloodRequests = async (req, res) => {
  try {
    // قادمة من الراوتر (فلترة مسبقة)
    const {
      page = '1',
      limit = '12',
    } = req.query;

    const p = Math.max(parseInt(page, 10) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);

    // فلتر إضافي تم وضعه في الراوتر
    const extra = req._extraFilter || {};

    const q = { ...extra };

    const total = await BloodRequest.countDocuments(q);
    const data = await BloodRequest.find(q)
      .sort({ createdAt: -1 })
      .skip((p - 1) * l)
      .limit(l);

    return res.json({
      total,
      page: p,
      pages: Math.ceil(total / l),
      limit: l,
      data,
    });
  } catch (err) {
    console.error('❌ getBloodRequests:', err);
    return res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};

/* ========= READ ONE ========= */
exports.getBloodRequestById = async (req, res) => { // الاسم الذي يستورده الراوتر
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ message: 'معرّف غير صالح' });

    const doc = await BloodRequest.findById(id);
    if (!doc) return res.status(404).json({ message: 'غير موجود' });
    return res.json(doc);
  } catch (err) {
    console.error('❌ getBloodRequestById:', err);
    return res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};

/* ========= UPDATE ========= */
exports.updateBloodRequest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ message: 'معرّف غير صالح' });

    const doc = await BloodRequest.findById(id);
    if (!doc) return res.status(404).json({ message: 'غير موجود' });

    // صلاحية: المالك فقط
    if (String(doc.userId) !== String(req.user?._id)) {
      return res.status(403).json({ message: 'غير مصرح' });
    }

    const {
      bloodType,
      description,
      location,
      isUrgent,
      deadline,
      title,
    } = req.body;

    if (title !== undefined) doc.title = title;
    if (bloodType !== undefined) doc.bloodType = bloodType;
    if (description !== undefined) doc.description = description;
    if (location !== undefined) doc.location = location;
    if (isUrgent !== undefined) doc.isUrgent = String(isUrgent) === 'true';
    if (deadline !== undefined) doc.deadline = deadline ? new Date(deadline) : undefined;

    // إضافة ملفات جديدة (لا نحذف القديمة هنا)
    const newDocs = Array.isArray(req.files?.docs) ? req.files.docs.map(f => toSafeRelPath('blood-requests', f)) : [];
    const newFiles = Array.isArray(req.files?.files) ? req.files.files.map(f => toSafeRelPath('blood-requests', f)) : [];

    if (newDocs.length)  doc.proofDocuments = [...(doc.proofDocuments || []), ...newDocs];
    if (newFiles.length) doc.attachments   = [...(doc.attachments || []), ...newFiles];

    await doc.save();
    return res.json(doc);
  } catch (err) {
    console.error('❌ updateBloodRequest:', err);
    return res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};

/* ========= DELETE ========= */
exports.deleteBloodRequest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ message: 'معرّف غير صالح' });

    const doc = await BloodRequest.findById(id);
    if (!doc) return res.status(404).json({ message: 'غير موجود' });

    // صلاحية: المالك فقط
    if (String(doc.userId) !== String(req.user?._id)) {
      return res.status(403).json({ message: 'غير مصرح' });
    }

    // (اختياري) حذف الملفات من القرص
    const delFiles = [...(doc.proofDocuments || []), ...(doc.attachments || [])];
    delFiles.forEach((rel) => {
      try {
        const abs = path.join(__dirname, '..', rel.replace(/^\/+/, '')); // /uploads/...
        if (fs.existsSync(abs)) fs.unlinkSync(abs);
      } catch (_) {}
    });

    await doc.deleteOne();
    return res.json({ message: 'تم الحذف' });
  } catch (err) {
    console.error('❌ deleteBloodRequest:', err);
    return res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};

/* ========= CUSTOM: Mine with offers ========= */
exports.getMineWithOffers = async (req, res) => {
  try {
    const myId = req.user._id;

    const requests = await BloodRequest.find({ userId: myId })
      .sort({ createdAt: -1 })
      .lean();

    const reqIds = requests.map(r => r._id);
    const confirmations = await DonationConfirmation.find({ requestId: { $in: reqIds } })
      .populate('donor', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();

    const grouped = confirmations.reduce((acc, c) => {
      const key = String(c.requestId);
      (acc[key] ||= []).push(c);
      return acc;
    }, {});

    const result = requests.map(r => ({ ...r, offers: grouped[String(r._id)] || [] }));
    res.json(result);
  } catch (err) {
    console.error('❌ getMineWithOffers:', err);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};

/* ========= CUSTOM: My blood requests only ========= */
exports.getMyBloodRequests = async (req, res) => {
  try {
    const items = await BloodRequest.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error('❌ getMyBloodRequests:', err);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};
