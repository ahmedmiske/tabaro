const express = require('express');
const {
  registerUser,
  authUser,
  getUsers,
  updateUser,
  getUser,
  changePassword,
  deleteUser,
  resetPassword
} = require('../controllers/userController');

const {
  protect,
  authorize,
  protectRegisterUser
} = require('../middlewares/authMiddleware');

const {
  getUserNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount
} = require('../controllers/notificationController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Users
 *  description: API for users in the system
 */

router.post('/login', authUser);

router.route('/')
  .post(protectRegisterUser, registerUser)
  .get(protect, authorize('admin'), getUsers);

router.route('/profile')
  .put(protect, updateUser)
  .get(protect, getUser)
  .delete(protect, deleteUser);

router.put('/change-password', protect, changePassword);
router.put('/reset-password', protectRegisterUser, resetPassword);

/**
 * إشعارات المستخدم
 */
router.get('/notifications', protect, getUserNotifications);
router.put('/notifications/:id', protect, markNotificationAsRead);
router.get('/notifications/unread-count', protect, getUnreadNotificationCount); // ✅ تمت إضافته

/**
 * اختبار إرسال إشعار عبر WebSocket
 */
router.get('/notifications_test', protect, async (req, res) => {
  const io = req.app.get('io');
  io.to(req.user._id.toString()).emit('notification', {
    type: 'message',
    title: 'New Message',
    message: `New message from ${req.user._id}`,
    date: new Date()
  });
  res.json({ message: 'Test notification sent' });
});

module.exports.userRoutes = router;
