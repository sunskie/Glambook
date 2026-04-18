// src/components/chat/ChatComponent.tsx
import React, { useEffect, useState } from 'react';
import {
  Chat,
  Channel,
  ChannelList,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
  LoadingIndicator,
} from 'stream-chat-react';
import { useChat } from '../../context/ChatContext';
import { STREAM_CHAT_API_KEY } from '../../config/streamchat.config';
import 'stream-chat-react/dist/css/v2/index.css';

interface ChatComponentProps {
  bookingId?: string;
  className?: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ bookingId, className = '' }) => {
  const { state, createBookingChannel, getChannelByBookingId, setActiveChannel } = useChat();
  const [isInitializing, setIsInitializing] = useState(false);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const initializeChannel = async () => {
      if (bookingId && state.isConnected && state.client) {
        await initializeBookingChannel();
      } else if (!bookingId && state.isConnected && state.client) {
        // Show all channels for general chat view
        setFilters({
          members: { $in: [state.user?.id] },
        });
      }
    };

    initializeChannel();
  }, [bookingId, state.isConnected, state.client]); // Add state.client to dependencies

  const initializeBookingChannel = async () => {
    if (!bookingId || !state.client) return;

    setIsInitializing(true);
    try {
      console.log('Initializing booking channel:', bookingId);
      
      // Try to get existing channel first
      let response = await getChannelByBookingId(bookingId);
      
      if (!response.success) {
        // Create new channel if it doesn't exist
        console.log('Channel not found, creating new one');
        response = await createBookingChannel(bookingId);
      }

      if (response.success && response.data.channel) {
        setFilters({
          id: { $eq: response.data.channel.id },
        });
        console.log('Booking channel initialized:', response.data.channel.id);
      }
    } catch (error) {
      console.error('Failed to initialize booking channel:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  if (state.isLoading || isInitializing) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingIndicator size={20} />
      </div>
    );
  }

  if (!state.isConnected || !state.client) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-gray-500 mb-2">Chat is not connected</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Custom theme for better styling
  const customTheme = {
    '--primary-color': '#3B82F6',
    '--primary-color-hover': '#2563EB',
    '--secondary-color': '#F3F4F6',
    '--text-color': '#1F2937',
    '--text-color-low-emphasis': '#6B7280',
    '--background-color': '#FFFFFF',
    '--surface-color': '#F9FAFB',
    '--border-color': '#E5E7EB',
    '--error-color': '#EF4444',
    '--success-color': '#10B981',
    '--warning-color': '#F59E0B',
  } as React.CSSProperties;

  return (
    <div className={`chat-container ${className}`} style={customTheme}>
      <Chat client={state.client} theme="messaging light">
        <ChannelList
          filters={filters}
          sort={{ last_message_at: -1 }}
          showChannelSearch
          additionalChannelSearchProps={{
            searchForChannels: true,
          }}
          Preview={(props) => (
            <div style={{
              padding: '12px',
              cursor: 'pointer',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb',
              fontFamily: 'Montserrat, sans-serif'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#3b82f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 600
                }}>
                  {(props.channel?.data as any)?.name?.charAt(0) || '#'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontWeight: 500,
                    color: '#111827',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {(props.channel?.data as any)?.name || 'Unknown Channel'}
                  </p>
                  {props.latestMessage && (
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {props.latestMessage.text}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        />
        <Channel>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatComponent;
