import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { getLoyaltyBalance, redeemPoints } from '../controllers/loyalty.controller';
import { authorize } from '../middleware/role.middleware';
const router = Router();
router.get('/balance', protect, authorize('client'), getLoyaltyBalance);
router.post('/redeem', protect, authorize('client'), redeemPoints);
export default router;
