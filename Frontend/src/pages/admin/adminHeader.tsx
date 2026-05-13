// Frontend/src/components/Admin/AdminHeader.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut, User, LayoutDashboard, Users, Briefcase,
  Scissors, Calendar, BookOpen, GraduationCap, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/vendors', label: 'Vendors', icon: Briefcase },
    { path: '/admin/services', label: 'Services', icon: Scissors },
    { path: '/admin/courses', label: 'Courses', icon: BookOpen },
    { path: '/admin/bookings', label: 'Bookings', icon: Calendar },
    { path: '/admin/enrollments', label: 'Enrollments', icon: GraduationCap },
    { path: '/admin/disputes', label: 'Disputes', icon: Shield },
    { path: '/admin/profile', label: 'Profile', icon: User },
  ];

  return (
    <header style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #E0E0E0',
      padding: '16px 0',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo */}
        <div
          onClick={() => navigate('/admin/dashboard')}
          style={{
            fontSize: '24px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'Syne, sans-serif',
            cursor: 'pointer'
          }}
        >
          GlamBook Admin
        </div>

        {/* Navigation */}
        <nav style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  backgroundColor: active ? '#F3E5F5' : 'transparent',
                  color: active ? '#7B1FA2' : '#666',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'Montserrat, sans-serif'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = '#F5F5F5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Menu */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px',
            backgroundColor: '#F5F5F5',
            borderRadius: '8px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#7B1FA2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'Montserrat, sans-serif'
            }}>
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#111',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                {user?.name || 'Admin'}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#666',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Administrator
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: 'transparent',
              color: '#F44336',
              border: '1px solid #F44336',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Montserrat, sans-serif',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F44336';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#F44336';
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
