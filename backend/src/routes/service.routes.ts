import express from 'express';
import {
  createService,
  getMyServices,
  getAllServices,
  getServiceById,
  updateService,
  deleteService
} from '../controllers/service.controller';

import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { upload } from '../middleware/upload.middleware';

const router = express.Router();

// ✅ SPECIFIC ROUTES FIRST (before generic routes)
router.get('/my-services', protect, authorize('vendor'), getMyServices);

// ✅ PUBLIC ROUTES
router.get('/', getAllServices);
router.get('/:id', getServiceById);

// ✅ PROTECTED ROUTES
router.post('/', protect, authorize('vendor'), upload.single('image'), createService);
router.put('/:id', protect, authorize('vendor'), upload.single('image'), updateService);
router.delete('/:id', protect, authorize('vendor', 'admin'), deleteService);

export default router;