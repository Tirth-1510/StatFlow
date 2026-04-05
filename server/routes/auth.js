import express from 'express';
import { login, register, sendOtp } from '../controllers/authController.js';

const router = express.Router();

// Route to trigger OTP email
router.post('/send-otp', sendOtp);

// Public route for creating a new account (now requires OTP in body)
router.post('/register', register);

// Public route for logging in
router.post('/login', login);

export default router;