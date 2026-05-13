import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { getMyAvailability, updateAvailability, getAvailableSlots } from '../controllers/availability.controller';
const router = Router();
router.get('/my', protect, authorize('vendor'), getMyAvailability);
router.patch('/my', protect, authorize('vendor'), updateAvailability);
router.get('/slots', protect, getAvailableSlots);
export default router;
