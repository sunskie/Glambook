// backend/src/services/streamchat.service.ts
import { StreamChat } from 'stream-chat';
import User from '../models/User.model';
import { logger } from '../utils/logger';

// Initialize StreamChat server client
const streamClient = StreamChat.getInstance('mx9jnen6dduk', '9dxp8ug6qkecbs4qah7rfwsjq8zwvkcbq6p3fvzj4jfa4bk6as5ctvsk59pxgdmq');

// Token expiration time (7 days)
const tokenExpiration = 60 * 60 * 24 * 7;

export class StreamChatService {
  /**
   * Create or update a StreamChat user
   */
  static async upsertUser(userId: string, user: any) {
    try {
      const streamUser = {
        id: userId,
        name: user.name,
        email: user.email,
        role: 'user', // StreamChat only supports 'user' or 'admin' roles
        image: user.profileImage || undefined,
        custom: {
          phone: user.phone,
          isApproved: user.isApproved,
          isActive: user.isActive,
          originalRole: user.role, // Store original role in custom data
        },
      };

      await streamClient.upsertUsers([streamUser]);

      logger.info('StreamChat user upserted', { userId, email: user.email });
      return true;
    } catch (error) {
      logger.error('Failed to upsert StreamChat user:', error);
      throw error;
    }
  }

  /**
   * Generate a StreamChat token for a user
   */
  static generateToken(userId: string): string {
    try {
      const expiresAt = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7); // 7 days
      const token = streamClient.createToken(userId, expiresAt);
      logger.info('StreamChat token generated', { userId, expiresAt });
      return token;
    } catch (error) {
      logger.error('Failed to generate StreamChat token:', error);
      throw error;
    }
  }

  /**
   * Create a channel between client and vendor for a booking
   */
  static async createBookingChannel(bookingId: string, clientId: string, vendorId: string, serviceName: string) {
    try {
      const channelId = `booking-${bookingId}`;
      
      const channel = streamClient.channel('messaging', channelId, {
        members: [clientId, vendorId],
        created_by_id: clientId,
      });

      await channel.create();
      logger.info('Booking channel created', { bookingId, channelId });
      return channel;
    } catch (error) {
      logger.error('Failed to create booking channel:', error);
      throw error;
    }
  }

  /**
   * Get user channels
   */
  static async getUserChannels(userId: string) {
    try {
      const channels = await streamClient.queryChannels({
        members: { $in: [userId] },
      });

      return channels;
    } catch (error) {
      logger.error('Failed to get user channels:', error);
      throw error;
    }
  }

  /**
   * Get channel by booking ID
   */
  static async getChannelByBookingId(bookingId: string) {
    try {
      const channels = await streamClient.queryChannels({
        id: `booking-${bookingId}`,
      });

      return channels[0] || null;
    } catch (error) {
      logger.error('Failed to get channel by booking ID:', error);
      throw error;
    }
  }

  /**
   * Delete a channel
   */
  static async deleteChannel(channelId: string) {
    try {
      const channel = streamClient.channel('messaging', channelId);
      await channel.delete({ hard_delete: true });
      logger.info('Channel deleted', { channelId });
      return true;
    } catch (error) {
      logger.error('Failed to delete channel:', error);
      throw error;
    }
  }

  /**
   * Initialize user in StreamChat (create user and return token)
   */
  static async initializeUser(userId: string) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Create/update user in StreamChat
      await this.upsertUser(userId.toString(), user);

      // Generate token
      const token = this.generateToken(userId.toString());

      return {
        user: {
          id: userId.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
          isActive: user.isActive,
        },
        token,
      };
    } catch (error) {
      logger.error('Failed to initialize StreamChat user:', error);
      throw error;
    }
  }
}
