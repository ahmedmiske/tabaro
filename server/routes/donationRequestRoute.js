// routes/donationRequestRoutes.js
const express = require('express');
const router = express.Router();

const {
  createDonationRequest,
  listDonationRequests,
  getDonationRequest,
  updateDonationRequest,
  deleteDonationRequest,
  getMineWithOffers,
  stopGeneralRequest,
} = require('../controllers/donationRequestController');

const { protect } = require('../middlewares/authMiddleware');
const { uploadDonationReq } = require('../middlewares/upload');

// رفع مرفقات الطلب
const uploadReqDocs = uploadDonationReq.fields([
  { name: 'files', maxCount: 10 },
]);

// ===== مهم: المسارات الثابتة قبل :id =====

// ✅ طلبات المستخدم مع العروض عليها
router.get('/mine-with-offers', protect, getMineWithOffers);

// ✅ إيقاف / إعادة تفعيل طلب
router.patch(
  '/:id([0-9a-fA-F]{24})/stop',
  protect,
  stopGeneralRequest,
);

// ===== CRUD الطلبات العامة =====

// قائمة عامة مع فلترة
router.get('/', listDonationRequests);

// تفاصيل طلب واحد
router.get('/:id([0-9a-fA-F]{24})', getDonationRequest);

// إنشاء
router.post('/', protect, uploadReqDocs, createDonationRequest);

// تعديل
router.put(
  '/:id([0-9a-fA-F]{24})',
  protect,
  uploadReqDocs,
  updateDonationRequest,
);

// حذف
router.delete(
  '/:id([0-9a-fA-F]{24})',
  protect,
  deleteDonationRequest,
);

module.exports = router;
