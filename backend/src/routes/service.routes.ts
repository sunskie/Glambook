// This file defines all the URL paths (routes) for services
// It connects URLs to controller functions

import express from 'express';
import {
  createService,
  getMyServices,
  getAllServices,
  getServiceById,
  updateService,
  deleteService
} from '../controllers/service.controller';

// Import middleware for authentication and authorization
import { protect } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

// ============================================
// CREATE ROUTER
// ============================================
// Router is like a mini-app that handles routes
const router = express.Router();

// ============================================
// ROUTE EXPLANATIONS
// ============================================
/*
  HTTP Methods:
  - GET    = Retrieve data (Read)
  - POST   = Create new data (Create)
  - PUT    = Update existing data (Update)
  - DELETE = Remove data (Delete)

  Middleware Order:
  1. authenticateToken   - Checks if user is logged in
  2. authorizeRoles      - Checks if user has the right role
  3. Controller function - Does the actual work
*/

// ============================================
// PUBLIC ROUTES (Anyone can access)
// ============================================
// None for now - all service routes require authentication

// ============================================
// PROTECTED ROUTES (Authentication Required)
// ============================================

// ──────────────────────────────────────────────────────────────
// GET ALL SERVICES (For Clients & Admin)
// ──────────────────────────────────────────────────────────────
// URL: GET /api/services
// Who: Clients see active services, Admin sees all
// Example: http://localhost:5000/api/services?category=Hair
router.get(
  '/',
  protect,                              // Step 1: Must be logged in
  authorize('client', 'admin', 'vendor'),  // Step 2: Any authenticated user
  getAllServices                        // Step 3: Run the function
);

// ──────────────────────────────────────────────────────────────
// GET VENDOR'S OWN SERVICES
// ──────────────────────────────────────────────────────────────
// URL: GET /api/services/my-services
// Who: Only vendors
// Purpose: Vendor sees only their own services
// Example: http://localhost:5000/api/services/my-services
router.get(
  '/my-services',
  protect,                              // Step 1: Must be logged in
  authorize('vendor'),                  // Step 2: Must be a vendor
  getMyServices                         // Step 3: Get vendor's services
);

// ──────────────────────────────────────────────────────────────
// GET SINGLE SERVICE BY ID
// ──────────────────────────────────────────────────────────────
// URL: GET /api/services/:id
// Who: Any authenticated user
// Purpose: View details of a specific service
// Example: http://localhost:5000/api/services/507f1f77bcf86cd799439011
router.get(
  '/:id',
  protect,                              // Step 1: Must be logged in
  authorize('client', 'vendor', 'admin'),  // Step 2: Any role
  getServiceById                        // Step 3: Get the service
);

// ──────────────────────────────────────────────────────────────
// CREATE NEW SERVICE
// ──────────────────────────────────────────────────────────────
// URL: POST /api/services
// Who: Only vendors
// Purpose: Vendor creates a new service
// Example: POST http://localhost:5000/api/services
// Body: { title, description, price, duration, category }
router.post(
  '/',
  protect,                              // Step 1: Must be logged in
  authorize('vendor'),                  // Step 2: Must be a vendor
  createService                         // Step 3: Create the service
);

// ──────────────────────────────────────────────────────────────
// UPDATE SERVICE
// ──────────────────────────────────────────────────────────────
// URL: PUT /api/services/:id
// Who: Only the vendor who created it
// Purpose: Update service details
// Example: PUT http://localhost:5000/api/services/507f1f77bcf86cd799439011
// Body: { price: 60, duration: 45 }
router.put(
  '/:id',
  protect,                              // Step 1: Must be logged in
  authorize('vendor'),                  // Step 2: Must be a vendor
  updateService                         // Step 3: Update (ownership checked in controller)
);

// ──────────────────────────────────────────────────────────────
// DELETE SERVICE
// ──────────────────────────────────────────────────────────────
// URL: DELETE /api/services/:id
// Who: Vendor who created it OR Admin
// Purpose: Delete a service
// Example: DELETE http://localhost:5000/api/services/507f1f77bcf86cd799439011
router.delete(
  '/:id',
  protect,                              // Step 1: Must be logged in
  authorize('vendor', 'admin'),         // Step 2: Vendor or Admin
  deleteService                         // Step 3: Delete (ownership checked in controller)
);

// ============================================
// EXPORT ROUTER
// ============================================
// This allows us to use these routes in server.ts
export default router;