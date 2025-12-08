const fs = require('fs');
const path = require('path');
const express = require('express');

const {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  updateBloodRequest,
  deleteBloodRequest,
  getMineWithOffers,
  getMyBloodRequests,
  stopBloodRequest, // ⬅️ جديد
} = require('../controllers/bloodRequestController');

const { protect } = require('../middlewares/authMiddleware');
const { uploadBloodReq } = require('../middlewares/upload');

const router = express.Router();

/* يقبل docs و files لتجنّب MulterError */
const uploadDocs = uploadBloodReq.fields([
  { name: 'docs', maxCount: 5 },
  { name: 'files', maxCount: 5 },
]);

/* =========================
   ✅ مسارات ثابتة أولاً
   ========================= */

// طلباتي مع العروض
router.get('/mine-with-offers', protect, getMineWithOffers);

// فقط طلباتي (بدون عروض)
router.get('/mine', protect, getMyBloodRequests);

/* تقديم الملفات inline من server/uploads/blood-requests */
router.get('/docs/file/:filename', (req, res) => {
  const safeName = path.basename(req.params.filename || '');
  const filePath = path.join(
    __dirname,
    '..',
    'uploads',
    'blood-requests',
    safeName,
  );

  if (!safeName || !fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  const ext = path.extname(safeName).toLowerCase();
  if (ext === '.pdf') res.type('application/pdf');
  if (ext === '.jpg' || ext === '.jpeg') res.type('image/jpeg');
  if (ext === '.png') res.type('image/png');

  res.setHeader(
    'Content-Disposition',
    `inline; filename="${safeName}"`,
  );
  return res.sendFile(filePath);
});

/* =========================
   🔎 الفهرس العام مع التصفية
   ========================= */
router.get('/', async (req, res, next) => {
  try {
    const {
      status = 'all',
      page = 1,
      limit = 12,
      bloodType,
      isUrgent,
    } = req.query;

    const p = Math.max(parseInt(page, 10) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);

    const filter = {};

    // ✅ منطق status موحد:
    // - افتراضياً: active
    // - inactive = paused + finished (للتوافق مع القديم)
    if (status && status !== 'all') {
      if (status === 'inactive') {
        filter.status = { $in: ['paused', 'finished'] };
      } else {
        filter.status = status;
      }
    } else {
      filter.status = 'active';
    }

    if (bloodType) filter.bloodType = bloodType;
    if (isUrgent !== undefined)
      filter.isUrgent = String(isUrgent) === 'true';

    req.query.page = String(p);
    req.query.limit = String(l);
    req._extraFilter = filter;

    return getBloodRequests(req, res, next);
  } catch (e) {
    next(e);
  }
});

/* =========================
   ✍️ إنشاء/تعديل/حذف
   ========================= */
router.post('/', protect, uploadDocs, createBloodRequest);

/* ================================
   🛑 مسار إيقاف نشر الطلب (جديد)
   ================================ */
router.patch(
  '/:id([0-9a-fA-F]{24})/stop',
  protect,
  stopBloodRequest,
);

/* ================================
   🔍 تفاصيل وتحديث وحذف الطلب
   ================================ */
router.get('/:id([0-9a-fA-F]{24})', getBloodRequestById);
router.put(
  '/:id([0-9a-fA-F]{24})',
  protect,
  uploadDocs,
  updateBloodRequest,
);
router.delete(
  '/:id([0-9a-fA-F]{24})',
  protect,
  deleteBloodRequest,
);

module.exports = router;
