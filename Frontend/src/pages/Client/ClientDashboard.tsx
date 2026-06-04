import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, BookOpen, History, Award,
  Star, Gift, Sparkles
} from 'lucide-react';
import serviceService from '../../services/api/serviceService';
import { loyaltyService } from '../../services/api/loyaltyService';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import type { Service } from '../../types';
import ClientSidebar from '../../components/Client/ClientSidebar';

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [loyaltyData, setLoyaltyData] = useState<any>(null);
  const [dashboardRecs, setDashboardRecs] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    loyaltyService.getBalance().then(data => setLoyaltyData(data)).catch(() => {});
  }, []);

  useEffect(() => {
    api.get('/recommendations/services?limit=3')
      .then((res: any) => {
        const items = res.data?.services || res.services || [];
        setDashboardRecs(items);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    api.get('/bookings/my-bookings')
      .then((res: any) => {
        const data = 
          res?.data?.bookings ||
          res?.data?.data?.bookings ||
          (Array.isArray(res?.data) ? res.data : null) ||
          res?.bookings || [];
        setBookings(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    api.get('/enrollments/my')
      .then((res: any) => {
        const data =
          res?.data?.enrollments ||
          res?.data?.data?.enrollments ||
          (Array.isArray(res?.data) ? res.data : null) ||
          res?.enrollments || [];
        setEnrollments(data);
      })
      .catch(() => {});
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const servicesRes = await serviceService.getAllServices({ status: 'active' }, 1);
      const servicesData = Array.isArray(servicesRes.data) ? servicesRes.data.slice(0, 3) : [];
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ── helpers to safely extract string from populated or unpopulated fields ──
  const getServiceTitle = (booking: any): string => {
    if (booking.serviceId && typeof booking.serviceId === 'object') return booking.serviceId.title || 'Service';
    if (booking.service && typeof booking.service === 'object') return booking.service.title || 'Service';
    return 'Service';
  };

  const getCourseTitle = (enrollment: any): string => {
    if (enrollment.courseId && typeof enrollment.courseId === 'object') return enrollment.courseId.title || 'Course';
    if (enrollment.course && typeof enrollment.course === 'object') return enrollment.course.title || 'Course';
    return 'Course';
  };

  const getCourseId = (enrollment: any): string => {
    if (enrollment.courseId && typeof enrollment.courseId === 'object') return enrollment.courseId._id || '';
    return enrollment.courseId || '';
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #E2E4F0', borderTopColor: '#5B62B3', borderRadius: '50%' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafafa', fontFamily: 'Montserrat, sans-serif' }}>
      <ClientSidebar />
      <div style={{ marginLeft: '280px', flex: 1, padding: '32px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

          {/* Welcome Section */}
          <div style={{
            position: 'relative', marginBottom: '40px', overflow: 'hidden',
            borderRadius: '24px', background: 'linear-gradient(135deg, #5B62B3 0%, #747BCF 50%, #5B62B3 100%)',
            padding: '48px', color: 'white', boxShadow: '0 20px 60px rgba(91, 98, 179, 0.2)'
          }}>
            <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '32px' }}>
              <div>
                <h1 style={{ fontSize: '36px', fontWeight: 700, fontFamily: 'Syne, sans-serif', margin: '0 0 8px 0' }}>
                  Welcome to GlamBook, {user?.name?.split(' ')[0] || 'Guest'}
                </h1>
                <p style={{ fontSize: '18px', fontWeight: 300, color: 'rgba(255, 255, 255, 0.8)', margin: '0 0 24px 0' }}>
                  Your journey to beauty and professional excellence starts here.
                </p>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '40px' }}>
            {[
              { icon: <Calendar size={32} style={{ color: '#5B62B3' }} />, label: 'Book Service', path: '/client/browse/services' },
              { icon: <BookOpen size={32} style={{ color: '#5B62B3' }} />, label: 'Browse Courses', path: '/client/browse/courses' },
              { icon: <History size={32} style={{ color: '#5B62B3' }} />, label: 'My Bookings', path: '/client/bookings' },
              { icon: <Award size={32} style={{ color: '#5B62B3' }} />, label: 'Certificates', path: '/client/my-courses' },
            ].map(({ icon, label, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', backgroundColor: 'white', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', cursor: 'pointer' }}
              >
                <div style={{ marginBottom: '12px' }}>{icon}</div>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* Main Content Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>

            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

              {/* Upcoming Bookings */}
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111', margin: '0 0 24px 0', fontFamily: 'Syne, sans-serif' }}>
                  Upcoming Bookings
                </h3>
                {bookings.filter((b: any) => b.status === 'pending' || b.status === 'confirmed').length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {bookings.filter((b: any) => b.status === 'pending' || b.status === 'confirmed').map((booking: any) => (
                      <div key={booking._id} style={{ borderRadius: '16px', backgroundColor: 'white', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'rgba(91,98,179,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B62B3' }}>
                          <Calendar size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '16px', fontWeight: 600, color: '#111', margin: '0 0 4px 0' }}>
                            {getServiceTitle(booking)}
                          </p>
                          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 4px 0' }}>
                            {booking.date ? new Date(booking.date).toLocaleDateString() : booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'Date TBD'} at {booking.time || booking.timeSlot || 'TBD'}
                          </p>
                          <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', backgroundColor: booking.status === 'confirmed' ? '#ecfdf5' : '#fef3c7', color: booking.status === 'confirmed' ? '#10b981' : '#f59e0b' }}>
                            {booking.status}
                          </div>
                        </div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#5B62B3' }}>
                          Rs. {booking.totalPrice || booking.price || ''}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', backgroundColor: 'white', padding: '48px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '2px dashed #e2e8f0' }}>
                    <Calendar size={40} style={{ color: '#cbd5e1', marginBottom: '24px' }} />
                    <p style={{ fontSize: '18px', fontWeight: 600, color: '#111', marginBottom: '8px', textAlign: 'center' }}>No upcoming bookings yet.</p>
                    <p style={{ fontSize: '14px', color: '#64748b', textAlign: 'center', marginBottom: '32px' }}>Ready for a makeover? Browse our top-rated services to get started.</p>
                    <button onClick={() => navigate('/client/browse/services')} style={{ padding: '10px 24px', backgroundColor: '#5B62B3', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                      Browse Services
                    </button>
                  </div>
                )}
              </div>

              {/* Active Learning */}
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111', margin: '0 0 24px 0', fontFamily: 'Syne, sans-serif' }}>
                  Active Learning
                </h3>
                {enrollments.filter((e: any) => (e.progress || 0) < 100).length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {enrollments.filter((e: any) => (e.progress || 0) < 100).map((enrollment: any) => (
                      <div key={enrollment._id} style={{ borderRadius: '16px', backgroundColor: 'white', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'rgba(91,98,179,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B62B3' }}>
                          <BookOpen size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '16px', fontWeight: 600, color: '#111', margin: '0 0 4px 0' }}>
                            {getCourseTitle(enrollment)}
                          </p>
                          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 8px 0' }}>
                            {enrollment.progress || 0}% complete
                          </p>
                          <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ width: `${enrollment.progress || 0}%`, height: '100%', backgroundColor: '#5B62B3', borderRadius: '9999px' }} />
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/client/courses/${getCourseId(enrollment)}/learn`)}
                          style={{ padding: '8px 16px', backgroundColor: '#5B62B3', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', flexShrink: 0, fontFamily: 'Montserrat, sans-serif' }}
                        >
                          Continue →
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', backgroundColor: 'white', padding: '48px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '2px dashed #e2e8f0' }}>
                    <BookOpen size={40} style={{ color: '#cbd5e1', marginBottom: '24px' }} />
                    <p style={{ fontSize: '18px', fontWeight: 600, color: '#111', marginBottom: '8px', textAlign: 'center' }}>You haven't enrolled in any courses yet.</p>
                    <p style={{ fontSize: '14px', color: '#64748b', textAlign: 'center', marginBottom: '32px' }}>Master new skills with our professional certification programs.</p>
                    <button onClick={() => navigate('/client/browse/courses')} style={{ padding: '10px 24px', backgroundColor: '#f1f5f9', color: '#111', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                      Explore Academy
                    </button>
                  </div>
                )}
              </div>

              {/* Recent Bookings History */}
              {bookings.filter((b: any) => b.status === 'completed' || b.status === 'cancelled').length > 0 && (
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111', margin: '0 0 24px 0', fontFamily: 'Syne, sans-serif' }}>
                    Recent History
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {bookings.filter((b: any) => b.status === 'completed' || b.status === 'cancelled').slice(0, 3).map((booking: any) => (
                      <div key={booking._id} style={{ borderRadius: '16px', backgroundColor: 'white', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: booking.status === 'completed' ? '#ecfdf5' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: booking.status === 'completed' ? '#10b981' : '#ef4444' }}>
                          <History size={20} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: '#111', margin: '0 0 2px 0' }}>
                            {getServiceTitle(booking)}
                          </p>
                          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                            {booking.date ? new Date(booking.date).toLocaleDateString() : booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : ''}
                          </p>
                        </div>
                        <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '9999px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', backgroundColor: booking.status === 'completed' ? '#ecfdf5' : '#fef2f2', color: booking.status === 'completed' ? '#10b981' : '#ef4444' }}>
                          {booking.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

              {/* GlamPoints Card */}
              <div style={{ borderRadius: '16px', backgroundColor: 'white', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', backgroundColor: 'rgba(91,98,179,0.1)', color: '#5B62B3' }}>
                    <Sparkles size={24} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#64748b', padding: '4px 12px', borderRadius: '9999px', textTransform: 'uppercase' }}>
                    GlamPoints
                  </span>
                </div>
                {loyaltyData?.discountUnlocked ? (
                  <>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', margin: '0 0 4px 0' }}>Reward Unlocked</p>
                    <h4 style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a', margin: '0 0 16px 0' }}>
                      10% OFF on your next service booking
                    </h4>
                    <button onClick={() => navigate('/client/browse/services')} style={{ width: '100%', borderRadius: '12px', backgroundColor: '#5B62B3', padding: '12px', fontSize: '14px', fontWeight: 700, color: 'white', border: 'none', cursor: 'pointer' }}>
                      Book Now & Save
                    </button>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', margin: '0 0 4px 0' }}>GlamPoints</p>
                    <h4 style={{ fontSize: '32px', fontWeight: 700, color: '#111', margin: '0 0 24px 0' }}>
                      {loyaltyData?.points || 0} <span style={{ fontSize: '14px', fontWeight: 500, color: '#94a3b8' }}>/ 100</span>
                    </h4>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(((loyaltyData?.points || 0) / 100) * 100, 100)}%`, height: '100%', backgroundColor: '#5B62B3', borderRadius: '9999px' }} />
                      </div>
                      <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, textAlign: 'center', marginTop: '12px' }}>
                        {loyaltyData?.pointsToReward || (100 - (loyaltyData?.points || 0))} points until your next reward
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Recommended Services */}
              {dashboardRecs.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111', marginBottom: '12px', fontFamily: 'Syne, sans-serif' }}>
                    You Might Also Like
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {dashboardRecs.map((service: any) => (
                      <div
                        key={service._id}
                        onClick={() => navigate(`/client/book/${service._id}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '10px', border: '1px solid #F3F4F6', marginBottom: '8px', cursor: 'pointer', backgroundColor: 'white', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#F9FAFB'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'white'}
                      >
                        <div style={{ width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#EEF2FF', position: 'relative' as const }}>
                          {(() => {
                            const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
                            const rawSrc = service.images?.[0] || service.imageUrl || '';
                            const imgSrc = rawSrc.startsWith('http') ? rawSrc : rawSrc ? `${BASE_URL}${rawSrc}` : '';
                            return (
                              <>
                                <div style={{ position: 'absolute' as const, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', zIndex: 0, background: 'linear-gradient(135deg, #EEF2FF, #C7D2FE)' }}>
                                  {service.category?.toLowerCase().includes('nail') ? '💅' : service.category?.toLowerCase().includes('hair') ? '💇' : service.category?.toLowerCase().includes('makeup') ? '💄' : '✨'}
                                </div>
                                {imgSrc && (
                                  <img src={imgSrc} alt={service.title}
                                    style={{ position: 'absolute' as const, inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
                                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                  />
                                )}
                              </>
                            );
                          })()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {service.title}
                          </p>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#F59E0B' }}>
                            ⭐ {service.rating?.toFixed(1) || 'New'}
                          </p>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#5B62B3', flexShrink: 0 }}>
                          Rs. {service.price}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Welcome Bonus */}
              <div style={{ borderRadius: '16px', border: '2px dashed #e2e8f0', padding: '24px' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '16px' }}>
                  Your Welcome Bonus
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', flexShrink: 0, borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Gift size={20} />
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#111', margin: '0 0 2px 0' }}>10% Off First Service</p>
                      <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>Valid for 30 days</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', flexShrink: 0, borderRadius: '8px', backgroundColor: 'rgba(91,98,179,0.05)', color: '#5B62B3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#111', margin: '0 0 2px 0' }}>50 Points Added</p>
                      <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>New Account Bonus</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div style={{ marginTop: '64px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', paddingTop: '40px', borderTop: '1px solid #e2e8f0' }}>
            {[
              { icon: <Calendar size={24} style={{ color: '#94a3b8' }} />, value: String(bookings.filter((b: any) => b.status === 'pending' || b.status === 'confirmed').length), label: 'Active Bookings' },
              { icon: <BookOpen size={24} style={{ color: '#94a3b8' }} />, value: String(enrollments.length), label: 'Courses Enrolled' },
              { icon: <Sparkles size={24} style={{ color: '#94a3b8' }} />, value: String(loyaltyData?.points || 0), label: 'Loyalty Points' },
            ].map(({ icon, value, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {icon}
                </div>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: '#111', margin: 0, lineHeight: 1 }}>{value}</p>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', marginTop: '4px' }}>{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ marginTop: '40px', borderTop: '1px solid #E2E4F0', padding: '40px 0', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#64748b' }}>© 2025 GlamBook. All rights reserved.</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;