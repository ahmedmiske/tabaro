const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  registerUser, authUser, getUsers, updateUser, getUser,
  changePassword, deleteUser, resetPassword
} = require('../controllers/userController');

const {
  protect, authorize, protectRegisterUser
} = require('../middlewares/authMiddleware');

const {
  getUserNotifications, markNotificationAsRead, getUnreadNotificationCount
} = require('../controllers/notificationController');

const router = express.Router();

// ✅ إعداد التخزين للصور
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/profileImages/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// ✅ تسجيل مستخدم جديد مع رفع صورة
router.route('/')
  .post(upload.single('profileImage'), registerUser)
  .get(protect, authorize('admin'), getUsers);

// باقي الراوتر كما هو...
router.post('/login', authUser);

router.route('/profile')
  .put(protect, updateUser)
  .get(protect, getUser)
  .delete(protect, deleteUser);

router.put('/change-password', protect, changePassword);
router.put('/reset-password', protectRegisterUser, resetPassword);

// إشعارات
router.get('/notifications', protect, getUserNotifications);
router.put('/notifications/:id', protect, markNotificationAsRead);
router.get('/notifications/unread-count', protect, getUnreadNotificationCount);

module.exports.userRoutes = router;
// This code defines the user routes for the application.