// Frontend/src/pages/Vendor/VendorDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Bell,
  Calendar, BookOpen,
  Clock, MoreHorizontal, ArrowRight, DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import vendorBookingService from '../../services/api/vendorBookingService';
import courseService from '../../services/api/courseService';
import VendorSidebar from '../../components/Vendor/VendorSidebar';

const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    pendingApprovals: 0,
    activeStudents: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [todayBookings, setTodayBookings] = useState<any[]>([]);
  const [myCourses, setMyCourses] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [bookingStatsRes, bookingsRes, coursesRes] = await Promise.all([
        vendorBookingService.getBookingStats(),
        vendorBookingService.getVendorBookings({}),
        courseService.getMyCourses(),
      ]);

      const bookings: any[] = bookingsRes.data || [];
      const courses: any[] = coursesRes.data || [];
      const bStats = bookingStatsRes.data || {};

      // Today's date string
      const todayStr = new Date().toISOString().split('T')[0];

      // Today's bookings for Schedule section
      const todayBks = bookings.filter((b: any) => {
        const bDate = b.bookingDate ? b.bookingDate.split('T')[0] : '';
        return bDate === todayStr;
      });

      // Today's earnings = completed bookings today
      const todayEarnings = bookings
        .filter((b: any) => {
          const bDate = b.bookingDate ? b.bookingDate.split('T')[0] : '';
          return bDate === todayStr && b.status === 'completed';
        })
        .reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0);

      setStats({
        todayEarnings,
        pendingApprovals: bStats.pending || 0,
        activeStudents: courses.reduce((sum: number, c: any) => sum + (c.enrollmentCount || 0), 0),
      });

      setRecentBookings(bookings.slice(0, 5));
      setTodayBookings(todayBks.slice(0, 3));
      setMyCourses(courses);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fc',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e2e4f0',
          borderTopColor: '#5B62B3',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafafa', fontFamily: 'Montserrat, sans-serif' }}>
      <VendorSidebar />

      <div style={{ marginLeft: '280px', flex: 1 }}>
        {/* ── Top Bar ── */}
        <header style={{
          height: '72px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          {/* Left: brand or page title */}
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#5B62B3', letterSpacing: '-0.03em' }}>
            Dashboard
          </span>

          {/* Right: bell + avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

            <div style={{ width: '1px', height: '28px', backgroundColor: '#e2e8f0' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#111' }}>
                  {user?.name || 'Vendor'}
                </p>
                <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500, margin: '2px 0 0' }}>
                  Vendor
                </p>
              </div>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg,#5B62B3,#8C92E6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: 700,
              }}>
                {(user?.name?.[0] || 'V').toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* ── Dashboard Body ── */}
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Welcome */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#111', margin: 0 }}>
                Good morning, {user?.name?.split(' ')[0] || 'Vendor'}
              </h2>
              <p style={{ color: '#64748b', marginTop: '4px', fontWeight: 500, margin: '4px 0 0' }}>
                Here's what's happening with your business today.
              </p>
            </div>
            <button
              onClick={() => navigate('/vendor/create-service')}
              style={{
                backgroundColor: '#5B62B3',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              <Plus size={18} />
              New Service
            </button>
          </div>

          {/* Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' }}>
            {/* Today's Earnings */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', boxShadow: '0 4px 20px -2px rgba(91,98,179,0.08)', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ padding: '12px', backgroundColor: '#ecfdf5', color: '#10b981', borderRadius: '12px' }}>
                  <DollarSign size={24} />
                </div>
                <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 500 }}>Today</span>
              </div>
              <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                Today's Earnings
              </p>
              <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', margin: '4px 0 0' }}>
                Rs. {stats.todayEarnings.toLocaleString()}
              </h3>
            </div>

            {/* Pending Approvals */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', boxShadow: '0 4px 20px -2px rgba(91,98,179,0.08)', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ padding: '12px', backgroundColor: '#fef3c7', color: '#f59e0b', borderRadius: '12px' }}>
                  <Clock size={24} />
                </div>
                <span style={{ color: stats.pendingApprovals > 0 ? '#f59e0b' : '#94a3b8', fontSize: '12px', fontWeight: 500 }}>
                  {stats.pendingApprovals > 0 ? 'Attention needed' : 'All clear'}
                </span>
              </div>
              <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                Pending Approvals
              </p>
              <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 0' }}>
                {stats.pendingApprovals}
              </h3>
            </div>

            {/* Active Students */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '24px', boxShadow: '0 4px 20px -2px rgba(91,98,179,0.08)', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ padding: '12px', backgroundColor: 'rgba(91,98,179,0.1)', color: '#5B62B3', borderRadius: '12px' }}>
                  <BookOpen size={24} />
                </div>
                <span style={{ color: '#5B62B3', fontSize: '12px', fontWeight: 700, backgroundColor: 'rgba(91,98,179,0.1)', padding: '4px 8px', borderRadius: '8px' }}>
                  Enrolled
                </span>
              </div>
              <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                Active Students
              </p>
              <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 0' }}>
                {stats.activeStudents}
              </h3>
            </div>
          </div>

          {/* Schedule at a Glance — real today bookings */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} style={{ color: '#5B62B3' }} />
              Today's Schedule
            </h3>

            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
              {todayBookings.length === 0 ? (
                <div style={{
                  minWidth: '280px',
                  backgroundColor: 'white',
                  padding: '32px 20px',
                  borderRadius: '24px',
                  border: '1px dashed #e2e8f0',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '14px',
                  fontWeight: 500,
                }}>
                  No bookings scheduled for today
                </div>
              ) : todayBookings.map((booking: any) => (
                <div key={booking._id} style={{
                  minWidth: '280px',
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '24px',
                  borderLeft: `4px solid ${booking.status === 'confirmed' ? '#5B62B3' : booking.status === 'completed' ? '#10b981' : '#e2e8f0'}`,
                  boxShadow: '0 4px 20px -2px rgba(91,98,179,0.08)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#5B62B3',
                      backgroundColor: 'rgba(91,98,179,0.1)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}>
                      {booking.bookingTime || '—'}
                    </span>
                    <MoreHorizontal size={18} style={{ color: '#cbd5e1' }} />
                  </div>
                  <h4 style={{ fontWeight: 700, fontSize: '14px', margin: 0 }}>
                    {booking.serviceId?.title || 'Service'}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    {booking.clientName}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg,#5B62B3,#8C92E6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 700 }}>
                      {booking.clientName?.[0] || 'C'}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 500, color: '#94a3b8' }}>
                      Rs. {booking.totalPrice?.toLocaleString()} · {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Bookings + Academy Progress */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>

            {/* Latest Bookings Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 4px 20px -2px rgba(91,98,179,0.08)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontWeight: 700, margin: 0 }}>Latest Bookings</h3>
                <button
                  onClick={() => navigate('/vendor/bookings')}
                  style={{ color: '#5B62B3', fontSize: '12px', fontWeight: 700, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}
                >
                  View All
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr>
                      {['Customer', 'Service', 'Amount', 'Status'].map(h => (
                        <th key={h} style={{ padding: '16px 24px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', fontFamily: 'Montserrat, sans-serif' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontFamily: 'Montserrat, sans-serif' }}>No bookings yet</td></tr>
                    ) : recentBookings.map((booking: any) => (
                      <tr key={booking._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#5B62B3,#8C92E6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'white' }}>
                              {booking.clientName?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: 700, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>{booking.clientName}</p>
                              <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0, fontFamily: 'Montserrat, sans-serif' }}>{booking.clientEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 500, fontFamily: 'Montserrat, sans-serif' }}>
                          {booking.serviceId?.title || 'Service'}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
                          Rs. {booking.totalPrice?.toLocaleString()}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '9999px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif',
                            backgroundColor: booking.status === 'completed' ? '#ecfdf5' : booking.status === 'confirmed' ? '#eff6ff' : booking.status === 'cancelled' ? '#fef2f2' : '#fffbeb',
                            color: booking.status === 'completed' ? '#10b981' : booking.status === 'confirmed' ? '#3b82f6' : booking.status === 'cancelled' ? '#ef4444' : '#f59e0b',
                          }}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Academy Progress */}
            <div style={{ backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 4px 20px -2px rgba(91,98,179,0.08)', border: '1px solid #f1f5f9', padding: '24px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 24px' }}>
                Academy Progress
                <BookOpen size={20} style={{ color: '#cbd5e1' }} />
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {myCourses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontFamily: 'Montserrat, sans-serif' }}>No courses yet</div>
                ) : myCourses.map((course: any) => {
                  const pct = Math.min((course.enrollmentCount || 0) * 10, 100);
                  return (
                    <div key={course._id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <p style={{ fontSize: '14px', fontWeight: 700, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>{course.title}</p>
                        <span style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8', fontFamily: 'Montserrat, sans-serif' }}>{course.status}</span>
                      </div>
                      <div style={{ width: '100%', backgroundColor: '#f1f5f9', height: '8px', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ backgroundColor: '#5B62B3', height: '100%', width: `${pct}%`, borderRadius: '9999px', transition: 'width 0.6s ease' }} />
                      </div>
                      <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px', fontFamily: 'Montserrat, sans-serif' }}>
                        {course.enrollmentCount || 0} students enrolled
                      </p>
                    </div>
                  );
                })}

                <button
                  onClick={() => navigate('/vendor/my-courses')}
                  style={{
                    marginTop: '8px', width: '100%', border: '1px solid #e2e8f0', color: '#64748b',
                    padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '12px',
                    backgroundColor: 'transparent', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  Manage Curriculum
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default VendorDashboard;