import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { authorize, adminOnly } from '../middleware/role.middleware';
import {
  fileDispute, getMyDisputes, getVendorDisputes,
  vendorRespondToDispute, getAllDisputes,
  markUnderReview, resolveDispute
} from '../controllers/dispute.controller';

const router = Router();

// Client routes
router.post('/', protect, authorize('client'), fileDispute);
router.get('/my', protect, authorize('client'), getMyDisputes);

// Vendor routes
router.get('/vendor', protect, authorize('vendor'), getVendorDisputes);
router.patch('/:id/respond', protect, authorize('vendor'), vendorRespondToDispute);

// Admin routes
router.get('/all', protect, adminOnly, getAllDisputes);
router.patch('/:id/review', protect, adminOnly, markUnderReview);
router.patch('/:id/resolve', protect, adminOnly, resolveDispute);

export default router;
