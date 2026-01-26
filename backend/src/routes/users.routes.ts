// import express from "express";
// import { protect } from "../middleware/auth.middleware";
// import { authorize } from "../middleware/role.middleware";

// const router = express.Router();

// /**
//  * GET /api/users/me
//  * Any logged-in user
//  */
// router.get("/me", protect, (req, res) => {
//   res.json({
//     message: "User profile",
//     user: req.user,
//   });
// });

// /**
//  * GET /api/users/admin
//  * Admin only
//  */
// router.get("/admin", protect, authorize("admin"), (req, res) => {
//   res.json({
//     message: "Welcome Admin",
//   });
// });

// /**
//  * GET /api/users/vendor
//  * Vendor only
//  */
// router.get("/vendor", protect, authorize("vendor"), (req, res) => {
//   res.json({
//     message: "Welcome Vendor",
//   });
// });

// export default router;

import express from 'express';
import { 
  getUserProfile, 
  updateUserProfile,
  getCurrentUser  // Add this
} from '../controllers/users.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/users/me - Quick user check
router.get('/me', protect, getCurrentUser);

// GET /api/users/profile - Full user profile
router.get('/profile', protect, getUserProfile);

// PUT /api/users/profile - Update user profile
router.put('/profile', protect, updateUserProfile);

export default router;

