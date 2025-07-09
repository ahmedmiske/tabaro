const User = require('../models/user');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken } = require('../utils/otpUtils');
const bcrypt = require('bcryptjs');  // Ensure you are using bcryptjs which is more commonly used in Node environments

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        password,
        username,
        userType,
        institutionName,
        institutionLicenseNumber,
        institutionAddress,
        institutionEstablishmentDate,
        institutionWebsite,
        address,
        phoneNumber
    } = req.body;

    const newUser = new User({
        firstName,
        lastName,
        email,
        username,
        password, // it will be hashed in pre save
        userType,
        institutionName,
        institutionLicenseNumber,
        institutionAddress,
        institutionEstablishmentDate,
        institutionWebsite,
        address,
        phoneNumber,
        status: 'verified'
    });

    const savedUser = await newUser.save();
    res.status(201).json({
        _id: savedUser._id,
        name: savedUser.firstName + ' ' + savedUser.lastName,
        email: savedUser.email,
        token: generateToken(savedUser._id)
    });
});



// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { loginInput, password } = req.body;  // loginInput can be username or phoneNumber
    const user = await User.findOne({
        $or: [
            { username: loginInput },
            { phoneNumber: loginInput }
        ]
    });
    if (user && await bcrypt.compare(password, user.password)) {
      res.json({
      token: generateToken(user._id),
  user: {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
      phoneNumber: user.phoneNumber,
      email: user.email,
      userType: user.userType
       }
    });
    } else {
        res.status(400);
        throw new Error('Invalid email or password');
        
    }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getUsers = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments({});
    const users = await User.find({})
        .skip(skip)
        .limit(limit);

    res.json({
        result: users,
        page,
        pages: Math.ceil(total / limit),
        total
    });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUser = asyncHandler(async (req, res) => {
    res.json(req.user);
});

// @desc    Update user information
// @route   PUT /api/users/:id
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
    const user = req.user;

    if (user) {
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        // user.email = req.body.email || user.email;
        // user.username = req.body.username || user.username;
        // user.userType = req.body.userType || user.userType;
        user.institutionName = req.body.institutionName || user.institutionName;
        user.institutionLicenseNumber = req.body.institutionLicenseNumber || user.institutionLicenseNumber;
        user.institutionAddress = req.body.institutionAddress || user.institutionAddress;
        user.institutionEstablishmentDate = req.body.institutionEstablishmentDate || user.institutionEstablishmentDate;
        user.institutionWebsite = req.body.institutionWebsite || user.institutionWebsite;
        user.address = req.body.address || user.address;
        // user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

        await user.save();
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
    const user = req.user;

    if (user && await bcrypt.compare(req.body.currentPassword, user.password)) {
        user.password = req.body.newPassword; // it will be hashed in pre save
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } else {
        res.status(400);
        throw new Error('Current password is incorrect');
    }
});

// reset password
// @desc    Reset user password
// @route   PUT /api/users/reset-password
// @access  private
const resetPassword = asyncHandler(async (req, res) => {
    const { phoneNumber, newPassword } = req.body;

    const user = await User.findOne({ phoneNumber });
    if (user) {
        user.password = newPassword; // it will be hashed in pre save
        await user.save();
        res.json({ 
            message: 'Password reset successfully',
            token: generateToken(user._id),
            _id: user._id,
            name: user.name,
            email: user.email,
        });
    } else {
        res.status(400);
        throw new Error('User not found');
    }

});


// @desc    Delete user profile
// @route   DELETE /api/users/profile
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
    const user = req.user;
    await user.remove();
    res.json({ message: 'User profile deleted' });
});

module.exports = { registerUser, authUser, getUsers, updateUser, getUser, changePassword, deleteUser, resetPassword };
