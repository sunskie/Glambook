import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Compass, Send, Bell, BookOpen, User, LogOut, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PRIMARY = '#5B62B3';

const ClientSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const sidebarItems = [
    { icon: <Home size={20} />, label: 'Home', path: '/client/dashboard' },
    { icon: <Search size={20} />, label: 'Search', path: '/client/browse' },
    { icon: <Compass size={20} />, label: 'Explore', path: '/client/browse' },
    { icon: <Send size={20} />, label: 'Messages', path: '/client/messages' },
    { icon: <Bell size={20} />, label: 'Notifications', path: '/client/notifications' },
    { icon: <BookOpen size={20} />, label: 'Courses', path: '/client/browse/courses' },
    { icon: <GraduationCap size={20} />, label: 'My Courses', path: '/client/my-courses' },
    { icon: <User size={20} />, label: 'Profile', path: '/client/profile' },
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
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name || 'User'}
          </div>
          <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Client</div>
        </div>
      </div>

      <button
        onClick={logout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          padding: '12px 20px',
          border: 'none',
          backgroundColor: 'transparent',
          color: '#ef4444',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'Montserrat, sans-serif',
          borderTop: '1px solid #dbdbdb',
          marginTop: '8px',
        }}
      >
        <LogOut size={20} />
        Logout
      </button>
    </div>
  );
};

export default ClientSidebar;
