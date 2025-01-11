const express = require('express');
const { registerUser, authUser, getUsers, updateUser, getUser, changePassword } = require('../controllers/userController');
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
    );

router.put('/change-password', protect, changePassword);

module.exports.userRoutes = router;
