const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ['buyer', 'seller', 'logistics'], // adjust as needed
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
