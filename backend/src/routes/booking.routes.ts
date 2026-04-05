// backend/src/routes/booking.routes.ts
import express from 'express';
import {
  createBooking,
  getClientBookings,
  getBookingById,
  cancelBooking,
} from '../controllers/booking.controller';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Client routes
router.post('/', authorize('client'), createBooking);
router.get('/my-bookings', authorize('client'), getClientBookings);
router.patch('/:id/cancel', authorize('client'), cancelBooking);

// Common routes
router.get('/:id', getBookingById);

export default router;