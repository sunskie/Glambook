// backend/src/controllers/vendorBooking.controller.ts
import { Request, Response } from 'express';
import Booking from '../models/Booking.model';
import mongoose from 'mongoose';

// Get all bookings for vendor's services
export const getVendorBookings = async (req: Request, res: Response) => {
  try {
    const vendorId = (req as any).user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = { vendorId };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    console.log('🔍 Query:', query);

    const skip = (Number(page) - 1) * Number(limit);

    const bookings = await Booking.find(query)
      .populate('serviceId', 'title category price duration imageUrl')
      .populate('clientId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);

    console.log(`📦 Found ${bookings.length} bookings, total: ${total}`);

    res.status(200).json({
      success: true,
      data: bookings,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error: any) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Update booking status
export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const vendorId = (req as any).user.id;

    const validStatuses = ['confirmed', 'cancelled', 'completed'];
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

    if (booking.vendorId.toString() !== vendorId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot update ${booking.status} booking`,
      });
    }

    booking.status = status as any;
    await booking.save();

    const updatedBooking = await Booking.findById(id)
      .populate('serviceId', 'title category price duration imageUrl')
      .populate('clientId', 'name email phone');

    res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      data: updatedBooking,
    });
  } catch (error: any) {
    console.error('❌ Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get booking statistics - SIMPLE VERSION
export const getVendorBookingStats = async (req: Request, res: Response) => {
  try {
    const vendorId = (req as any).user.id;

    // Simple count queries
    const total = await Booking.countDocuments({ vendorId });
    const pending = await Booking.countDocuments({ vendorId, status: 'pending' });
    const confirmed = await Booking.countDocuments({ vendorId, status: 'confirmed' });
    const cancelled = await Booking.countDocuments({ vendorId, status: 'cancelled' });
    const completed = await Booking.countDocuments({ vendorId, status: 'completed' });

    const statsObj = {
      total,
      pending,
      confirmed,
      cancelled,
      completed,
    };

    console.log('📊 Stats for vendor', vendorId, ':', statsObj);

    res.status(200).json({
      success: true,
      data: statsObj,
    });
  } catch (error: any) {
    console.error('❌ Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};