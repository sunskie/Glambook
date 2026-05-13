import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { getServiceRecommendations, getCourseRecommendations } from '../controllers/recommendation.controller';
const router = Router();
router.get('/services', protect, getServiceRecommendations);
router.get('/courses', protect, getCourseRecommendations);
export default router;
