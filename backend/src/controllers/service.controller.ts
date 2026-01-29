import { Request, Response } from 'express';
import Service from '../models/service.model';
import mongoose from 'mongoose';

const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, price, duration, category, status } = req.body;
    const user = (req as any).user;
    const vendorId = user?._id || user?.id;
    
    if (!vendorId) {
      res.status(400).json({
        success: false,
        message: 'Vendor ID could not be extracted from token'
      });
      return;
    }

    if (!title || !description || !price || !duration || !category) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, price, duration, category'
      });
      return;
    }

    // GET IMAGE URL IF FILE WAS UPLOADED
    const imageUrl = req.file ? `/uploads/services/${req.file.filename}` : null;

    const newService = await Service.create({
      title,
      description,
      price,
      duration,
      category,
      status: status || 'active',
      vendorId,
      imageUrl,  // ADD IMAGE URL
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: newService
    });

  } catch (error: any) {
    console.error('Error in createService:', error);

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
      message: 'Failed to create service',
      error: error.message
    });
  }
};

export const getMyServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = (req as any).user._id;
    const services = await Service.find({ vendorId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
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

export const getAllServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = (req as any).user.role;
    let query: any = {};

    if (userRole === 'client') {
      query.status = 'active';
    }

    const { category, status, minPrice, maxPrice } = req.query;

    if (category) {
      query.category = category;
    }

    if (status && userRole !== 'client') {
      query.status = status;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const services = await Service.find(query)
      .populate('vendorId', 'name email')
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

export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid service ID format'
      });
      return;
    }

    const service = await Service.findById(id)
      .populate('vendorId', 'name email phone');

    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found'
      });
      return;
    }

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

export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const vendorId = (req as any).user._id;
    const updateData = req.body;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid service ID format'
      });
      return;
    }

    const service = await Service.findById(id);

    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found'
      });
      return;
    }

    if (service.vendorId.toString() !== vendorId.toString()) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to update this service'
      });
      return;
    }

    delete updateData.vendorId;

    // ADD IMAGE IF FILE WAS UPLOADED
    if (req.file) {
      updateData.imageUrl = `/uploads/services/${req.file.filename}`;
    }

    const updatedService = await Service.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true
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

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user._id;
    const userRole = (req as any).user.role;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid service ID format'
      });
      return;
    }

    const service = await Service.findById(id);

    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found'
      });
      return;
    }

    const isOwner = service.vendorId.toString() === userId.toString();
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this service'
      });
      return;
    }

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