// server/routes/readyToDonateBloodRoute.js
const express = require('express');
const router = express.Router();

// ✅ تأكد أن المسار صحيح
const readyToDonateBloodController = require('../controllers/readyToDonateBloodController');

// لو عندك ميدل وير للحماية استعمله هنا
// const requireAuth = require('../middleware/requireAuth');

// قائمة الأشخاص المستعدين للتبرع بالدم
router.get(
  '/',
  // requireAuth,
  readyToDonateBloodController.list
);

// إنشاء سجل جديد للاستعداد للتبرع بالدم
router.post(
  '/',
  // requireAuth,
  readyToDonateBloodController.create
);

module.exports = router;
