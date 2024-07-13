// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
    require: true,
  },
  ethAccount: {
    type: String , // Lưu địa chỉ Ethereum của người dùng
    require: true,
  },
});

module.exports = mongoose.model('User', userSchema);
