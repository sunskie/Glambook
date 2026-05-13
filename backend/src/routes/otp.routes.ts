import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { sendOTP, verifyOTP } from '../controllers/otp.controller';

const router = Router();
router.post('/send', protect, sendOTP);
router.post('/verify', protect, verifyOTP);
export default router;
