const express = require('express');
const { registerUser, authUser, getUsers } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const router = express.Router();

// router.post('/', registerUser);
router.post('/login', authUser);

router.route('/')
    .post(
        protect, 
        registerUser
    )
    .get(
        protect, 
        authorize('admin'), 
        getUsers
    );
    
module.exports.userRoutes = router;
