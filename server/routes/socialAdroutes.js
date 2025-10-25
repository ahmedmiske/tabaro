// server/routes/socialAdroutes.js
const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/socialAdcontroller');

// 🟢 استخدم نفس Uploader المستخدم في الدم
// (ملف server/middlewares/upload.js يصدّر uploadBloodReq)
const { uploadBloodReq } = require('../middlewares/upload');

// نجعلها fields بدل array لتجنب MulterError ولتوسعة المستقبل
const uploadSocial = uploadBloodReq.fields([
  { name: 'files', maxCount: 5 },   // الملفات المرفوعة (صور/PDF)
  // يمكنك إضافة حقول أخرى لاحقًا إن رغبت
]);

// =================== عام ===================
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);

// =================== إنشاء/تحديث ===================
// ⬅️ هنا حل المشكلة: مرِّر uploadSocial (وليس upload.array)
router.post('/', protect, uploadSocial, ctrl.create);

router.patch('/:id', protect, ctrl.update);
router.patch('/:id/archive', protect, ctrl.archive);
router.post('/:id/renew', protect, ctrl.renew);

// (اختياري) للمشرف/الأدمن
// router.patch('/:id/publish', protect, authorize('moderator','admin'), ctrl.publish);
// router.patch('/:id/reject',  protect, authorize('moderator','admin'), ctrl.reject);

// =================== التفاعل ===================
router.post('/:id/report', protect, ctrl.report);
router.post('/:id/conversations', protect, ctrl.startConversation);

module.exports = router;
