const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { getUnreadNotificationCount } = require('../controllers/notificationController');

const auth = require('../middleware/auth'); // تأكد من توفر مصادقة المستخدم

router.get('/', auth, notificationController.getUserNotifications);
router.get('/unread-count', auth, notificationController.getUnreadNotificationCount);
router.get('/notifications/unread-count', protect, getUnreadNotificationCount);


module.exports = router;
// This code defines the routes for handling user notifications in a Node.js application.
// It includes routes for fetching all notifications for a user and getting the count of unread notifications.