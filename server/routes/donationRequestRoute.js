const express = require('express');
const router = express.Router();

const {
  createDonationRequest,
  listDonationRequests,
  getDonationRequest,
  updateDonationRequest,
  deleteDonationRequest,
  getMineWithOffers,
  stopGeneralRequest, // ⬅️ جديد
} = require('../controllers/donationRequestController');
const { protect } = require('../middlewares/authMiddleware');
const { uploadDonationReq } = require('../middlewares/upload');

const uploadReqDocs = uploadDonationReq.fields([
  { name: 'files', maxCount: 10 },
]);

// ✅ ثابت قبل :id
router.get('/mine-with-offers', protect, getMineWithOffers);

// ✅ إيقاف نشر الطلب العام
router.patch(
  '/:id([0-9a-fA-F]{24})/stop',
  protect,
  stopGeneralRequest,
);

// قائمة عامة مع فلترة
router.get('/', listDonationRequests);

// واحد
router.get('/:id([0-9a-fA-F]{24})', getDonationRequest);

// إنشاء / تعديل / حذف
router.post('/', protect, uploadReqDocs, createDonationRequest);
router.put(
  '/:id([0-9a-fA-F]{24})',
  protect,
  uploadReqDocs,
  updateDonationRequest,
);
router.delete('/:id([0-9a-fA-F]{24})', protect, deleteDonationRequest);

module.exports = router;
