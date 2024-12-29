const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  phone: {
    type: String,
    unique: true,
    required: true
  },
  userType: {
    type: String
  },
  username: {
    type: String,
    unique: true
  },
  password: {
    type: String,
  },
  institutionName: {
    type: String,
  },
  institutionLicenseNumber: {
    type: String,
  },
  institutionAddress: {
    type: String,
  },
  institutionEstablishmentDate: {
    type: Date,  // Changed to Date if you expect a date value
  },
  institutionWebsite: {
    type: String,
  },
  address: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'beneficiary', 'donor', 'public_institution', 'charity_organization'],
    default: 'user',
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'valid', 'suspended'], // corrected 'verified' spelling
    default: 'pending'
  }
}, {
  timestamps: true,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password; // Remove the password field
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
