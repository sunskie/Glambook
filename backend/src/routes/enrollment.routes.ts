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
} from '../controllers/enrollment.controller';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Client routes
router.post('/', authorize('client'), createEnrollment);
router.get('/my-enrollments', authorize('client'), getClientEnrollments);
router.patch('/:id/lesson-progress', authorize('client'), updateLessonProgress);
router.patch('/:id/cancel', authorize('client'), cancelEnrollment);

// Vendor routes
router.get('/vendor/students', authorize('vendor'), getVendorEnrollments);
router.patch('/:id/status', authorize('vendor'), updateEnrollmentStatus);
router.patch('/:id/attendance', authorize('vendor'), markAttendance);

// Common routes
router.get('/:id', getEnrollmentById);
router.patch('/:id/payment', updatePaymentStatus);

export default router;