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
        phoneNumber
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
        res.status(401);
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

// @desc    Update user information
// @route   PUT /api/users/:id
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

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

        const updatedUser = await user.save();
        res.json(updateUser);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = { registerUser, authUser, getUsers, updateUser };
