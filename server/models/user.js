const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  phoneNumber: {
    type: String,
    unique: true,
    required: true
  },
  address: String,
  role: {
    type: String,
    enum: ['user', 'admin', 'beneficiary', 'donor', 'public_institution', 'charity_organization'],
    default: 'user',
  },
  status:{
    type: String,
    enum: ['pending','verifid','valid','suspended'],
    default: "pending"
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
