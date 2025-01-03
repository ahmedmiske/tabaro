const User = require('../models/user');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken } = require('../utils/otpUtils');
const bcrypt = require('bcrypt');


// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) throw new Error("should register phone number first");
    const { name, email, password } = req.body;

    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.type = userType;
    user.username = username;
    user.password = password;
    user.institutionName = institutionName;
    user.institutionLicenseNumber = institutionLicenseNumber;
    user.institutionAddress = institutionAddress;
    user.institutionEstablishmentDate = institutionEstablishmentDate;
    user.institutionWebsite = institutionWebsite;
    user.address = address;
    
    try {
        const updatedUser = await user.save();
        res.status(201).json(updatedUser);
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400);
            throw new Error("Invalid user input")
        } else {
            res.status(500);
            throw new Error("Internal server error");
        }
    }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public

const authUser = asyncHandler(async (req, res) => {
    const { loginInput, password } = req.body;  // loginInput username or phoneNumber
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


// @desc    get user
// @route   get /api/users
// @access  Private
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
    console.log('this is users',users);
});

module.exports = { registerUser, authUser, getUsers };
