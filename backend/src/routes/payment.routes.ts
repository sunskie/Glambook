import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { initiatePayment, verifyPayment, getPaymentStatus, initiateCoursePayment } from '../controllers/payment.controller';

const router = Router();

router.post('/initiate', protect, initiatePayment);
router.get('/verify', verifyPayment); // public — eSewa redirects here
router.get('/status/:type/:id', protect, getPaymentStatus);
router.post('/course/initiate', protect, initiateCoursePayment);

export default router;
