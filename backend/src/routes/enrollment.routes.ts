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
  approveQuiz,
  rejectQuiz,
  getPendingApprovals,
  getCertificate,
  getEnrollmentByCourse,
  verifyCertificate,
  markAttendanceNew,
  approvePractical,
  getCourseStudents,
} from '../controllers/enrollment.controller';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = express.Router();

// Public route (no auth) - must be before protect middleware
router.get('/verify/:certId', verifyCertificate);

// All routes require authentication (except public verify)
router.use(protect);

// Client routes
router.post('/', authorize('client'), createEnrollment);
router.get('/my', authorize('client'), getClientEnrollments);
router.post('/lesson-complete', authorize('client'), markLessonComplete);
router.post('/quiz/submit', authorize('client'), submitQuiz);
router.get('/by-course/:courseId', protect, getEnrollmentByCourse);
router.get('/certificate/:courseId', getCertificate);
router.patch('/:id/lesson-progress', authorize('client'), updateLessonProgress);
router.patch('/:id/cancel', authorize('client'), cancelEnrollment);

// Vendor routes
router.get('/vendor/students', authorize('vendor'), getVendorEnrollments);
router.get('/vendor/pending-approvals', authorize('vendor'), getPendingApprovals);
router.patch('/:id/approve-quiz', authorize('vendor'), approveQuiz);
router.patch('/:id/reject-quiz', authorize('vendor'), rejectQuiz);
router.patch('/:id/status', authorize('vendor'), updateEnrollmentStatus);
router.patch('/:id/attendance', authorize('vendor'), markAttendance);

// New attendance routes (vendor)
router.patch('/:enrollmentId/attendance-mark', authorize('vendor'), markAttendanceNew);
router.patch('/:enrollmentId/practical', authorize('vendor'), approvePractical);
router.get('/course/:courseId/students', authorize('vendor'), getCourseStudents);

// Common routes
router.get('/:id', getEnrollmentById);
router.patch('/:id/payment', updatePaymentStatus);

export default router;