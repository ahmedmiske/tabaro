const express = require('express');
const router = express.Router();

const readyToDonateBloodController = require('../controllers/readyToDonateBloodController');
const { protect } = require('../middlewares/authMiddleware');

// قائمة الأشخاص المستعدين للتبرع بالدم (يمكن عرضها للعامة)
router.get('/', readyToDonateBloodController.list);

// تفاصيل عرض واحد
router.get('/:id', readyToDonateBloodController.getOne);

// إنشاء سجل جديد للاستعداد للتبرع بالدم 👈 محمي
router.post('/', protect, readyToDonateBloodController.create);

// إيقاف / إعادة تفعيل نشر عرض الاستعداد بالتبرع بالدم (لصاحب الإعلان فقط)
router.patch(
  '/:id/stop',
  protect,
  readyToDonateBloodController.stopReadyToDonateBlood,
);

module.exports = router;
