// src/components/chat/ChatList.tsx
import React, { useEffect, useState } from 'react';
import { MessageCircle, Calendar, User } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import ChatComponent from './ChatComponent';

interface ChatListProps {
  className?: string;
}

const ChatList: React.FC<ChatListProps> = ({ className = '' }) => {
  const { state, loadChannels, setActiveChannel } = useChat();
  const [selectedChannel, setSelectedChannel] = useState<any>(null);

  useEffect(() => {
    if (state.isConnected) {
      loadChannels();
    }
  }, [state.isConnected]);

  const handleChannelSelect = (channel: any) => {
    setSelectedChannel(channel);
    setActiveChannel(channel);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return d.toLocaleDateString();
  };

  if (!state.isConnected) {
    return (
      <div className={`chat-list ${className}`}>
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Chat is not connected</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-list ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Channels List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              <p className="text-sm text-gray-500">
                {state.channels.length} conversation{state.channels.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {state.channels.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No conversations yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {state.channels.map((channel: any) => (
                    <div
                      key={channel.id}
                      onClick={() => handleChannelSelect(channel)}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {channel.data?.name?.charAt(0) || '#'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {channel.data?.name || 'Unknown Channel'}
                          </h3>
                          {channel.state?.last_message && (
                            <p className="text-sm text-gray-500 truncate mt-1">
                              {channel.state.last_message.text || 'Media message'}
                            </p>
                          )}
                          {channel.data?.created_at && (
                            <div className="flex items-center mt-2 text-xs text-gray-400">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(channel.data.created_at)}
                            </div>
                          )}
                          {channel.data?.custom?.serviceName && (
                            <div className="mt-1">
                              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                {channel.data.custom.serviceName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px]">
            {selectedChannel ? (
              <ChatComponent className="h-full" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatList;
