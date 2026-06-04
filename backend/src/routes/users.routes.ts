import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getCurrentUser,
  changePassword
} from '../controllers/users.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/users/me - Quick user check
router.get('/me', protect, getCurrentUser);

// GET /api/users/profile - Full user profile
router.get('/profile', protect, getUserProfile);

// PUT /api/users/profile - Update user profile
router.put('/profile', protect, updateUserProfile);

// PATCH /api/users/profile - Update user profile (for ProfilePage)
router.patch('/profile', protect, updateUserProfile);

// PATCH /api/users/change-password - Change password
router.patch('/change-password', protect, changePassword);

export default router;

