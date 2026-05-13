// src/services/chat.service.ts
import axios from 'axios';
import { StreamChat } from 'stream-chat';
import { STREAM_CHAT_API_KEY } from '../config/streamchat.config';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  isActive: boolean;
}

export interface ChatTokenResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
  };
}

export interface ChatInitResponse {
  success: boolean;
  message: string;
  data: {
    user: ChatUser;
    token: string;
  };
}

export interface ChannelResponse {
  success: boolean;
  message: string;
  data: {
    channels: any[];
  };
}

class ChatService {
  private client: StreamChat | null = null;
  private currentUser: ChatUser | null = null;

  /**
   * Initialize StreamChat client
   */
  async initializeUser(): Promise<ChatInitResponse> {
    try {
      // Check if already connected to prevent duplicate connections
      if (this.isConnected() && this.client) {
        console.log('Chat client already connected, returning existing session');
        return {
          success: true,
          message: 'Already connected',
          data: {
            user: this.currentUser!,
            token: 'existing_token',
          },
        };
      }

      const response = await axios.post<ChatInitResponse>(
        `${API_BASE_URL}/chat/initialize`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        this.currentUser = response.data.data.user;
        this.client = StreamChat.getInstance(STREAM_CHAT_API_KEY);
        
        // Disconnect any existing connection first
        try {
          await this.client.disconnectUser();
        } catch (e) {
          console.log('No existing connection to disconnect');
        }
        
        await this.client.connectUser(
          {
            id: response.data.data.user.id,
            name: response.data.data.user.name,
            email: response.data.data.user.email,
            role: response.data.data.user.role,
          } as any,
          response.data.data.token
        );
        
        console.log('Chat user initialized:', response.data.data.user.id);
      }

      return response.data;
    } catch (error: any) {
      console.error('Failed to initialize chat user:', error);
      // Reset state on error
      this.client = null;
      this.currentUser = null;
      throw error.response?.data || error;
    }
  }

  /**
   * Get current chat client
   */
  getClient(): StreamChat | null {
    return this.client;
  }

  /**
   * Get current user
   */
  getCurrentUser(): ChatUser | null {
    return this.currentUser;
  }

  /**
   * Refresh user token
   */
  async refreshToken(): Promise<string> {
    try {
      const response = await axios.get<ChatTokenResponse>(
        `${API_BASE_URL}/chat/token`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success && this.client) {
        await this.client.disconnectUser();
        await this.client.connectUser(
          {
            id: this.currentUser?.id || '',
            name: this.currentUser?.name || '',
            email: (this.currentUser as any)?.email || '',
            role: this.currentUser?.role || '',
          } as any,
          response.data.data.token
        );
      }

      return response.data.data.token;
    } catch (error: any) {
      console.error('Failed to refresh chat token:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get user channels
   */
  async getUserChannels(): Promise<any[]> {
    try {
      const response = await axios.get<ChannelResponse>(
        `${API_BASE_URL}/chat/channels`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      return response.data.data.channels;
    } catch (error: any) {
      console.error('Failed to get user channels:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Create booking channel
   */
  async createBookingChannel(bookingId: string): Promise<any> {
    try {
      if (!this.client) {
        throw new Error('Chat client not initialized');
      }

      // First check if channel already exists
      const existingChannels = await this.client.queryChannels({
        id: { $eq: `booking-${bookingId}` }
      });

      if (existingChannels.length > 0) {
        console.log('Booking channel already exists:', existingChannels[0].id);
        return {
          success: true,
          message: 'Channel already exists',
          data: {
            channel: {
              id: existingChannels[0].id,
              name: (existingChannels[0].data as any)?.name,
              members: (existingChannels[0].data as any)?.members,
            }
          }
        };
      }

      const response = await axios.post(
        `${API_BASE_URL}/chat/channels/booking/${bookingId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      console.log('Created new booking channel:', response.data.data.channel?.id);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create booking channel:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get channel by booking ID
   */
  async getChannelByBookingId(bookingId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/chat/channels/booking/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Failed to get channel by booking ID:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Disconnect user
   */
  async disconnectUser(): Promise<void> {
    if (this.client) {
      await this.client.disconnectUser();
      this.client = null;
      this.currentUser = null;
    }
  }

  /**
   * Check if user is connected
   */
  isConnected(): boolean {
    return this.client !== null && this.currentUser !== null;
  }
}

export const chatService = new ChatService();
