import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { updateProfile, updateEmail, changePassword, getMyProfile } from '../controllers/profile.controller';

const router = Router();

router.get('/', protect, getMyProfile);
router.patch('/update', protect, updateProfile);
router.patch('/update-email', protect, updateEmail);
router.patch('/change-password', protect, changePassword);

export default router;
