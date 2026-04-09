// backend/src/routes/auth.routes.ts
import express from 'express';
import { signup, login } from '../controllers/auth.controller';
import { authLimiter } from '../middleware/security.middleware';

const router = express.Router();

// Apply rate limiting to auth routes
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);

export default router;