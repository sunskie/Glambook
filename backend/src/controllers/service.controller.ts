// This file contains all the LOGIC for service operations
// CREATE, READ, UPDATE, DELETE (CRUD)

import { Request, Response } from 'express';
import Service from '../models/service.model';
import mongoose from 'mongoose';

// ============================================
// HELPER FUNCTION: Validate MongoDB ObjectId
// ============================================
// This checks if an ID is valid MongoDB format
// Example: "507f1f77bcf86cd799439011" ✅ | "abc123" ❌

const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ============================================
// 1. CREATE SERVICE
// ============================================
// Route: POST /api/services
// Who can access: Only VENDORS (authenticated)
// Purpose: Vendor creates a new service

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    // ──────────────────────────────────────
    // STEP 1: Extract data from request body
    // ──────────────────────────────────────
    const { title, description, price, duration, category, status } = req.body;

    // ──────────────────────────────────────
    // STEP 2: Get vendor ID from authenticated user
    // ──────────────────────────────────────
    // req.user comes from protect middleware (the logged-in user)
    const user = (req as any).user;
    const vendorId = user?._id || user?.id;
    
    if (!vendorId) {
      res.status(400).json({
        success: false,
        message: 'Vendor ID could not be extracted from token'
      });
      return;
    }

    // ──────────────────────────────────────
    // STEP 3: Validate required fields
    // ──────────────────────────────────────
    if (!title || !description || !price || !duration || !category) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, price, duration, category'
      });
      return;
    }

    // ──────────────────────────────────────
    // STEP 4: Create new service in database
    // ──────────────────────────────────────
    const newService = await Service.create({
      title,
      description,
      price,
      duration,
      category,
      status: status || 'active',  // Default to 'active' if not provided
      vendorId
    });

    // ──────────────────────────────────────
    // STEP 5: Send success response
    // ──────────────────────────────────────
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: newService
    });

  } catch (error: any) {
    // ──────────────────────────────────────
    // ERROR HANDLING
    // ──────────────────────────────────────
    console.error('Error in createService:', error);

    // Handle validation errors from Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
      return;
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Failed to create service',
      error: error.message
    });
  }
};

// ============================================
// 2. GET ALL SERVICES (for current vendor)
// ============================================
// Route: GET /api/services/my-services
// Who can access: Only VENDORS (authenticated)
// Purpose: Vendor sees only their own services

export const getMyServices = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get vendor ID from authenticated user
    const vendorId = (req as any).user._id;

    // ──────────────────────────────────────
    // FIND all services created by this vendor
    // ──────────────────────────────────────
    const services = await Service.find({ vendorId })
      .sort({ createdAt: -1 });  // Newest first (-1 = descending order)

    // ──────────────────────────────────────
    // Send response with services
    // ──────────────────────────────────────
    res.status(200).json({
      success: true,
      count: services.length,  // How many services found
      data: services
    });

  } catch (error: any) {
    console.error('Error in getMyServices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message
    });
  }
};

// ============================================
// 3. GET ALL SERVICES (for clients/admin)
// ============================================
// Route: GET /api/services
// Who can access: CLIENTS (view only), ADMIN (view all)
// Purpose: View all active services or all services (admin)

export const getAllServices = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get user role from authenticated user
    const userRole = (req as any).user.role;

    // ──────────────────────────────────────
    // Build query based on role
    // ──────────────────────────────────────
    let query: any = {};

    // If user is CLIENT, show only ACTIVE services
    if (userRole === 'client') {
      query.status = 'active';
    }
    // If user is ADMIN, show ALL services (no filter)
    // If user is VENDOR, show all (they might want to see inactive too)

    // ──────────────────────────────────────
    // Optional filters from query parameters
    // ──────────────────────────────────────
    // Example: /api/services?category=Hair&status=active
    const { category, status, minPrice, maxPrice } = req.query;

    if (category) {
      query.category = category;
    }

    if (status && userRole !== 'client') {  // Clients can't filter by status
      query.status = status;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);  // Greater than or equal
      if (maxPrice) query.price.$lte = Number(maxPrice);  // Less than or equal
    }

    // ──────────────────────────────────────
    // Fetch services with vendor details
    // ──────────────────────────────────────
    const services = await Service.find(query)
      .populate('vendorId', 'name email')  // Get vendor's name and email
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });

  } catch (error: any) {
    console.error('Error in getAllServices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message
    });
  }
};

