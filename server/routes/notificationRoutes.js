const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, notificationController.getUserNotifications);
router.get('/unread-count', protect, notificationController.getUnreadNotificationCount);
router.patch('/:id/read', protect, notificationController.markNotificationAsRead);



module.exports = router;
// This code defines the routes for handling user notifications in a Node.js application.
// It includes routes for fetching all notifications for a user and getting the count of unread notifications.