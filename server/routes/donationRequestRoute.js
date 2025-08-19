const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/upload');
const {
  createDonationRequest,
  listDonationRequests,
  getDonationRequest,
  updateDonationRequest,
  deleteDonationRequest,
} = require('../controllers/donationRequestController');

// يدعم رفع متعدد باسم الحقل 'files' مثل الفورم
const uploadReqDocs = upload.fields([{ name: 'files', maxCount: 10 }]);

router.get('/', listDonationRequests);
router.get('/:id', getDonationRequest);

router.post('/', protect, uploadReqDocs, createDonationRequest);
router.put('/:id', protect, uploadReqDocs, updateDonationRequest);
router.delete('/:id', protect, deleteDonationRequest);

module.exports = router;
