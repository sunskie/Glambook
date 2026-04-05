// backend/src/routes/vendorBooking.routes.ts
import express from 'express';
import {
  getVendorBookings,
  updateBookingStatus,
  getVendorBookingStats,
} from '../controllers/VendorBooking.controller';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = express.Router();

// All routes require vendor authentication
router.use(protect);
router.use(authorize('vendor'));

// Get vendor's bookings
router.get('/', getVendorBookings);

// Get booking statistics
router.get('/stats', getVendorBookingStats);

// Update booking status
router.patch('/:id/status', updateBookingStatus);

export default router;