// backend/src/controllers/booking.controller.ts
import { Request, Response } from 'express';
import Booking from '../models/Booking.model';
import Service from '../models/service.model';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { awardPoints } from './loyalty.controller';

// Create a new booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    const {
      serviceId,
      bookingDate,
      bookingTime,
      clientName,
      clientPhone,
      clientEmail,
      specialRequests,
    } = req.body;

    // Validate required fields
    if (!serviceId || !bookingDate || !bookingTime || !clientName || !clientPhone || !clientEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Validate service ID
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID',
      });
    }

    // Get service and populate vendor
    const service = await Service.findById(serviceId).populate('vendorId');
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    // Check if service is active
    if (service.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This service is no longer available',
      });
    }

    // Validate booking date (must be in future)
    const bookingDateTime = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDateTime < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book for past dates',
      });
    }

    // ✅ CHECK FOR BOOKING CONFLICTS
    const existingBooking = await Booking.findOne({
      serviceId,
      vendorId: service.vendorId,
      bookingDate: bookingDateTime,
      bookingTime,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existingBooking) {
      logger.warn('Booking conflict detected', {
        serviceId,
        bookingDate,
        bookingTime,
        existingBookingId: existingBooking._id,
      });

      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please choose a different time.',
      });
    }

    // Create booking
    const booking = await Booking.create({
      serviceId,
      clientId: (req as any).user._id,
      vendorId: service.vendorId,
      bookingDate: bookingDateTime,
      bookingTime,
      duration: service.duration,
      totalPrice: service.price,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.toLowerCase().trim(),
      specialRequests: specialRequests?.trim(),
      status: 'pending',
    });

    // Populate booking details
    const populatedBooking = await Booking.findById(booking._id)
      .populate('serviceId', 'title category imageUrl')
      .populate('vendorId', 'name email phone')
      .populate('clientId', 'name email');

    logger.info('Booking created successfully', {
      bookingId: booking._id,
      clientId: (req as any).user._id,
      serviceId,
      vendorId: service.vendorId,
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: populatedBooking,
    });
  } catch (error: any) {
    logger.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get client's bookings
export const getClientBookings = async (req: Request, res: Response) => {
  try {
    const clientId = (req as any).user._id;
    const { status } = req.query;

    const query: any = { clientId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('serviceId', 'title category imageUrl price duration')
      .populate('vendorId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    logger.info('Client bookings fetched', {
      clientId,
      count: bookings.length,
      status,
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error: any) {
    logger.error('Get client bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get vendor's bookings
export const getVendorBookings = async (req: Request, res: Response) => {
  try {
    const vendorId = (req as any).user._id;
    const { status } = req.query;

    const query: any = { vendorId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('serviceId', 'title category imageUrl price duration')
      .populate('clientId', 'name email phone')
      .sort({ bookingDate: 1, bookingTime: 1 })
      .lean();

    logger.info('Vendor bookings fetched', {
      vendorId,
      count: bookings.length,
      status,
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error: any) {
    logger.error('Get vendor bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get single booking
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID',
      });
    }

    const booking = await Booking.findById(id)
      .populate('serviceId', 'title description category imageUrl price duration')
      .populate('vendorId', 'name email phone')
      .populate('clientId', 'name email phone')
      .lean();

    if (!booking) {
      logger.warn('Booking not found', { bookingId: id });
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check authorization
    const userId = (req as any).user._id.toString();
    const userRole = (req as any).user.role;

    const isClient = booking.clientId && booking.clientId._id.toString() === userId;
    const isVendor = booking.vendorId && booking.vendorId._id.toString() === userId;
    const isAdmin = userRole === 'admin';

    if (!isClient && !isVendor && !isAdmin) {
      logger.warn('Unauthorized booking access attempt', {
        bookingId: id,
        userId,
      });
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking',
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error: any) {
    logger.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Cancel booking (client only)
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID',
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled',
      });
    }

    // Check if already completed
    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed booking',
      });
    }

    // Check authorization
    if (booking.clientId.toString() !== userId.toString()) {
      logger.warn('Unauthorized cancellation attempt', {
        bookingId: id,
        userId,
        actualClientId: booking.clientId,
      });
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    // Update status
    booking.status = 'cancelled';
    await booking.save();

    logger.info('Booking cancelled', {
      bookingId: id,
      clientId: userId,
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking,
    });
  } catch (error: any) {
    logger.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update booking status (vendor only)
export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const vendorId = (req as any).user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID',
      });
    }

    // Validate status
    const validStatuses = ['confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check authorization
    if (booking.vendorId.toString() !== vendorId.toString()) {
      logger.warn('Unauthorized status update attempt', {
        bookingId: id,
        vendorId,
        actualVendorId: booking.vendorId,
      });
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking',
      });
    }

    // Update status
    booking.status = status;
    await booking.save();

    // Award loyalty points when booking is completed
    if (status === 'completed') {
      await awardPoints(booking._id.toString(), booking.totalPrice, booking.clientId.toString());
    }

    logger.info('Booking status updated', {
      bookingId: id,
      vendorId,
      newStatus: status,
    });

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      booking,
    });
  } catch (error: any) {
    logger.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};