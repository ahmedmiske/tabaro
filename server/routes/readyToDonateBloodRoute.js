// server/routes/readyToDonateBloodRoute.js
const express = require('express');
const router = express.Router();

const readyToDonateBloodController = require('../controllers/readyToDonateBloodController');

// قائمة الأشخاص المستعدين للتبرع بالدم
router.get('/', readyToDonateBloodController.list);

// إنشاء سجل جديد للاستعداد للتبرع بالدم
router.post('/', readyToDonateBloodController.create);

module.exports = router;
