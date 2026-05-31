// Frontend/src/components/Admin/AdminHeader.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Store,
  BookOpen, DollarSign, AlertTriangle, BarChart2, Bell, Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users',     label: 'Users',     icon: Users },
    { path: '/admin/vendors',   label: 'Vendors',   icon: Store },
    { path: '/admin/courses',   label: 'Courses',   icon: BookOpen },
    { path: '/admin/disputes',  label: 'Disputes',  icon: AlertTriangle },
    { path: '/admin/settings',  label: 'Settings',  icon: Settings },
  ];

  return (
    <>
      {/* Sidebar */}
      <aside style={{
        width: '220px',
        minHeight: '100vh',
        backgroundColor: 'white',
        borderRight: '1px solid #F0F0F0',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
      }}>

        {/* Logo */}
        <div
          onClick={() => navigate('/admin/dashboard')}
          style={{
            padding: '24px 20px 20px',
            cursor: 'pointer',
            borderBottom: '1px solid #F5F5F5',
          }}
        >
          <div style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#1a1a2e',
            fontFamily: 'Syne, sans-serif',
            letterSpacing: '-0.3px'
          }}>
            GlamBook
          </div>
          <div style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#aaa',
            fontFamily: 'Montserrat, sans-serif',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginTop: '2px'
          }}>
            Admin Panel
          </div>
        </div>

        {/* Navigation */}
        <nav style={{
          flex: 1,
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          overflowY: 'auto',
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
                  gap: '10px',
                  padding: '10px 12px',
                  backgroundColor: active ? '#F5F3FF' : 'transparent',
                  color: active ? '#6366F1' : '#666',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  fontFamily: 'Montserrat, sans-serif',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = '#FAFAFA';
                    e.currentTarget.style.color = '#1a1a2e';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#666';
                  }
                }}
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Profile at bottom */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #F5F5F5',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#F5F3FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 700,
            color: '#6366F1',
            fontFamily: 'Montserrat, sans-serif',
            flexShrink: 0
          }}>
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#1a1a2e',
              fontFamily: 'Montserrat, sans-serif',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {user?.name || 'Admin'}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#aaa',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Administrator
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminHeader;