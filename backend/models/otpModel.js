const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    mobile: String,
    otp: String,
    createdAt: { type: Date, expires: 300, default: Date.now } 
});

module.exports = mongoose.model('OTP', otpSchema);