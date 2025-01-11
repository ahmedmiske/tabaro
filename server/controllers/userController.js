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

    const existingUser = await User.findOne({ phoneNumber });

    if (existingUser) {
        // User exists, update user info
        const updatedUser = await User.findOneAndUpdate(
            { phoneNumber },
            { firstName, lastName, email, username, userType, institutionName, institutionLicenseNumber, institutionAddress, institutionEstablishmentDate, institutionWebsite, address },
            { new: true }  // return the updated document
        );
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.firstName + ' ' + updatedUser.lastName,
            email: updatedUser.email,
            token: generateToken(updatedUser._id)
        });
    } else {
        // No user exists, create new user
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
    }
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



module.exports = { registerUser, authUser, getUsers };
