// backend/src/routes/enrollment.routes.ts
import express from 'express';
import {
  createEnrollment,
  getClientEnrollments,
  getVendorEnrollments,
  getEnrollmentById,
  updateLessonProgress,
  cancelEnrollment,
  updateEnrollmentStatus,
  markAttendance,
  updatePaymentStatus,
  markLessonComplete,
  submitQuiz,
  getCertificate,
  verifyCertificate,
} from '../controllers/enrollment.controller';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = express.Router();

// All routes require authentication (except public verify)
router.use(protect);

// Client routes
router.post('/', authorize('client'), createEnrollment);
router.get('/my', authorize('client'), getClientEnrollments);
router.post('/lesson-complete', authorize('client'), markLessonComplete);
router.post('/quiz/submit', authorize('client'), submitQuiz);
router.get('/certificate/:courseId', getCertificate);
router.patch('/:id/lesson-progress', authorize('client'), updateLessonProgress);
router.patch('/:id/cancel', authorize('client'), cancelEnrollment);

// Vendor routes
router.get('/vendor/students', authorize('vendor'), getVendorEnrollments);
router.patch('/:id/status', authorize('vendor'), updateEnrollmentStatus);
router.patch('/:id/attendance', authorize('vendor'), markAttendance);

// Common routes
router.get('/:id', getEnrollmentById);
router.patch('/:id/payment', updatePaymentStatus);

// Public route (no auth) - must be before protect middleware
export const publicRouter = express.Router();
publicRouter.get('/verify/:certificateId', verifyCertificate);

export default router;