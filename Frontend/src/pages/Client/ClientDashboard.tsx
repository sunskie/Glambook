import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, BookOpen, History, Award,
  Star, Gift, Sparkles
} from 'lucide-react';
import serviceService from '../../services/api/serviceService';
import courseService from '../../services/api/courseService';
import { loyaltyService } from '../../services/api/loyaltyService';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import type { Service } from '../../types';
import ClientSidebar from '../../components/Client/ClientSidebar';

interface Course {
  _id: string;
  title: string;
  price: number;
  imageUrl: string | null;
}

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [loyaltyData, setLoyaltyData] = useState<any>(null);
  const [dashboardRecs, setDashboardRecs] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

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

  const getImageUrl = (imageUrl?: string | null) => {
    if (!imageUrl) return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:5000${imageUrl}`;
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
            position: 'relative',
            marginBottom: '40px',
            overflow: 'hidden',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #5B62B3 0%, #747BCF 50%, #5B62B3 100%)',
            padding: '48px',
            color: 'white',
            boxShadow: '0 20px 60px rgba(91, 98, 179, 0.2)'
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
                  <div style={{ borderRadius: '9999px', backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(12px)', padding: '6px 16px', fontSize: '14px', fontWeight: 500, border: '1px solid rgba(255, 255, 255, 0.3)' }}>
                    Member Since Oct 2023
                  </div>
                  <div style={{ borderRadius: '9999px', backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(12px)', padding: '6px 16px', fontSize: '14px', fontWeight: 500, border: '1px solid rgba(255, 255, 255, 0.3)' }}>
                    {loyaltyData?.points || 0} Loyalty Points
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '96px', height: '96px', borderRadius: '50%', border: '4px solid rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 700 }}>5%</span>
                </div>
                <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
                  Next Tier: Gold
                </p>
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', backgroundColor: 'white', padding: '48px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '2px dashed #e2e8f0' }}>
                  <Calendar size={40} style={{ color: '#cbd5e1', marginBottom: '24px' }} />
                  <p style={{ fontSize: '18px', fontWeight: 600, color: '#111', marginBottom: '8px', textAlign: 'center' }}>No upcoming bookings yet.</p>
                  <p style={{ fontSize: '14px', color: '#64748b', textAlign: 'center', marginBottom: '32px' }}>Ready for a makeover? Browse our top-rated services to get started.</p>
                  <button onClick={() => navigate('/client/browse/services')} style={{ padding: '10px 24px', backgroundColor: '#5B62B3', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                    Browse Services
                  </button>
                </div>
              </div>

              {/* Active Learning */}
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111', margin: '0 0 24px 0', fontFamily: 'Syne, sans-serif' }}>
                  Active Learning
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', backgroundColor: 'white', padding: '48px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '2px dashed #e2e8f0' }}>
                  <BookOpen size={40} style={{ color: '#cbd5e1', marginBottom: '24px' }} />
                  <p style={{ fontSize: '18px', fontWeight: 600, color: '#111', marginBottom: '8px', textAlign: 'center' }}>You haven't enrolled in any courses yet.</p>
                  <p style={{ fontSize: '14px', color: '#64748b', textAlign: 'center', marginBottom: '32px' }}>Master new skills with our professional certification programs.</p>
                  <button onClick={() => navigate('/client/browse/courses')} style={{ padding: '10px 24px', backgroundColor: '#f1f5f9', color: '#111', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                    Explore Academy
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

              {/* Loyalty Card */}
              <div style={{ borderRadius: '16px', backgroundColor: 'white', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                  <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', backgroundColor: 'rgba(91,98,179,0.1)', color: '#5B62B3' }}>
                    <Sparkles size={24} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#64748b', padding: '4px 12px', borderRadius: '9999px', textTransform: 'uppercase' }}>
                    {loyaltyData?.tier || 'Bronze'} Status
                  </span>
                </div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', margin: '0 0 4px 0' }}>Current Balance</p>
                <h4 style={{ fontSize: '32px', fontWeight: 700, color: '#111', margin: '0 0 32px 0' }}>
                  {loyaltyData?.points || 0} <span style={{ fontSize: '14px', fontWeight: 500, color: '#94a3b8' }}>pts</span>
                </h4>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', marginBottom: '16px' }}>
                    <span style={{ color: '#64748b' }}>Next Reward</span>
                    <span style={{ fontWeight: 700, color: '#94a3b8' }}>Rs. 500 Coupon</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${((loyaltyData?.points || 0) / 500) * 100}%`, height: '100%', backgroundColor: '#5B62B3', borderRadius: '9999px' }} />
                  </div>
                  <p style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em', textAlign: 'center', marginTop: '16px' }}>
                    {loyaltyData?.pointsToNextTier || 0} more points to Gold
                  </p>
                </div>
                <button style={{ width: '100%', borderRadius: '12px', backgroundColor: '#5B62B3', padding: '12px', fontSize: '14px', fontWeight: 700, color: 'white', border: 'none', cursor: 'pointer' }}>
                  View My Rewards
                </button>
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
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '10px', borderRadius: '10px',
                          border: '1px solid #F3F4F6', marginBottom: '8px',
                          cursor: 'pointer', backgroundColor: 'white',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#F9FAFB'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'white'}
                      >
                        <div style={{ width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#EEF2FF', position: 'relative' as const }}>
                          {(() => {
                            const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
                            const rawSrc = service.imageUrl || service.images?.[0] || '';
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
                          <p style={{
                            margin: 0, fontSize: '13px', fontWeight: 600, color: '#111',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            fontFamily: 'Montserrat, sans-serif'
                          }}>
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
              { icon: <Calendar size={24} style={{ color: '#94a3b8' }} />, value: '0', label: 'Active Bookings' },
              { icon: <BookOpen size={24} style={{ color: '#94a3b8' }} />, value: '0', label: 'Courses Enrolled' },
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
            <p style={{ fontSize: '14px', color: '#64748b' }}>© 2023 GlamBook Elite. All rights reserved.</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;