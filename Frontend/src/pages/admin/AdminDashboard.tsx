// Frontend/src/pages/Admin/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserCheck, Briefcase, BookOpen, Calendar,
  GraduationCap, TrendingUp, AlertCircle, CheckCircle,
  Clock, DollarSign, Activity
} from 'lucide-react';
import adminService from '../../services/api/adminService';

interface Stats {
  totalUsers: number;
  totalVendors: number;
  totalClients: number;
  totalServices: number;
  totalCourses: number;
  totalBookings: number;
  totalEnrollments: number;
  pendingVendors: number;
  pendingCourses: number;
  activeServices: number;
  completedBookings: number;
}

interface RecentActivity {
  bookings: any[];
  enrollments: any[];
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalVendors: 0,
    totalClients: 0,
    totalServices: 0,
    totalCourses: 0,
    totalBookings: 0,
    totalEnrollments: 0,
    pendingVendors: 0,
    pendingCourses: 0,
    activeServices: 0,
    completedBookings: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity>({
    bookings: [],
    enrollments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats() as any;
      setStats(response.stats);
      setRecentActivity(response.recentActivity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    iconBg,
    iconColor,
    tag,
    tagColor,
    onClick
  }: any) => (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #F0F0F0',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s, transform 0.2s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {tag && (
        <span style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          fontSize: '11px',
          fontWeight: 600,
          color: tagColor || '#888',
          fontFamily: 'Montserrat, sans-serif',
          letterSpacing: '0.3px'
        }}>
          {tag}
        </span>
      )}
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        backgroundColor: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px'
      }}>
        <Icon size={20} color={iconColor} />
      </div>
      <p style={{
        fontSize: '13px',
        color: '#888',
        marginBottom: '6px',
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {title}
      </p>
      <p style={{
        fontSize: '30px',
        fontWeight: 700,
        color: '#1a1a2e',
        fontFamily: 'Montserrat, sans-serif',
        lineHeight: 1
      }}>
        {value}
      </p>
    </div>
  );

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        fontFamily: 'Montserrat, sans-serif',
        color: '#888',
        fontSize: '14px'
      }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1300px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '26px',
          fontWeight: 700,
          color: '#1a1a2e',
          fontFamily: 'Syne, sans-serif',
          marginBottom: '4px'
        }}>
          Dashboard
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#888',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          Monitor and manage the GlamBook platform
        </p>
      </div>

      {/* Main Stat Cards — matches vendor's 3-column top strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          iconBg="#EEF2FF"
          iconColor="#6366F1"
          tag="All time"
          tagColor="#6366F1"
          onClick={() => navigate('/admin/users')}
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingVendors + stats.pendingCourses}
          icon={AlertCircle}
          iconBg="#FFF7ED"
          iconColor="#F97316"
          tag={stats.pendingVendors + stats.pendingCourses > 0 ? 'Attention needed' : 'All clear'}
          tagColor={stats.pendingVendors + stats.pendingCourses > 0 ? '#F97316' : '#22C55E'}
          onClick={() => navigate('/admin/vendors?approved=false')}
        />
        <StatCard
          title="Total Enrollments"
          value={stats.totalEnrollments}
          icon={GraduationCap}
          iconBg="#F0FDF4"
          iconColor="#22C55E"
          tag="Enrolled"
          tagColor="#22C55E"
          onClick={() => navigate('/admin/enrollments')}
        />
      </div>

      {/* Secondary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <StatCard
          title="Total Vendors"
          value={stats.totalVendors}
          icon={Briefcase}
          iconBg="#FDF4FF"
          iconColor="#A855F7"
          onClick={() => navigate('/admin/vendors')}
        />
        <StatCard
          title="Total Services"
          value={stats.totalServices}
          icon={Activity}
          iconBg="#FFF7ED"
          iconColor="#FB923C"
          onClick={() => navigate('/admin/services')}
        />
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          icon={BookOpen}
          iconBg="#FFF1F2"
          iconColor="#F43F5E"
          onClick={() => navigate('/admin/courses')}
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={Calendar}
          iconBg="#EFF6FF"
          iconColor="#3B82F6"
          onClick={() => navigate('/admin/bookings')}
        />
      </div>

      {/* Action Cards — matches vendor's pending approvals style */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* Pending Vendors */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: stats.pendingVendors > 0 ? '1.5px solid #FED7AA' : '1px solid #F0F0F0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <AlertCircle size={18} color="#F97316" />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', fontFamily: 'Montserrat, sans-serif' }}>
                Pending Vendors
              </p>
            </div>
            {stats.pendingVendors > 0 && (
              <span style={{
                fontSize: '11px', color: '#F97316', fontWeight: 600,
                fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.3px'
              }}>Attention needed</span>
            )}
          </div>
          <p style={{
            fontSize: '36px', fontWeight: 700,
            color: stats.pendingVendors > 0 ? '#F97316' : '#22C55E',
            fontFamily: 'Montserrat, sans-serif', marginBottom: '16px'
          }}>
            {stats.pendingVendors}
          </p>
          <button
            onClick={() => navigate('/admin/vendors?approved=false')}
            disabled={stats.pendingVendors === 0}
            style={{
              width: '100%', padding: '10px',
              backgroundColor: stats.pendingVendors > 0 ? '#F97316' : '#F5F5F5',
              color: stats.pendingVendors > 0 ? 'white' : '#aaa',
              border: 'none', borderRadius: '10px',
              fontSize: '13px', fontWeight: 600,
              cursor: stats.pendingVendors > 0 ? 'pointer' : 'not-allowed',
              fontFamily: 'Montserrat, sans-serif',
              transition: 'opacity 0.2s'
            }}
          >
            Review Vendors
          </button>
        </div>

        {/* Pending Courses */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: stats.pendingCourses > 0 ? '1.5px solid #FECDD3' : '1px solid #F0F0F0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                backgroundColor: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <AlertCircle size={18} color="#F43F5E" />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', fontFamily: 'Montserrat, sans-serif' }}>
                Pending Courses
              </p>
            </div>
            {stats.pendingCourses > 0 && (
              <span style={{
                fontSize: '11px', color: '#F43F5E', fontWeight: 600,
                fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.3px'
              }}>Attention needed</span>
            )}
          </div>
          <p style={{
            fontSize: '36px', fontWeight: 700,
            color: stats.pendingCourses > 0 ? '#F43F5E' : '#22C55E',
            fontFamily: 'Montserrat, sans-serif', marginBottom: '16px'
          }}>
            {stats.pendingCourses}
          </p>
          <button
            onClick={() => navigate('/admin/courses?status=pending')}
            disabled={stats.pendingCourses === 0}
            style={{
              width: '100%', padding: '10px',
              backgroundColor: stats.pendingCourses > 0 ? '#F43F5E' : '#F5F5F5',
              color: stats.pendingCourses > 0 ? 'white' : '#aaa',
              border: 'none', borderRadius: '10px',
              fontSize: '13px', fontWeight: 600,
              cursor: stats.pendingCourses > 0 ? 'pointer' : 'not-allowed',
              fontFamily: 'Montserrat, sans-serif',
              transition: 'opacity 0.2s'
            }}
          >
            Review Courses
          </button>
        </div>

        {/* Active Services */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #F0F0F0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <CheckCircle size={18} color="#22C55E" />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', fontFamily: 'Montserrat, sans-serif' }}>
              Active Services
            </p>
          </div>
          <p style={{
            fontSize: '36px', fontWeight: 700, color: '#22C55E',
            fontFamily: 'Montserrat, sans-serif', marginBottom: '16px'
          }}>
            {stats.activeServices}
          </p>
          <button
            onClick={() => navigate('/admin/services?status=active')}
            style={{
              width: '100%', padding: '10px',
              backgroundColor: '#22C55E', color: 'white',
              border: 'none', borderRadius: '10px',
              fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Montserrat, sans-serif'
            }}
          >
            View Services
          </button>
        </div>
      </div>

      {/* Recent Activity — matches vendor's "Latest Bookings" table style */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
      }}>

        {/* Recent Bookings */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          border: '1px solid #F0F0F0',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #F5F5F5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{
              fontSize: '15px', fontWeight: 700,
              color: '#1a1a2e', fontFamily: 'Syne, sans-serif'
            }}>
              Latest Bookings
            </h3>
            <button
              onClick={() => navigate('/admin/bookings')}
              style={{
                fontSize: '13px', color: '#6366F1', fontWeight: 600,
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              View All →
            </button>
          </div>

          {recentActivity.bookings.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#aaa', fontFamily: 'Montserrat, sans-serif', fontSize: '13px' }}>
              No recent bookings
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#FAFAFA' }}>
                  {['Customer', 'Service', 'Date', 'Status'].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left',
                      fontSize: '11px', fontWeight: 600, color: '#aaa',
                      fontFamily: 'Montserrat, sans-serif', textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentActivity.bookings.map((booking: any, i: number) => (
                  <tr key={booking._id} style={{ borderTop: '1px solid #F5F5F5' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '30px', height: '30px', borderRadius: '50%',
                          backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '12px', fontWeight: 700,
                          color: '#6366F1', fontFamily: 'Montserrat, sans-serif', flexShrink: 0
                        }}>
                          {(booking.clientId?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a2e', fontFamily: 'Montserrat, sans-serif' }}>
                          {booking.clientId?.name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#555', fontFamily: 'Montserrat, sans-serif' }}>
                      {booking.serviceId?.title || 'Service'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#888', fontFamily: 'Montserrat, sans-serif' }}>
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 600, padding: '3px 10px',
                        borderRadius: '20px', fontFamily: 'Montserrat, sans-serif',
                        backgroundColor: '#F0FDF4', color: '#22C55E'
                      }}>
                        {booking.status || 'confirmed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Enrollments */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          border: '1px solid #F0F0F0',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #F5F5F5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{
              fontSize: '15px', fontWeight: 700,
              color: '#1a1a2e', fontFamily: 'Syne, sans-serif'
            }}>
              Recent Enrollments
            </h3>
            <button
              onClick={() => navigate('/admin/enrollments')}
              style={{
                fontSize: '13px', color: '#6366F1', fontWeight: 600,
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              View All →
            </button>
          </div>

          {recentActivity.enrollments.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#aaa', fontFamily: 'Montserrat, sans-serif', fontSize: '13px' }}>
              No recent enrollments
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#FAFAFA' }}>
                  {['Student', 'Course', 'Date', 'Status'].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left',
                      fontSize: '11px', fontWeight: 600, color: '#aaa',
                      fontFamily: 'Montserrat, sans-serif', textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentActivity.enrollments.map((enrollment: any) => (
                  <tr key={enrollment._id} style={{ borderTop: '1px solid #F5F5F5' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '30px', height: '30px', borderRadius: '50%',
                          backgroundColor: '#FFF1F2', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '12px', fontWeight: 700,
                          color: '#F43F5E', fontFamily: 'Montserrat, sans-serif', flexShrink: 0
                        }}>
                          {(enrollment.clientId?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a2e', fontFamily: 'Montserrat, sans-serif' }}>
                          {enrollment.clientId?.name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#555', fontFamily: 'Montserrat, sans-serif' }}>
                      {enrollment.courseId?.title || 'Course'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#888', fontFamily: 'Montserrat, sans-serif' }}>
                      {new Date(enrollment.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 600, padding: '3px 10px',
                        borderRadius: '20px', fontFamily: 'Montserrat, sans-serif',
                        backgroundColor: '#F0FDF4', color: '#22C55E'
                      }}>
                        {enrollment.status || 'enrolled'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;