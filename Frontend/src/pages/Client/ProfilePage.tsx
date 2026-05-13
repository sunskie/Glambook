// Frontend/src/pages/Client/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, Pencil, Share2, Calendar, BookOpen, Star, 
  Award, Settings, Bell, Mail, Lock, Edit2, Trash2,
  ChevronRight, MapPin, Phone, User
} from 'lucide-react';
import { getClientBookings } from '../../services/api/bookingService';
import enrollmentService from '../../services/api/enrollmentService';
import reviewService from '../../services/api/reviewService';
import { loyaltyService } from '../../services/api/loyaltyService';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import ClientSidebar from '../../components/Client/ClientSidebar';
import showToast from '../../components/common/Toast';

interface Booking {
  _id: string;
  serviceId: {
    _id: string;
    title: string;
    imageUrl: string | null;
    price: number;
  } | string;
  bookingDate: string;
  bookingTime: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

interface Enrollment {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    imageUrl: string | null;
  };
  progress: number;
  enrolledAt: string;
}

interface Review {
  _id: string;
  targetType: 'service' | 'course';
  targetId: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: '#FFF7ED', color: '#92400E', label: 'Pending' },
  confirmed: { bg: '#DCFCE7', color: '#166534', label: 'Confirmed' },
  cancelled: { bg: '#FEE2E2', color: '#991B1B', label: 'Cancelled' },
  completed: { bg: '#EEF2FF', color: '#3730A3', label: 'Completed' },
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'courses' | 'reviews'>('overview');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form data for edit profile
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profilePhoto: user?.profilePhoto || '',
    bio: user?.bio || '',
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');

  // Saving states
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Preferences
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
  });

  // Data
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loyaltyData, setLoyaltyData] = useState<any>(null);
  const [location, setLocation] = useState(user?.location || 'Not specified');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    loyaltyService.getBalance().then(setLoyaltyData).catch(() => {});
  }, []);

  // Sync editForm with user data when user changes
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        profilePhoto: user.profilePhoto || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, enrollmentsRes, reviewsRes] = await Promise.all([
        getClientBookings({}).catch(() => ({ bookings: [] })),
        enrollmentService.getClientEnrollments().catch(() => ({ data: [] })),
        reviewService.getUserReviews().catch(() => ({ data: [] })),
      ]);

      setBookings(bookingsRes.bookings || []);
      setEnrollments(enrollmentsRes.data || []);
      setReviews(reviewsRes.data || []);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async () => {
    setSavingProfile(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      await api.patch('/profile/update', {
        name: editForm.name,
        phone: editForm.phone,
        bio: editForm.bio,
      });
      
      // Re-fetch to confirm saved
      const fresh: any = await api.get('/profile');
      const u = fresh.data || fresh;
      setEditForm({
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        profilePhoto: u.profilePhoto || '',
        bio: u.bio || '',
      });
      
      if (setUser) {
        setUser({ ...user!, name: u.name, phone: u.phone, bio: u.bio });
      }
      setProfileSuccess('Profile updated successfully');
      setEditModalOpen(false);
    } catch (error: any) {
      setProfileError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleEditEmail = async () => {
    setSavingEmail(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      await api.patch('/profile/update-email', {
        email: editForm.email,
        currentPassword: passwordForm.currentPassword,
      });
      if (setUser) {
        setUser({ ...user!, email: editForm.email });
      }
      setProfileSuccess('Email updated successfully');
      setEditModalOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setProfileError(error.response?.data?.message || 'Failed to update email');
    } finally {
      setSavingEmail(false);
    }
  };


  const handleChangePassword = async () => {
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match');
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
      setPasswordError('');
      setProfileSuccess('Password changed successfully');
    } catch (error: any) {
      setProfileError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await reviewService.deleteReview(reviewId);
      setReviews(reviews.filter(r => r._id !== reviewId));
      showToast.success('Review deleted');
    } catch (error) {
      showToast.error('Failed to delete review');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      setBookings(bookings.filter(b => b._id !== bookingId));
      showToast.success('Booking cancelled');
    } catch (error) {
      showToast.error('Failed to cancel booking');
    }
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafafa', fontFamily: 'Montserrat, sans-serif' }}>
        <ClientSidebar />
        <div style={{ marginLeft: '280px', flex: 1, padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafafa', fontFamily: 'Montserrat, sans-serif' }}>
      <ClientSidebar />
      <div style={{ marginLeft: '280px', flex: 1, padding: '32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Section 1: Profile Header Card */}
          <div style={{ 
            backgroundColor: 'white', 
            border: '1px solid #E5E7EB', 
            borderRadius: '16px', 
            overflow: 'hidden',
            marginBottom: '24px'
          }}>
            {/* Cover Photo */}
            <div style={{ 
              height: '160px', 
              background: 'linear-gradient(135deg, #5B62B3 0%, #E91E63 100%)',
              position: 'relative',
              padding: '16px'
            }}>
              <button style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                padding: '8px 16px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                <Pencil size={16} />
                Edit Cover
              </button>
            </div>

            {/* Profile Info */}
            <div style={{ padding: '0 32px 32px', position: 'relative' }}>
              {/* Avatar */}
              <div style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '50%',
                backgroundColor: '#5B62B3',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                fontWeight: 700,
                marginTop: '-50px',
                marginBottom: '16px',
                position: 'relative',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                {getInitials(user?.name || 'U')}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  opacity: 0,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                >
                  <Camera size={24} />
                </div>
              </div>

              {/* Name and Info */}
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px' }}>
                  {user?.name}
                </h1>
                <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 12px' }}>
                  {user?.email}
                </p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{
                    backgroundColor: '#EEF2FF',
                    color: '#5B62B3',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    Client
                  </span>
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>
                    Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: '48px', marginBottom: '24px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#5B62B3' }}>
                    {bookings.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                    Total Bookings
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#5B62B3' }}>
                    {enrollments.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                    Courses Enrolled
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#5B62B3' }}>
                    {reviews.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                    Reviews Given
                  </div>
                </div>
              </div>

              {/* Success/Error Banner */}
              {profileSuccess && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#DCFCE7',
                  border: '1px solid #86EFAC',
                  borderRadius: '8px',
                  color: '#166534',
                  fontSize: '14px',
                  marginBottom: '16px'
                }}>
                  {profileSuccess}
                </div>
              )}
              {profileError && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#FEE2E2',
                  border: '1px solid #FECACA',
                  borderRadius: '8px',
                  color: '#DC2626',
                  fontSize: '14px',
                  marginBottom: '16px'
                }}>
                  {profileError}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setEditModalOpen(true)}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: 'white',
                    color: '#5B62B3',
                    border: '1.5px solid #5B62B3',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'Montserrat, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Edit2 size={16} />
                  Edit Profile
                </button>
                <button style={{
                  padding: '10px 24px',
                  backgroundColor: 'white',
                  color: '#6B7280',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Montserrat, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Share2 size={16} />
                  Share Profile
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Tab Navigation */}
          <div style={{ 
            display: 'flex', 
            gap: '32px', 
            borderBottom: '2px solid #E5E7EB', 
            marginBottom: '24px'
          }}>
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'bookings', label: 'Bookings' },
              { key: 'courses', label: 'Courses' },
              { key: 'reviews', label: 'Reviews' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  padding: '12px 0',
                  background: 'none',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: activeTab === tab.key ? '#5B62B3' : '#6B7280',
                  borderBottom: activeTab === tab.key ? '2px solid #5B62B3' : '2px solid transparent',
                  marginBottom: '-2px',
                  fontFamily: 'Montserrat, sans-serif',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Section 3: Tab Content */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* About Card */}
                <div style={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '16px', 
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
                    About
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <User size={18} style={{ color: '#5B62B3' }} />
                      <div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>Name</div>
                        <div style={{ fontSize: '14px', fontWeight: 500 }}>{user?.name}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Mail size={18} style={{ color: '#5B62B3' }} />
                      <div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>Email</div>
                        <div style={{ fontSize: '14px', fontWeight: 500 }}>{user?.email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Phone size={18} style={{ color: '#5B62B3' }} />
                      <div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>Phone</div>
                        <div style={{ fontSize: '14px', fontWeight: 500 }}>{user?.phone || 'Not specified'}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <MapPin size={18} style={{ color: '#5B62B3' }} />
                      <div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>Location</div>
                        <div style={{ fontSize: '14px', fontWeight: 500 }}>{location}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Calendar size={18} style={{ color: '#5B62B3' }} />
                      <div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>Member since</div>
                        <div style={{ fontSize: '14px', fontWeight: 500 }}>
                          {user?.createdAt ? formatDate(user.createdAt) : '2024'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preferences Card */}
                <div style={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '16px', 
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
                    Preferences
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={preferences.emailNotifications}
                        onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: '#5B62B3' }}
                      />
                      <span style={{ fontSize: '14px' }}>Email notifications</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={preferences.smsNotifications}
                        onChange={(e) => setPreferences({ ...preferences, smsNotifications: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: '#5B62B3' }}
                      />
                      <span style={{ fontSize: '14px' }}>SMS notifications</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={preferences.marketingEmails}
                        onChange={(e) => setPreferences({ ...preferences, marketingEmails: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: '#5B62B3' }}
                      />
                      <span style={{ fontSize: '14px' }}>Marketing emails</span>
                    </label>
                  </div>
                </div>

                {/* Security Card */}
                <div style={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '16px', 
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lock size={18} style={{ color: '#5B62B3' }} />
                    Security
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontFamily: 'Montserrat, sans-serif',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontFamily: 'Montserrat, sans-serif',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontFamily: 'Montserrat, sans-serif',
                          outline: 'none'
                        }}
                      />
                    </div>
                    {passwordError && (
                      <div style={{ fontSize: '12px', color: '#DC2626' }}>{passwordError}</div>
                    )}
                    <button
                      onClick={handleChangePassword}
                      disabled={savingPassword}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: savingPassword ? '#9CA3AF' : '#5B62B3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: savingPassword ? 'not-allowed' : 'pointer',
                        fontFamily: 'Montserrat, sans-serif',
                        marginTop: '8px'
                      }}
                    >
                      {savingPassword ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Recent Activity Card */}
                <div style={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '16px', 
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
                    Recent Activity
                  </h3>
                  {bookings.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {bookings.slice(0, 3).map((booking, index) => {
                        const ss = STATUS_STYLE[booking.status] || STATUS_STYLE.pending;
                        const serviceName = typeof booking.serviceId === 'object' ? booking.serviceId.title : 'Service';
                        return (
                          <div key={booking._id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: index === 0 ? '#5B62B3' : '#E5E7EB',
                              marginTop: '6px',
                              flexShrink: 0
                            }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '14px', fontWeight: 500 }}>{serviceName}</div>
                              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                                {formatDate(booking.bookingDate)}
                              </div>
                              <span style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                                backgroundColor: ss.bg,
                                color: ss.color,
                                marginTop: '4px'
                              }}>
                                {ss.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      <button
                        onClick={() => setActiveTab('bookings')}
                        style={{
                          padding: '8px 0',
                          background: 'none',
                          border: 'none',
                          color: '#5B62B3',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'Montserrat, sans-serif',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        View All <ChevronRight size={14} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '14px', color: '#6B7280' }}>
                      No recent activity
                    </div>
                  )}
                </div>

                {/* Loyalty Card */}
                <div style={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '16px', 
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={18} style={{ color: '#E91E63' }} />
                    Loyalty
                  </h3>
                  {loyaltyData && (
                    <>
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '36px', fontWeight: 700, color: '#5B62B3' }}>
                          {loyaltyData.points || 0}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>Points</div>
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: loyaltyData.tier === 'Gold' ? '#FFF9C4' : loyaltyData.tier === 'Silver' ? '#F3F4F6' : '#FEF3C7',
                          color: loyaltyData.tier === 'Gold' ? '#B45309' : loyaltyData.tier === 'Silver' ? '#374151' : '#92400E'
                        }}>
                          {loyaltyData.tier || 'Bronze'} Tier
                        </span>
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span style={{ color: '#6B7280' }}>Progress to Gold</span>
                          <span style={{ fontWeight: 600 }}>{loyaltyData.pointsToNextTier || 0} more points</span>
                        </div>
                        <div style={{
                          height: '8px',
                          backgroundColor: '#E5E7EB',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${((loyaltyData.points || 0) / 500) * 100}%`,
                            height: '100%',
                            backgroundColor: loyaltyData.tier === 'Gold' ? '#FFD700' : loyaltyData.tier === 'Silver' ? '#C0C0C0' : '#CD7F32',
                            borderRadius: '4px'
                          }} />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Quick Actions Card */}
                <div style={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '16px', 
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
                    Quick Actions
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                      onClick={() => navigate('/client/services')}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: 'white',
                        color: '#5B62B3',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontFamily: 'Montserrat, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#5B62B3'; e.currentTarget.style.backgroundColor = '#EEF2FF'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.backgroundColor = 'white'; }}
                    >
                      <span>Book a Service</span>
                      <ChevronRight size={16} />
                    </button>
                    <button
                      onClick={() => navigate('/client/courses')}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: 'white',
                        color: '#5B62B3',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontFamily: 'Montserrat, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#5B62B3'; e.currentTarget.style.backgroundColor = '#EEF2FF'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.backgroundColor = 'white'; }}
                    >
                      <span>Browse Courses</span>
                      <ChevronRight size={16} />
                    </button>
                    <button
                      onClick={() => navigate('/client/my-courses')}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: 'white',
                        color: '#5B62B3',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontFamily: 'Montserrat, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#5B62B3'; e.currentTarget.style.backgroundColor = '#EEF2FF'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.backgroundColor = 'white'; }}
                    >
                      <span>My Certificates</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div style={{ 
              backgroundColor: 'white', 
              border: '1px solid #E5E7EB', 
              borderRadius: '16px', 
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
                My Bookings
              </h3>
              {bookings.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {bookings.map((booking) => {
                    const ss = STATUS_STYLE[booking.status] || STATUS_STYLE.pending;
                    const serviceName = typeof booking.serviceId === 'object' ? booking.serviceId.title : 'Service';
                    const serviceImage = typeof booking.serviceId === 'object' && booking.serviceId.imageUrl
                      ? (booking.serviceId.imageUrl.startsWith('http') ? booking.serviceId.imageUrl : `http://localhost:5000${booking.serviceId.imageUrl}`)
                      : 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100&q=80';
                    return (
                      <div key={booking._id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        transition: 'box-shadow 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                      >
                        <img
                          src={serviceImage}
                          alt={serviceName}
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{serviceName}</div>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>
                            {formatDate(booking.bookingDate)} at {booking.bookingTime}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#5B62B3', marginBottom: '4px' }}>
                            Rs. {booking.totalPrice?.toLocaleString()}
                          </div>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor: ss.bg,
                            color: ss.color
                          }}>
                            {ss.label}
                          </span>
                        </div>
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: 'white',
                              color: '#DC2626',
                              border: '1px solid #DC2626',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontFamily: 'Montserrat, sans-serif'
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px', color: '#6B7280' }}>
                  <Calendar size={48} style={{ color: '#E5E7EB', margin: '0 auto 16px' }} />
                  <p>No bookings yet</p>
                  <button
                    onClick={() => navigate('/client/services')}
                    style={{
                      marginTop: '16px',
                      padding: '10px 20px',
                      backgroundColor: '#5B62B3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'Montserrat, sans-serif'
                    }}
                  >
                    Book a Service
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'courses' && (
            <div style={{ 
              backgroundColor: 'white', 
              border: '1px solid #E5E7EB', 
              borderRadius: '16px', 
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
                My Courses
              </h3>
              {enrollments.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {enrollments.map((enrollment) => {
                    const courseTitle = typeof enrollment.courseId === 'object' ? enrollment.courseId.title : 'Course';
                    const courseImage = typeof enrollment.courseId === 'object' && enrollment.courseId.imageUrl
                      ? (enrollment.courseId.imageUrl.startsWith('http') ? enrollment.courseId.imageUrl : `http://localhost:5000${enrollment.courseId.imageUrl}`)
                      : 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&q=80';
                    return (
                      <div key={enrollment._id} style={{
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        transition: 'box-shadow 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                      >
                        <img
                          src={courseImage}
                          alt={courseTitle}
                          style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                        />
                        <div style={{ padding: '16px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', margin: 0 }}>
                            {courseTitle}
                          </h4>
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                              <span style={{ color: '#6B7280' }}>Progress</span>
                              <span style={{ fontWeight: 600 }}>{enrollment.progress}%</span>
                            </div>
                            <div style={{
                              height: '6px',
                              backgroundColor: '#E5E7EB',
                              borderRadius: '3px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${enrollment.progress}%`,
                                height: '100%',
                                backgroundColor: '#E91E63',
                                borderRadius: '3px'
                              }} />
                            </div>
                          </div>
                          <button
                            onClick={() => navigate(`/client/learning/${enrollment._id}`)}
                            style={{
                              width: '100%',
                              padding: '8px',
                              backgroundColor: '#5B62B3',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontFamily: 'Montserrat, sans-serif'
                            }}
                          >
                            Continue Learning
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px', color: '#6B7280' }}>
                  <BookOpen size={48} style={{ color: '#E5E7EB', margin: '0 auto 16px' }} />
                  <p>No courses enrolled yet</p>
                  <button
                    onClick={() => navigate('/client/courses')}
                    style={{
                      marginTop: '16px',
                      padding: '10px 20px',
                      backgroundColor: '#5B62B3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'Montserrat, sans-serif'
                    }}
                  >
                    Browse Courses
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div style={{ 
              backgroundColor: 'white', 
              border: '1px solid #E5E7EB', 
              borderRadius: '16px', 
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
                My Reviews
              </h3>
              {reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {reviews.map((review) => (
                    <div key={review._id} style={{
                      padding: '16px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      transition: 'box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                            {review.targetType === 'service' ? 'Service' : 'Course'} Review
                          </div>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                style={{
                                  color: '#fbbf24',
                                  fill: star <= review.rating ? '#fbbf24' : 'transparent'
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>
                          {formatDate(review.createdAt)}
                        </div>
                      </div>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', margin: 0 }}>
                        {review.title}
                      </h4>
                      <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: '0 0 12px' }}>
                        {review.comment}
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{
                          padding: '6px 12px',
                          backgroundColor: 'white',
                          color: '#5B62B3',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'Montserrat, sans-serif',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Edit2 size={12} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: 'white',
                            color: '#DC2626',
                            border: '1px solid #E5E7EB',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'Montserrat, sans-serif',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px', color: '#6B7280' }}>
                  <Star size={48} style={{ color: '#E5E7EB', margin: '0 auto 16px' }} />
                  <p>No reviews yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 24px' }}>
              Edit Profile
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: '#5B62B3',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  fontWeight: 700,
                  margin: '0 auto 8px',
                  cursor: 'pointer',
                  position: 'relative'
                }}>
                  {getInitials(editForm.name)}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    opacity: 0,
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                  >
                    <Camera size={20} />
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>Click to change photo</span>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'Montserrat, sans-serif',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'Montserrat, sans-serif',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={e => {
                    const cleaned = e.target.value.replace(/[^0-9+\-\s]/g, '');
                    setEditForm(prev => ({ ...prev, phone: cleaned }));
                  }}
                  onBlur={() => {
                    const digitsOnly = editForm.phone.replace(/\D/g, '');
                    if (editForm.phone && digitsOnly.length < 7) {
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
                    fontFamily: 'Montserrat, sans-serif',
                    outline: 'none'
                  }}
                />
                <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '3px 0 0' }}>
                  Numbers only · e.g. 9800000000
                </p>
              </div>


              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  onClick={() => {
                    setEditModalOpen(false);
                    setProfileError('');
                    setProfileSuccess('');
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: 'white',
                    color: '#6B7280',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditProfile}
                  disabled={savingProfile}
                  style={{
                    flex: 2,
                    padding: '10px',
                    backgroundColor: savingProfile ? '#9CA3AF' : '#5B62B3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: savingProfile ? 'not-allowed' : 'pointer',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                >
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

export default ProfilePage;
