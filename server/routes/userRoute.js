const express = require('express');
const { registerUser, authUser, getUsers, updateUser } = require('../controllers/userController');
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
        // authorize('admin'), 
        updateUser
    );

module.exports.userRoutes = router;
