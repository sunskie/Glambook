// backend/src/routes/admin.routes.ts
import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/role.middleware';
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getAllVendors,
  approveVendor,
  rejectVendor,
  getAllServices,
  updateServiceStatus,
  deleteService,
  getAllBookings,
  getAllCourses,
  approveCourse,
  rejectCourse,
  deleteCourse,
  getAllEnrollments
} from '../controllers/admin.controller';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// User Management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Vendor Management
router.get('/vendors', getAllVendors);
router.patch('/vendors/:id/approve', approveVendor);
router.patch('/vendors/:id/reject', rejectVendor);

// Service Management
router.get('/services', getAllServices);
router.patch('/services/:id/status', updateServiceStatus);
router.delete('/services/:id', deleteService);

// Booking Management
router.get('/bookings', getAllBookings);

// Course Management
router.get('/courses', getAllCourses);
router.patch('/courses/:id/approve', approveCourse);
router.patch('/courses/:id/reject', rejectCourse);
router.delete('/courses/:id', deleteCourse);

// Enrollment Management
router.get('/enrollments', getAllEnrollments);

export default router;