// ============================================
// 4. GET SINGLE SERVICE BY ID
// ============================================
// Route: GET /api/services/:id
// Who can access: ALL authenticated users
// Purpose: View details of a specific service

export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // ──────────────────────────────────────
    // STEP 1: Validate the ID format
    // ──────────────────────────────────────
    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid service ID format'
      });
      return;
    }

    // ──────────────────────────────────────
    // STEP 2: Find service by ID
    // ──────────────────────────────────────
    const service = await Service.findById(id)
      .populate('vendorId', 'name email phone');  // Include vendor details

    // ──────────────────────────────────────
    // STEP 3: Check if service exists
    // ──────────────────────────────────────
    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found'
      });
      return;
    }

    // ──────────────────────────────────────
    // STEP 4: Send service data
    // ──────────────────────────────────────
    res.status(200).json({
      success: true,
      data: service
    });

  } catch (error: any) {
    console.error('Error in getServiceById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service',
      error: error.message
    });
  }
};

// ============================================
// 5. UPDATE SERVICE
// ============================================
// Route: PUT /api/services/:id
// Who can access: Only the VENDOR who created it
// Purpose: Update service details

export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const vendorId = (req as any).user._id;
    const updateData = req.body;

    // ──────────────────────────────────────
    // STEP 1: Validate ID
    // ──────────────────────────────────────
    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid service ID format'
      });
      return;
    }

    // ──────────────────────────────────────
    // STEP 2: Find the service
    // ──────────────────────────────────────
    const service = await Service.findById(id);

    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found'
      });
      return;
    }

    // ──────────────────────────────────────
    // STEP 3: Check ownership (security!)
    // ──────────────────────────────────────
    // Only the vendor who created it can update it
    // Convert both to strings to ensure proper comparison
    if (service.vendorId.toString() !== vendorId.toString()) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to update this service'
      });
      return;
    }

    // ──────────────────────────────────────
    // STEP 4: Prevent vendorId from being changed
    // ──────────────────────────────────────
    delete updateData.vendorId;  // Remove vendorId from update data

    // ──────────────────────────────────────
    // STEP 5: Update the service
    // ──────────────────────────────────────
    const updatedService = await Service.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,              // Return the updated document
        runValidators: true     // Run model validations
      }
    );

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService
    });

  } catch (error: any) {
    console.error('Error in updateService:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update service',
      error: error.message
    });
  }
};

// ============================================
// 6. DELETE SERVICE
// ============================================
// Route: DELETE /api/services/:id
// Who can access: Only the VENDOR who created it, or ADMIN
// Purpose: Delete a service

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user._id;
    const userRole = (req as any).user.role;

    // ──────────────────────────────────────
    // STEP 1: Validate ID
    // ──────────────────────────────────────
    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid service ID format'
      });
      return;
    }

    // ──────────────────────────────────────
    // STEP 2: Find the service
    // ──────────────────────────────────────
    const service = await Service.findById(id);

    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found'
      });
      return;
    }

    // ──────────────────────────────────────
    // STEP 3: Check authorization
    // ──────────────────────────────────────
    // Allow if: (1) User is the vendor who created it OR (2) User is admin
    // Convert to strings for proper comparison
    const isOwner = service.vendorId.toString() === userId.toString();
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this service'
      });
      return;
    }

    // ──────────────────────────────────────
    // STEP 4: Delete the service
    // ──────────────────────────────────────
    await Service.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });

  } catch (error: any) {
    console.error('Error in deleteService:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service',
      error: error.message
    });
  }
};