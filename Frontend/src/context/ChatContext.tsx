// src/context/ChatContext.tsx
import React, { createContext, useContext, useReducer, useEffect, useRef, ReactNode } from 'react';
import { chatService, ChatUser } from '../services/chat.service';
import showToast from '../components/common/Toast';

interface ChatState {
  client: any;
  user: ChatUser | null;
  isConnected: boolean;
  isLoading: boolean;
  channels: any[];
  activeChannel: any;
}

type ChatAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_USER'; payload: ChatUser | null }
  | { type: 'SET_CLIENT'; payload: any }
  | { type: 'SET_CHANNELS'; payload: any[] }
  | { type: 'SET_ACTIVE_CHANNEL'; payload: any }
  | { type: 'RESET_STATE' };

const initialState: ChatState = {
  client: null,
  user: null,
  isConnected: false,
  isLoading: false,
  channels: [],
  activeChannel: null,
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_CLIENT':
      return { ...state, client: action.payload };
    case 'SET_CHANNELS':
      return { ...state, channels: action.payload };
    case 'SET_ACTIVE_CHANNEL':
      return { ...state, activeChannel: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
};

interface ChatContextType {
  state: ChatState;
  initializeChat: () => Promise<void>;
  disconnectChat: () => Promise<void>;
  refreshChatToken: () => Promise<void>;
  loadChannels: () => Promise<void>;
  createBookingChannel: (bookingId: string) => Promise<any>;
  getChannelByBookingId: (bookingId: string) => Promise<any>;
  setActiveChannel: (channel: any) => void;
  openChatWithClient: (clientId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const initializingRef = useRef(false);

  const initializeChat = async () => {
    // FIX 2: Guard against re-initialization if client is already connected
    if (chatService.getClient()?.userID) {
      console.log('Chat already connected, skipping initialization');
      return;
    }
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Check if already connected to prevent duplicate connections
      if (chatService.isConnected() && chatService.getClient()) {
        console.log('Chat already connected, skipping initialization');
        dispatch({ type: 'SET_CONNECTED', payload: true });
        dispatch({ type: 'SET_CLIENT', payload: chatService.getClient() });
        dispatch({ type: 'SET_USER', payload: chatService.getCurrentUser() });
        return;
      }
      
      // Disconnect any existing connection first
      if (chatService.getClient()) {
        await chatService.disconnectUser();
        dispatch({ type: 'RESET_STATE' });
      }
      
      const response = await chatService.initializeUser();
      
      if (response.success) {
        dispatch({ type: 'SET_USER', payload: response.data.user });
        dispatch({ type: 'SET_CLIENT', payload: chatService.getClient() });
        dispatch({ type: 'SET_CONNECTED', payload: true });
        
        console.log('Chat initialized successfully for user:', response.data.user.id);
        showToast.success('Chat initialized successfully');
      }
    } catch (error: any) {
      console.error('Failed to initialize chat:', error);
      dispatch({ type: 'RESET_STATE' });
      showToast.error(error.message || 'Failed to initialize chat');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const disconnectChat = async () => {
    try {
      await chatService.disconnectUser();
      dispatch({ type: 'RESET_STATE' });
      showToast.success('Disconnected from chat');
    } catch (error: any) {
      console.error('Failed to disconnect chat:', error);
      showToast.error(error.message || 'Failed to disconnect chat');
    }
  };

  const refreshChatToken = async () => {
    try {
      await chatService.refreshToken();
      showToast.success('Chat token refreshed');
    } catch (error: any) {
      console.error('Failed to refresh chat token:', error);
      showToast.error(error.message || 'Failed to refresh chat token');
    }
  };

  const loadChannels = async () => {
    try {
      const channels = await chatService.getUserChannels();
      dispatch({ type: 'SET_CHANNELS', payload: channels });
    } catch (error: any) {
      console.error('Failed to load channels:', error);
      showToast.error(error.message || 'Failed to load channels');
    }
  };

  const createBookingChannel = async (bookingId: string) => {
    try {
      const response = await chatService.createBookingChannel(bookingId);
      if (response.success) {
        await loadChannels(); // Reload channels to include the new one
        showToast.success('Chat channel created');
      }
      return response;
    } catch (error: any) {
      console.error('Failed to create booking channel:', error);
      showToast.error(error.message || 'Failed to create chat channel');
      throw error;
    }
  };

  const getChannelByBookingId = async (bookingId: string) => {
    try {
      const response = await chatService.getChannelByBookingId(bookingId);
      return response;
    } catch (error: any) {
      console.error('Failed to get channel by booking ID:', error);
      showToast.error(error.message || 'Failed to get chat channel');
      throw error;
    }
  };

  const setActiveChannel = (channel: any) => {
    dispatch({ type: 'SET_ACTIVE_CHANNEL', payload: channel });
  };

  const openChatWithClient = async (clientId: string) => {
    try {
      if (!state.client || !state.isConnected) {
        showToast.error('Chat not initialized');
        return;
      }

      const currentUserId = state.user?.id || localStorage.getItem('userId');
      if (!currentUserId) {
        showToast.error('User not logged in');
        return;
      }

      // Create deterministic channel ID to prevent duplicates
      const sortedIds = [currentUserId, clientId].sort();
      const channelId = `messaging-${sortedIds[0]}-${sortedIds[1]}`;

      console.log('Opening chat channel:', channelId);

      // Check if channel already exists
      const existingChannels = await state.client.queryChannels({
        id: { $eq: channelId }
      });

      let channel;
      if (existingChannels.length > 0) {
        channel = existingChannels[0];
        console.log('Found existing channel:', channel.id);
      } else {
        // Create new channel
        channel = state.client.channel('messaging', channelId, {
          members: [currentUserId, clientId],
        });
        await channel.create();
        console.log('Created new channel:', channel.id);
      }

      // Watch the channel to start receiving messages
      await channel.watch();

      // Set as active channel
      dispatch({ type: 'SET_ACTIVE_CHANNEL', payload: channel });

      // Reload channels to include this one
      await loadChannels();

      showToast.success('Chat opened successfully');
    } catch (error: any) {
      console.error('Failed to open chat with client:', error);
      showToast.error(error.message || 'Failed to open chat');
    }
  };

  // Auto-initialize chat when user is logged in
  useEffect(() => {
    // FIX 1: Ref guard ensures initializeChat is called at most once per mount
    if (initializingRef.current) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    initializingRef.current = true;
    initializeChat();
  }, []); // Empty dependency array - only run once on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.isConnected) {
        disconnectChat();
      }
    };
  }, []);

  const value: ChatContextType = {
    state,
    initializeChat,
    disconnectChat,
    refreshChatToken,
    loadChannels,
    createBookingChannel,
    getChannelByBookingId,
    setActiveChannel,
    openChatWithClient,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
