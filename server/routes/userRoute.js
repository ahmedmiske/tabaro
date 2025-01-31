const express = require('express');
const { registerUser, authUser, getUsers, updateUser, getUser, changePassword, deleteUser, resetPassword } = require('../controllers/userController');
const { protect, authorize, protectRegisterUser } = require('../middlewares/authMiddleware');
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

module.exports.userRoutes = router;
