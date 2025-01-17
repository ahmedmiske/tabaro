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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
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
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
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
    const users = await User.find({});
    res.json(users);
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
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.newPassword, salt);
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } else {
        res.status(400);
        throw new Error('Current password is incorrect');
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

module.exports = { registerUser, authUser, getUsers, updateUser, getUser, changePassword, deleteUser };
