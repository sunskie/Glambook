// backend/src/controllers/chat.controller.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { StreamChatService } from '../services/streamchat.service';
import { logger } from '../utils/logger';
import User from '../models/User.model';
import Booking, { IBooking } from '../models/Booking.model';
import Service, { IService } from '../models/service.model';


// Initialize user in StreamChat and get token
export const initializeUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const result = await StreamChatService.initializeUser(userId);

    res.json({
      success: true,
      message: 'User initialized successfully',
      data: result,
    });
  } catch (error: any) {
    logger.error('Initialize user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize user',
      error: error.message,
    });
  }
};

// Get user token (refresh)
export const getUserToken = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const token = StreamChatService.generateToken(userId);

    res.json({
      success: true,
      message: 'Token retrieved successfully',
      data: { token },
    });
  } catch (error: any) {
    logger.error('Get user token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve token',
      error: error.message,
    });
  }
};

// Get user channels
export const getUserChannels = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    console.log('Getting channels for user:', userId);
    const channels = await StreamChatService.getUserChannels(userId);

    res.json({
      success: true,
      message: 'Channels retrieved successfully',
      data: { channels },
    });
  } catch (error: any) {
    logger.error('Get user channels error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve channels',
      error: error.message,
    });
  }
};

// Create a channel for a booking
export const createBookingChannel = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { bookingId } = req.params;
    
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required',
      });
    }

    // Check if channel already exists
    const existingChannel = await StreamChatService.getChannelByBookingId(bookingId);
    if (existingChannel) {
      console.log('Channel already exists for booking:', bookingId);
      return res.json({
        success: true,
        message: 'Channel already exists',
        data: { 
          channel: {
            id: existingChannel.id,
            name: (existingChannel.data as any)?.name,
            members: (existingChannel.data as any)?.members,
          }
        },
      });
    }

    // Get booking details to find client and vendor
    const booking = await Booking.findById(bookingId).populate('clientId vendorId serviceId');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    const clientId = booking.clientId._id.toString();
    const vendorId = booking.vendorId._id.toString();
    const serviceName = (booking.serviceId as any)?.title || 'Service';
    
    console.log('Creating booking channel:', { bookingId, clientId, vendorId, serviceName });
    
    const channel = await StreamChatService.createBookingChannel(
      `booking-${bookingId}`,
      clientId,
      vendorId,
      serviceName
    );

    res.json({
      success: true,
      message: 'Booking channel created successfully',
      data: { 
        channel: {
          id: channel.id,
          name: (channel.data as any)?.name,
          members: (channel.data as any)?.members,
        }
      },
    });
  } catch (error: any) {
    logger.error('Failed to create booking channel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking channel',
      error: error.message,
    });
  }
};

// Get channel by booking ID
export const getChannelByBookingId = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { bookingId } = req.params;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const channels = await StreamChatService.getChannelByBookingId(bookingId);
    if (!channels) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found for this booking',
      });
    }

    res.json({
      success: true,
      message: 'Channel retrieved successfully',
      data: { 
        channel: {
          id: channels.id,
          name: (channels.data as any)?.name,
          members: (channels.data as any)?.members,
        }
      },
    });
  } catch (error: any) {
    logger.error('Failed to get channel by booking ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve channel',
      error: error.message,
    });
  }
};

// Create chat channel
export const createChannel = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { vendorId, serviceName, channelId } = req.body;
    
    const channel = await StreamChatService.createBookingChannel(
      channelId,
      userId,
      vendorId,
      serviceName
    );

    res.json({
      success: true,
      message: 'Chat channel created successfully',
      data: { 
        channel: {
          id: channel.id,
          name: (channel.data as any)?.name,
          members: (channel.data as any)?.members,
        }
      },
    });
  } catch (error: any) {
    logger.error('Failed to create chat channel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat channel',
      error: error.message,
    });
  }
};
