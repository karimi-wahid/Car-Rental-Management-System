import express from 'express';
import {
  forgotPassword,
  login,
  logout,
  protect,
  resendVerificationEmail,
  resetPassword,
  signup,
  updatePassword,
  verifyEmail,
  verifyOTP,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.patch('/updateMyPassword', protect, updatePassword);

router.get('/verify-email/:token', verifyEmail);
router.post('/verify-otp', verifyOTP);
router.post('/resend-verification', resendVerificationEmail);

export default router;
