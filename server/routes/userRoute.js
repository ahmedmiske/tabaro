const express = require('express');
const { registerUser, authUser, getUsers, updateUser, getUser, changePassword, deleteUser, resetPassword } = require('../controllers/userController');
const { protect, authorize, protectRegisterUser } = require('../middlewares/authMiddleware');
const { getUserNotifications, markNotificationAsRead } = require('../controllers/notificationController');
const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Users
 *  description: API for users in the system
 */

/**
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: User login
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               loginInput:
 *                 type: string
 *                 required: true
 *                 description: The user's email or phone number
 *                 example: 36363636
 *               password:
 *                 type: string
 *                 required: true
 *                 example: 123456
 *                 description: The user's password
 *     responses:
 *       200:
 *         description: Successful login
 *       400:
 *        description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/login', authUser);

/**
 * @swagger
 * /users/:
 *   post:
 *     summary: Register a new user
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 *   get:
 *     summary: Get all users
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A list of users
 *       403:
 *         description: Forbidden
 */
router.route('/')
    .post(
        protectRegisterUser, 
        registerUser
    )
    .get(
        protect, 
        authorize('admin'), 
        getUsers
    );

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get user profile
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Delete user profile
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.route('/profile')
    .put(
        protect, 
        updateUser
    )
    .get(
        protect, 
        getUser
    )
    .delete(
        protect, 
        deleteUser
    );

/**
 * @swagger
 * /users/change-password:
 *   put:
 *     summary: Change user password
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/change-password', protect, changePassword);

/**
 * @swagger
 * /users/reset-password:
 *   put:
 *     summary: Reset user password
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Bad request
 */
router.put('/reset-password', protectRegisterUser, resetPassword);

/**
 * @swagger
 * tags:
 *  name: Notifications
 *  description: API for managing user notifications
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get user notifications
 *     security:
 *       - bearerAuth: []
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: A list of user notifications
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/notifications', protect, getUserNotifications);
/**
 * @swagger
 * /notifications/{id}:
 *   put:
 *     summary: Mark a notification as read
 *     security:
 *       - bearerAuth: []
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the notification to mark as read
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
router.put('/notifications/:id', protect, markNotificationAsRead);

router.get('/notifications_test', protect, async (req, res) => {
    // Emit a test notification to the user
    const io = req.app.get('io');
    // const notif = await Notification.create({
    //     userId: req.user._id,
    //     type: 'test',
    //     title: 'Test Notification',
    //     message: 'This is a test notification',
    //     date: new Date(),
    // });
    io.to(req.user._id.toString()).emit('notification', {
        type: 'message',
        title: 'New Message',
        message: `New message from ${req.user._id}`,
        // messageId: message._id,
        date: new Date(),
        });
    res.json({ message: 'Test notification sent' });
});

module.exports.userRoutes = router;
