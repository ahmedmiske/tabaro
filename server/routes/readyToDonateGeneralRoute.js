// server/routes/readyToDonateGeneralRoute.js
const express = require('express');
const path = require('path');
const multer = require('multer');

const router = express.Router();

const ctrl = require('../controllers/readyToDonateGeneralController');

// ===== إعداد التخزين للملفات =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // تأكد أن هذا المسار موجود فعليًا على السيرفر
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
    fileSize: 5 * 1024 * 1024, // 5MB لكل ملف (يمكنك تعديله)
  },
});

// ✅ إنشاء إعلان استعداد للتبرع (مع إمكانية رفع صور/وثائق)
router.post('/', upload.array('attachments', 10), ctrl.create);

// ✅ جلب قائمة الاستعدادات
router.get('/', ctrl.list);
// 👈 جديد: عرض تفاصيل عرض واحد حسب الـ id
router.get('/:id', ctrl.getOne);

module.exports = router;
