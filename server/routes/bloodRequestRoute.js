// server/routes/bloodRequestRoute.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const { upload } = require('../middlewares/upload');
const { protect } = require('../middlewares/authMiddleware');

const {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  updateBloodRequest,
  deleteBloodRequest,
} = require('../controllers/bloodRequestController');

const router = express.Router();
const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);

/** يقبل docs و files — حتى لا يظهر MulterError: Unexpected field */
const uploadDocs = upload.fields([
  { name: 'docs',  maxCount: 5 },
  { name: 'files', maxCount: 5 },
]);

/**
 * GET /api/blood-requests
 * ترقيم صفحات + فلاتر خفيفة
 * أمثلة:
 *   ?status=active&page=1&limit=12
 *   ?bloodType=O%2B&isUrgent=true
 */
router.get('/', async (req, res, next) => {
  try {
    const {
      status = 'all',
      page   = 1,
      limit  = 12,
      bloodType,
      isUrgent,
    } = req.query;

    const p = Math.max(parseInt(page, 10) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);

    const filter = {};
    if (status === 'active') filter.deadline = { $gte: new Date() };
    if (status === 'inactive') filter.deadline = { $lt: new Date() };
    if (bloodType) filter.bloodType = bloodType;
    if (isUrgent !== undefined) filter.isUrgent = String(isUrgent) === 'true';

    // نفوّض إلى الكنترولر لضمان إخراج موحّد
    req.query.page = String(p);
    req.query.limit = String(l);
    req._extraFilter = filter; // نمرّر فلتر إضافي اختياري
    return getBloodRequests(req, res, next);
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/blood-requests
 * إنشاء طلب (يدعم رفع متعدد عبر docs/files)
 */
router.post('/', protect, uploadDocs, createBloodRequest);

/**
 * GET /api/blood-requests/:id
 * طلب واحد
 */
router.get('/:id', getBloodRequestById);

/**
 * PUT /api/blood-requests/:id
 * تحديث (يمكن إضافة وثائق جديدة بنفس حقول الرفع)
 */
router.put('/:id', protect, uploadDocs, updateBloodRequest);

/**
 * DELETE /api/blood-requests/:id
 * حذف
 */
router.delete('/:id', protect, deleteBloodRequest);

/**
 * GET /api/blood-requests/:id/docs
 * قائمة الوثائق الخاصة بطلب
 */
router.get('/:id/docs', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ message: 'Invalid id' });

    const BloodRequest = require('../models/bloodRequest');
    const doc = await BloodRequest.findById(id).select('documents');
    if (!doc) return res.status(404).json({ message: 'Not found' });

    return res.json(doc.documents || []);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/blood-requests/docs/file/:filename
 * تقديم الملف نفسه بشكل آمن (inline للصور/PDF)
 */
router.get('/docs/file/:filename', (req, res) => {
  // منع path traversal
  const safeName = path.basename(req.params.filename || '');
  const filePath = path.join(__dirname, '../../uploads/blood-requests', safeName);

  if (!safeName || !fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  // تعيين نوع المحتوى
  const ext = path.extname(safeName).toLowerCase();
  if (ext === '.pdf') res.type('application/pdf');
  if (ext === '.jpg' || ext === '.jpeg') res.type('image/jpeg');
  if (ext === '.png') res.type('image/png');

  res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
  return res.sendFile(filePath);
});

module.exports = router;
