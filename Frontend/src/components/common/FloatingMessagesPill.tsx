import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Send } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

const FloatingMessagesPill: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { state } = useChat();

  const hiddenPaths = ['/client/messages', '/vendor/messages', '/admin/messages', '/login', '/register', '/'];
  if (!user || hiddenPaths.some(path => location.pathname === path || location.pathname.startsWith(path + '/'))) return null;

  // Determine which messages page to navigate to based on user role
  const getMessagesPath = () => {
    if (user?.role === 'admin') {
      return '/admin/messages';
    } else if (user?.role === 'vendor') {
      return '/vendor/messages';
    } else {
      return '/client/messages';
    }
  };

  // Get recent contacts for the small avatars
  const getRecentContacts = () => {
    // Get first 3 channels with other members
    const channels = state.channels.slice(0, 3);
    return channels.map(channel => {
      const currentUserId = state.user?.id;
      const otherMembers = (Object.values(channel.state?.members || {}) as any[]).filter((member: any) => {
        const memberUser = member.user;
        return memberUser && memberUser.id && memberUser.id !== currentUserId;
      });
      const otherUser = otherMembers[0]?.user;
      return {
        name: otherUser?.name || 'Unknown',
        avatar: otherUser?.name?.charAt(0)?.toUpperCase() || '?',
      };
    });
  };

  const recentContacts = getRecentContacts();

  const handleClick = () => {
    navigate(getMessagesPath());
  };

  return (
    <button
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 20px',
        backgroundColor: 'white',
        border: 'none',
        borderRadius: '24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        cursor: 'pointer',
        fontFamily: 'Montserrat, sans-serif',
        fontSize: '14px',
        fontWeight: 600,
        color: '#000',
        zIndex: 1000,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      }}
    >
      {/* Paper plane icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Send size={18} color="#5B62B3" style={{ transform: 'rotate(-45deg)' }} />
      </div>

      {/* Messages text */}
      <span>Messages</span>

      {/* Recent contact avatars */}
      <div style={{ display: 'flex', marginLeft: '8px' }}>
        {recentContacts.length > 0 ? (
          recentContacts.map((contact, index) => (
            <div
              key={index}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#5B62B3',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 600,
                border: '2px solid white',
                marginLeft: index > 0 ? '-8px' : '0',
                position: 'relative',
                zIndex: recentContacts.length - index,
              }}
            >
              {contact.avatar}
            </div>
          ))
        ) : (
          // Show placeholder avatars if no recent contacts
          [1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#e0e0e0',
                border: '2px solid white',
                marginLeft: i > 1 ? '-8px' : '0',
                position: 'relative',
                zIndex: 4 - i,
              }}
            />
          ))
        )}
      </div>
    </button>
  );
};

export default FloatingMessagesPill;
