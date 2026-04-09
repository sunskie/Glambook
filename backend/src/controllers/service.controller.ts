// backend/src/controllers/service.controller.ts
import { Request, Response } from 'express';
import Service from '../models/service.model';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { deleteFile } from '../middleware/upload.middleware';

const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, price, duration, category, status } = req.body;
    const user = (req as any).user;
    const vendorId = user?._id || user?.id;

    if (!vendorId) {
      logger.error('Vendor ID missing in token');
      res.status(400).json({
        success: false,
        message: 'Authentication error. Please login again.',
      });
      return;
    }

    // Validation
    const errors: string[] = [];

    if (!title?.trim()) errors.push('Title is required');
    if (!description?.trim()) errors.push('Description is required');
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      errors.push('Valid price is required');
    }
    if (!duration || isNaN(parseInt(duration)) || parseInt(duration) <= 0) {
      errors.push('Valid duration is required');
    }
    if (!category) errors.push('Category is required');

    if (errors.length > 0) {
      // Delete uploaded file if validation fails
      if (req.file) {
        deleteFile(`uploads/services/${req.file.filename}`);
      }

      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    // Get image URL if file was uploaded
    const imageUrl = req.file ? `/uploads/services/${req.file.filename}` : null;

    // Create service
    const newService = await Service.create({
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      duration: parseInt(duration),
      category,
      status: status || 'active',
      vendorId,
      imageUrl,
    });

    logger.info('Service created', {
      serviceId: newService._id,
      vendorId,
      title: newService.title,
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: newService,
    });
  } catch (error: any) {
    logger.error('Create service error:', error);

    // Delete uploaded file on error
    if (req.file) {
      deleteFile(`uploads/services/${req.file.filename}`);
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const getMyServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = (req as any).user._id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 6));
    const skip = (page - 1) * limit;

    // Get total count
    const totalServices = await Service.countDocuments({ vendorId });
    const totalPages = Math.ceil(totalServices / limit);

    // Get paginated services
    const services = await Service.find({ vendorId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    logger.info('Vendor services fetched', {
      vendorId,
      page,
      count: services.length,
    });

    res.status(200).json({
      success: true,
      count: services.length,
      total: totalServices,
      page,
      totalPages,
      data: services,
    });
  } catch (error: any) {
    logger.error('Get my services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const getAllServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = (req as any).user?.role;
    let query: any = {};

    // Only show active services to clients/guests
    if (!userRole || userRole === 'client') {
      query.status = 'active';
    }

    // Apply filters
    const { category, status, minPrice, maxPrice, search } = req.query;

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && userRole !== 'client') {
      query.status = status;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice as string);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice as string);
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 6));
    const skip = (page - 1) * limit;

    // Get total count
    const totalServices = await Service.countDocuments(query);
    const totalPages = Math.ceil(totalServices / limit);

    // Get paginated services
    const services = await Service.find(query)
      .populate('vendorId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    logger.info('Services fetched', {
      filters: query,
      page,
      count: services.length,
    });

    res.status(200).json({
      success: true,
      count: services.length,
      total: totalServices,
      page,
      totalPages,
      data: services,
    });
  } catch (error: any) {
    logger.error('Get all services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid service ID format',
      });
      return;
    }

    const service = await Service.findById(id)
      .populate('vendorId', 'name email phone')
      .lean();

    if (!service) {
      logger.warn('Service not found', { serviceId: id });
      res.status(404).json({
        success: false,
        message: 'Service not found',
      });
      return;
    }

    logger.info('Service fetched', { serviceId: id });

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error: any) {
    logger.error('Get service by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const vendorId = (req as any).user._id;
    const updateData = req.body;

    if (!isValidObjectId(id)) {
      if (req.file) deleteFile(`uploads/services/${req.file.filename}`);
      res.status(400).json({
        success: false,
        message: 'Invalid service ID format',
      });
      return;
    }

    const service = await Service.findById(id);

    if (!service) {
      if (req.file) deleteFile(`uploads/services/${req.file.filename}`);
      logger.warn('Update attempt on non-existent service', { serviceId: id });
      res.status(404).json({
        success: false,
        message: 'Service not found',
      });
      return;
    }

    if (service.vendorId.toString() !== vendorId.toString()) {
      if (req.file) deleteFile(`uploads/services/${req.file.filename}`);
      logger.warn('Unauthorized update attempt', {
        serviceId: id,
        vendorId,
        ownerId: service.vendorId,
      });
      res.status(403).json({
        success: false,
        message: 'You are not authorized to update this service',
      });
      return;
    }

    // Remove protected fields
    delete updateData.vendorId;
    delete updateData._id;

    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (service.imageUrl) {
        deleteFile(service.imageUrl);
      }
      updateData.imageUrl = `/uploads/services/${req.file.filename}`;
    }

    const updatedService = await Service.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    logger.info('Service updated', {
      serviceId: id,
      vendorId,
      changes: Object.keys(updateData),
    });

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService,
    });
  } catch (error: any) {
    logger.error('Update service error:', error);

    if (req.file) deleteFile(`uploads/services/${req.file.filename}`);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user._id;
    const userRole = (req as any).user.role;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid service ID format',
      });
      return;
    }

    const service = await Service.findById(id);

    if (!service) {
      logger.warn('Delete attempt on non-existent service', { serviceId: id });
      res.status(404).json({
        success: false,
        message: 'Service not found',
      });
      return;
    }

    const isOwner = service.vendorId.toString() === userId.toString();
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) {
      logger.warn('Unauthorized delete attempt', {
        serviceId: id,
        userId,
        ownerId: service.vendorId,
      });
      res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this service',
      });
      return;
    }

    // Delete associated image
    if (service.imageUrl) {
      deleteFile(service.imageUrl);
    }

    await Service.findByIdAndDelete(id);

    logger.info('Service deleted', {
      serviceId: id,
      deletedBy: userId,
      role: userRole,
    });

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error: any) {
    logger.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};