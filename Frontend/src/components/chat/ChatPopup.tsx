// src/components/chat/ChatPopup.tsx
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import ChatComponent from './ChatComponent';

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatPopup: React.FC<ChatPopupProps> = ({ isOpen, onClose }) => {
  const { state } = useChat();

  if (!isOpen) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '360px',
          height: '500px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#F9FAFB',
            borderRadius: '12px 12px 0 0',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111' }}>
            Messages
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} color="#6B7280" />
          </button>
        </div>

        {/* Chat Content */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            borderRadius: '0 0 12px 12px',
          }}
        >
          <ChatComponent className="h-full" />
        </div>
      </div>
    </div>
  );
};

export default ChatPopup;
