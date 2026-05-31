import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  User, Users, DollarSign, BarChart2,
  Sliders, FileText, LogOut, ChevronRight, Settings as SettingsIcon
} from 'lucide-react';

interface SettingsItem {
  icon: React.ElementType;
  label: string;
  desc: string;
  onClick: () => void;
  danger?: boolean;
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

const AdminSettings = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const userAny = user as any;

  const handleLogout = () => { logout(); navigate('/login'); };

  const sections: SettingsSection[] = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Admin Profile', desc: 'Update administrator information',
          onClick: () => navigate('/admin/profile') },
        { icon: Users, label: 'User Management', desc: 'Manage clients and vendors',
          onClick: () => navigate('/admin/users') },
        { icon: DollarSign, label: 'Commission Settings', desc: 'Configure platform commission rates',
          onClick: () => navigate('/admin/commission') },
        { icon: BarChart2, label: 'Analytics', desc: 'View platform performance metrics',
          onClick: () => navigate('/admin/analytics') },
      ]
    },
    {
      title: 'System',
      items: [
        { icon: Sliders, label: 'System Configuration', desc: 'Platform-wide settings',
          onClick: () => navigate('/admin/config') },
        { icon: FileText, label: 'Platform Policies', desc: 'View and update terms and policies',
          onClick: () => navigate('/terms-and-conditions') },
      ]
    },
    {
      title: 'Session',
      items: [
        { icon: LogOut, label: 'Logout', desc: 'Sign out of admin account',
          onClick: handleLogout, danger: true },
      ]
    }
  ];

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 20px',
                  fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px',
                    marginBottom: '32px' }}>
        <SettingsIcon size={24} color="#6366f1" />
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', margin: 0,
                       color: '#111827' }}>Settings</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
            Manage your account preferences
          </p>
        </div>
      </div>

      {/* User card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px',
                    background: '#f9fafb', border: '1px solid #e5e7eb',
                    borderRadius: '14px', padding: '18px 20px', marginBottom: '28px' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '20px', fontWeight: '700', color: 'white',
                      overflow: 'hidden', flexShrink: 0 }}>
          {userAny?.profileImage
            ? <img src={userAny.profileImage} alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : (user?.name?.[0] || 'A').toUpperCase()
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: '600', fontSize: '15px', color: '#111827',
                        whiteSpace: 'nowrap', overflow: 'hidden',
                        textOverflow: 'ellipsis' }}>
            {user?.name || 'Admin'}
          </div>
          <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
            {user?.email}
          </div>
          <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '11px',
                         background: '#ede9fe', color: '#6366f1', padding: '2px 8px',
                         borderRadius: '20px', fontWeight: '500' }}>
            Admin
          </span>
        </div>
      </div>

      {/* Sections */}
      {sections.map((section) => (
        <div key={section.title} style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af',
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                      margin: '0 0 8px 4px' }}>
            {section.title}
          </p>
          <div style={{ background: 'white', border: '1px solid #e5e7eb',
                        borderRadius: '14px', overflow: 'hidden' }}>
            {section.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  onClick={item.onClick}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    width: '100%', padding: '15px 18px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: i < section.items.length - 1
                      ? '1px solid #f3f4f6' : 'none',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.background =
                      item.danger ? '#fff5f5' : '#f9fafb')}
                  onMouseLeave={e =>
                    (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: item.danger ? '#fee2e2' : '#f3f4f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={18} color={item.danger ? '#ef4444' : '#6366f1'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500',
                                  color: item.danger ? '#ef4444' : '#111827' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '1px' }}>
                      {item.desc}
                    </div>
                  </div>
                  <ChevronRight size={16} color="#d1d5db" />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminSettings;
