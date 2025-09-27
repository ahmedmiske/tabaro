const express = require('express');
const router = express.Router();
const { getPublicUser } = require('../controllers/publicProfileController');
const { protect } = require('../middlewares/authMiddleware');

// لو تبغى السماح بدون تسجيل دخول، احذف protect
router.get('/users/:id', protect, getPublicUser);

module.exports = router;
