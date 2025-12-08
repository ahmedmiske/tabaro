// server/routes/readyToDonateGeneralRoute.js
const express = require('express');
const path = require('path');
const multer = require('multer');

const router = express.Router();

const ctrl = require('../controllers/readyToDonateGeneralController');
const { protect } = require('../middlewares/authMiddleware');

// ===== إعداد التخزين للملفات =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'ready-general'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '');
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// ✅ إنشاء إعلان استعداد للتبرع (محمي + مرفقات اختيارية)
router.post('/', protect, upload.array('attachments', 10), ctrl.create);

// ✅ جلب قائمة الاستعدادات (تُظهر النشطة فقط حسب الكنترولر)
router.get('/', ctrl.list);

// ✅ تفاصيل عرض واحد
router.get('/:id', ctrl.getOne);

// ✅ إيقاف / إعادة تفعيل عرض
router.patch('/:id/stop', protect, ctrl.stopReadyToDonateGeneral);

module.exports = router;
