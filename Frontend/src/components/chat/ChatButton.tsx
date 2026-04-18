// src/components/chat/ChatButton.tsx
import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatComponent from './ChatComponent';

interface ChatButtonProps {
  bookingId?: string;
  serviceName?: string;
  className?: string;
  id?: string;
}

const ChatButton: React.FC<ChatButtonProps> = ({ 
  bookingId, 
  serviceName = 'Service',
  className = '',
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`chat-button-container ${className}`}>
      {/* Chat Button */}
      <button
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center"
        aria-label="Open chat"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            !
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-blue-500 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">
                {bookingId ? `${serviceName} Chat` : 'Messages'}
              </h3>
              {bookingId && (
                <p className="text-blue-100 text-sm">Booking #{bookingId}</p>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-600 rounded p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-hidden">
            <ChatComponent bookingId={bookingId} className="h-full" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatButton;
