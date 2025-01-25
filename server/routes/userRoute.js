const express = require('express');
const { registerUser, authUser, getUsers, updateUser, getUser, changePassword, deleteUser, resetPassword } = require('../controllers/userController');
const { protect, authorize, protectRegisterUser } = require('../middlewares/authMiddleware');
const router = express.Router();

// router.post('/', registerUser);
router.post('/login', authUser);

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

router.put('/change-password', protect, changePassword);

router.put('/reset-password',protectRegisterUser, resetPassword);

module.exports.userRoutes = router;
