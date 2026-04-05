// backend/src/routes/review.routes.ts
import express from 'express';
import {
  createReview,
  getReviewsByTarget,
  getUserReviews,
  updateReview,
  deleteReview,
  respondToReview,
  markReviewHelpful,
} from '../controllers/Review.controller';
import { protect } from '../middleware/auth.middleware';
import { clientOnly, vendorOnly } from '../middleware/role.middleware';

const router = express.Router();

// Client routes
router.post('/', protect, clientOnly, createReview);
router.get('/my-reviews', protect, clientOnly, getUserReviews);
router.put('/:id', protect, clientOnly, updateReview);
router.delete('/:id', protect, clientOnly, deleteReview);

// Public routes
router.get('/:targetType/:targetId', getReviewsByTarget);
router.patch('/:id/helpful', markReviewHelpful);

// Vendor routes
router.post('/:id/respond', protect, vendorOnly, respondToReview);

export default router;