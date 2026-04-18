import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, BookOpen, GraduationCap, Send, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PRIMARY = '#5B62B3';

const VendorSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const sidebarItems = [
    { icon: <Home size={20} />, label: 'Dashboard', path: '/vendor/dashboard' },
    { icon: <Compass size={20} />, label: 'Services', path: '/vendor/services' },
    { icon: <BookOpen size={20} />, label: 'Bookings', path: '/vendor/bookings' },
    { icon: <GraduationCap size={20} />, label: 'Courses', path: '/vendor/courses' },
    { icon: <Send size={20} />, label: 'Messages', path: '/vendor/messages' },
    { icon: <Bell size={20} />, label: 'Notifications', path: '/vendor/notifications' },
    { icon: <User size={20} />, label: 'Profile', path: '/vendor/profile' },
  ];

  return (
    <div style={{
      width: '280px',
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      borderRight: '1px solid #dbdbdb',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      fontFamily: 'Montserrat, sans-serif',
    }}>
      <div style={{ padding: '24px 20px', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: PRIMARY, margin: 0 }}>GlamBook</h1>
      </div>

      <nav style={{ flex: 1 }}>
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.path ||
            location.pathname.startsWith(item.path + '/');
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                width: '100%',
                padding: '14px 20px',
                border: 'none',
                backgroundColor: isActive ? 'white' : 'transparent',
                color: isActive ? PRIMARY : '#111',
                fontSize: '14px',
                fontWeight: isActive ? 700 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                borderRadius: isActive ? '12px' : '0',
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '20px', borderTop: '1px solid #dbdbdb', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: PRIMARY,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 600,
          fontSize: '16px',
          flexShrink: 0,
        }}>
          {user?.name?.charAt(0)?.toUpperCase() || 'V'}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name || 'Vendor'}
          </div>
          <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Vendor</div>
        </div>
      </div>
    </div>
  );
};

export default VendorSidebar;
