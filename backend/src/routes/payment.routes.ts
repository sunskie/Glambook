import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { initiatePayment, verifyPayment, getPaymentStatus, initiateCoursePayment, verifyCoursePayment, paymentSuccess, paymentFailure } from '../controllers/payment.controller';

const router = Router();

router.post('/initiate', protect, initiatePayment);
router.post('/verify', verifyPayment);
router.get('/status/:type/:id', protect, getPaymentStatus);
router.post('/course/initiate', protect, initiateCoursePayment);
router.post('/course/verify', verifyCoursePayment);
router.get('/success', paymentSuccess);
router.get('/failure', paymentFailure);

export default router;
