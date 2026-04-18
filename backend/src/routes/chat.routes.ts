// backend/src/routes/chat.routes.ts
import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import {
  initializeUser,
  getUserToken,
  getUserChannels,
  createBookingChannel,
  getChannelByBookingId,
  createChannel,
} from '../controllers/chat.controller';

const router = Router();

// All chat routes require authentication
router.use(protect);

// Initialize user in StreamChat and get token
router.post('/initialize', initializeUser);

// Get user token (refresh)
router.get('/token', getUserToken);

// Get user's channels
router.get('/channels', getUserChannels);

// Create channel for a booking
router.post('/channels/booking/:bookingId', createBookingChannel);

// Create chat channel
router.post('/channels/create', createChannel);

// Get channel by booking ID
router.get('/channels/booking/:bookingId', getChannelByBookingId);

export default router;
