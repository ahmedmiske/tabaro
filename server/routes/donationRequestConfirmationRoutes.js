const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const { createConfirmation, listByRequest } = require('../controllers/donationRequestConfirmationController');
const { upload } = require('../middlewares/upload');

// ⛳ يدعم رفع متعدد باسم الحقل 'files'
router.post(
  '/',
  protect,
   upload.fields([{ name: 'files', maxCount: 10 }]),
  createConfirmation
);

router.get('/by-request/:id', protect, listByRequest);

module.exports = router;
