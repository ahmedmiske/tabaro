// server/routes/donationRequestRoute.js
const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const {
  createDonationRequest,
  listDonationRequests,
  getDonationRequest,
  updateDonationRequest,
  deleteDonationRequest,
} = require('../controllers/donationRequestController');

/* استخدم الـ uploader الصحيح من middleware */
const { uploadDonationReq } = require('../middlewares/upload');

/* اسم الحقل في الـ FormData = 'files' */
const uploadReqDocs = uploadDonationReq.fields([{ name: 'files', maxCount: 10 }]);

router.get('/', listDonationRequests);
router.get('/:id', getDonationRequest);

router.post('/',  protect, uploadReqDocs, createDonationRequest);
router.put('/:id', protect, uploadReqDocs, updateDonationRequest);
router.delete('/:id', protect, deleteDonationRequest);

module.exports = router;
