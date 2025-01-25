const express = require('express');
const router = express.Router();
const { register, verifyOTP, login, resendOTP } = require('../controllers/authController');

// Register new user
router.post('/register', register);

// Verify OTP
router.post('/verify-otp', verifyOTP);

// Login
router.post('/login', login);

// Resend OTP
router.post('/resend-otp', resendOTP);

module.exports = router; 