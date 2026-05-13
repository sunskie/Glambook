import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Pencil, Settings, Lock, Mail, Phone, MapPin, User, Calendar, Star } from 'lucide-react';
import VendorSidebar from '../../components/Vendor/VendorSidebar';
import api from '../../utils/api';
import showToast from '../../components/common/Toast';

const VendorProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', bio: '', businessName: '', businessDescription: '' });
  const [emailForm, setEmailForm] = useState({ email: '', currentPassword: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile');
      setUser(res.data);
      setProfileForm({
        name: res.data.name || '',
        phone: res.data.phone || '',
        bio: res.data.bio || '',
        businessName: res.data.businessName || '',
        businessDescription: res.data.businessDescription || '',
      });
      setEmailForm({ email: res.data.email || '', currentPassword: '' });
    } catch (error: any) {
      showToast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      await api.patch('/profile/update', profileForm);
      setUser({ ...user, ...profileForm });
      setProfileSuccess('Profile updated successfully');
      setEditModalOpen(false);
    } catch (error: any) {
      setProfileError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveEmail = async () => {
    setSavingEmail(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      await api.patch('/profile/update-email', emailForm);
      setUser({ ...user, email: emailForm.email });
      setProfileSuccess('Email updated successfully');
      setEditModalOpen(false);
      setEmailForm({ ...emailForm, currentPassword: '' });
    } catch (error: any) {
      setProfileError(error.response?.data?.message || 'Failed to update email');
    } finally {
      setSavingEmail(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword.length < 6) {
      setProfileError('Password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setProfileError('Passwords do not match');
      return;
    }
    setSavingPassword(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      await api.patch('/profile/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setProfileSuccess('Password changed successfully');
    } catch (error: any) {
      setProfileError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafafa', fontFamily: 'Montserrat, sans-serif' }}>
        <VendorSidebar />
        <div style={{ marginLeft: '280px', flex: 1, padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafafa', fontFamily: 'Montserrat, sans-serif' }}>
      <VendorSidebar />
      <div style={{ marginLeft: '280px', flex: 1, padding: '32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>Profile</h1>

          {/* Success/Error Banner */}
          {profileSuccess && (
            <div style={{ padding: '12px 16px', backgroundColor: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '8px', color: '#166534', fontSize: '14px', marginBottom: '24px' }}>
              {profileSuccess}
            </div>
          )}
          {profileError && (
            <div style={{ padding: '12px 16px', backgroundColor: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', color: '#DC2626', fontSize: '14px', marginBottom: '24px' }}>
              {profileError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Profile Info Card */}
            <div style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Profile Information</h2>
                <button onClick={() => setEditModalOpen(true)} style={{ padding: '8px 16px', backgroundColor: '#5B62B3', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Pencil size={14} /> Edit
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#5B62B3', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 700 }}>
                    {user?.name?.charAt(0) || 'V'}
                  </div>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 600 }}>{user?.name}</div>
                    <div style={{ fontSize: '14px', color: '#6B7280' }}>{user?.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <User size={16} style={{ color: '#5B62B3' }} />
                    <span style={{ fontSize: '14px' }}>{user?.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Mail size={16} style={{ color: '#5B62B3' }} />
                    <span style={{ fontSize: '14px' }}>{user?.email}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Phone size={16} style={{ color: '#5B62B3' }} />
                    <span style={{ fontSize: '14px' }}>{user?.phone || 'Not specified'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Calendar size={16} style={{ color: '#5B62B3' }} />
                    <span style={{ fontSize: '14px' }}>Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Info Card */}
            <div style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Business Information</h2>
                <button onClick={() => setEditModalOpen(true)} style={{ padding: '8px 16px', backgroundColor: '#5B62B3', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Pencil size={14} /> Edit
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Business Name</label>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{user?.businessName || 'Not specified'}</div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Business Description</label>
                  <div style={{ fontSize: '14px' }}>{user?.businessDescription || 'Not specified'}</div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Bio</label>
                  <div style={{ fontSize: '14px' }}>{user?.bio || 'Not specified'}</div>
                </div>
              </div>
            </div>

            {/* Security Card */}
            <div style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} style={{ color: '#5B62B3' }} /> Security
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Current Password</label>
                  <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>New Password</label>
                  <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Confirm New Password</label>
                  <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
                </div>
                <button onClick={handleChangePassword} disabled={savingPassword} style={{ padding: '10px 20px', backgroundColor: savingPassword ? '#9CA3AF' : '#5B62B3', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: savingPassword ? 'not-allowed' : 'pointer', marginTop: '8px' }}>
                  {savingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>

            {/* Email Change Card */}
            <div style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={18} style={{ color: '#5B62B3' }} /> Change Email
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>New Email</label>
                  <input type="email" value={emailForm.email} onChange={e => setEmailForm({ ...emailForm, email: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Current Password</label>
                  <input type="password" value={emailForm.currentPassword} onChange={e => setEmailForm({ ...emailForm, currentPassword: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
                </div>
                <button onClick={handleSaveEmail} disabled={savingEmail} style={{ padding: '10px 20px', backgroundColor: savingEmail ? '#9CA3AF' : '#5B62B3', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: savingEmail ? 'not-allowed' : 'pointer', marginTop: '8px' }}>
                  {savingEmail ? 'Updating...' : 'Update Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '440px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Edit Profile</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Full Name</label>
                <input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Phone</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={e => {
                    const cleaned = e.target.value.replace(/[^0-9+\-\s]/g, '');
                    setProfileForm(prev => ({ ...prev, phone: cleaned }));
                  }}
                  onBlur={() => {
                    const digitsOnly = profileForm.phone.replace(/\D/g, '');
                    if (profileForm.phone && digitsOnly.length < 7) {
                      setProfileError('Please enter a valid phone number');
                    } else {
                      setProfileError('');
                    }
                  }}
                  placeholder="9800000000"
                  maxLength={15}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1.5px solid ${profileError && profileError.includes('phone') ? '#DC2626' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '3px 0 0' }}>
                  Numbers only · e.g. 9800000000
                </p>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Business Name</label>
                <input type="text" value={profileForm.businessName} onChange={e => setProfileForm({ ...profileForm, businessName: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Business Description</label>
                <textarea value={profileForm.businessDescription} onChange={e => setProfileForm({ ...profileForm, businessDescription: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', minHeight: '80px', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Bio</label>
                <textarea value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', minHeight: '80px', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button onClick={() => { setEditModalOpen(false); setProfileError(''); setProfileSuccess(''); }} style={{ flex: 1, padding: '10px', backgroundColor: 'white', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSaveProfile} disabled={savingProfile} style={{ flex: 2, padding: '10px', backgroundColor: savingProfile ? '#9CA3AF' : '#5B62B3', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: savingProfile ? 'not-allowed' : 'pointer' }}>
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProfilePage;
