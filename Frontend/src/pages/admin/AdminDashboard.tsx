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
    color, 
    bgColor,
    onClick 
  }: any) => (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <p style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '8px',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            {title}
          </p>
          <p style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#111',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            {value}
          </p>
        </div>
        <div style={{
          width: '48px',
          height: '48px',
          backgroundColor: bgColor,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'Montserrat, sans-serif'
      }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA', padding: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            marginBottom: '8px',
            fontFamily: 'Syne, sans-serif'
          }}>
            Admin Dashboard
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#666',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            Monitor and manage the GlamBook platform
          </p>
        </div>

        {/* Main Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="#2196F3"
            bgColor="#E3F2FD"
            onClick={() => navigate('/admin/users')}
          />
          <StatCard
            title="Total Vendors"
            value={stats.totalVendors}
            icon={Briefcase}
            color="#9C27B0"
            bgColor="#F3E5F5"
            onClick={() => navigate('/admin/vendors')}
          />
          <StatCard
            title="Total Services"
            value={stats.totalServices}
            icon={Briefcase}
            color="#FF9800"
            bgColor="#FFF3E0"
            onClick={() => navigate('/admin/services')}
          />
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={BookOpen}
            color="#E91E63"
            bgColor="#FCE4EC"
            onClick={() => navigate('/admin/courses')}
          />
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={Calendar}
            color="#00BCD4"
            bgColor="#E0F7FA"
            onClick={() => navigate('/admin/bookings')}
          />
          <StatCard
            title="Total Enrollments"
            value={stats.totalEnrollments}
            icon={GraduationCap}
            color="#4CAF50"
            bgColor="#E8F5E9"
            onClick={() => navigate('/admin/enrollments')}
          />
        </div>

        {/* Action Required Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: stats.pendingVendors > 0 ? '2px solid #FF9800' : '1px solid #eee'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <AlertCircle size={24} style={{ color: '#FF9800' }} />
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                fontFamily: 'Syne, sans-serif'
              }}>
                Pending Vendor Approvals
              </h3>
            </div>
            <div style={{
              fontSize: '36px',
              fontWeight: 700,
              color: stats.pendingVendors > 0 ? '#FF9800' : '#4CAF50',
              marginBottom: '12px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              {stats.pendingVendors}
            </div>
            <button
              onClick={() => navigate('/admin/vendors?approved=false')}
              disabled={stats.pendingVendors === 0}
              style={{
                padding: '10px 20px',
                backgroundColor: stats.pendingVendors > 0 ? '#FF9800' : '#E0E0E0',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: stats.pendingVendors > 0 ? 'pointer' : 'not-allowed',
                fontFamily: 'Montserrat, sans-serif',
                width: '100%'
              }}
            >
              Review Vendors
            </button>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: stats.pendingCourses > 0 ? '2px solid #E91E63' : '1px solid #eee'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <AlertCircle size={24} style={{ color: '#E91E63' }} />
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                fontFamily: 'Syne, sans-serif'
              }}>
                Pending Course Approvals
              </h3>
            </div>
            <div style={{
              fontSize: '36px',
              fontWeight: 700,
              color: stats.pendingCourses > 0 ? '#E91E63' : '#4CAF50',
              marginBottom: '12px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              {stats.pendingCourses}
            </div>
            <button
              onClick={() => navigate('/admin/courses?status=pending')}
              disabled={stats.pendingCourses === 0}
              style={{
                padding: '10px 20px',
                backgroundColor: stats.pendingCourses > 0 ? '#E91E63' : '#E0E0E0',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: stats.pendingCourses > 0 ? 'pointer' : 'not-allowed',
                fontFamily: 'Montserrat, sans-serif',
                width: '100%'
              }}
            >
              Review Courses
            </button>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <CheckCircle size={24} style={{ color: '#4CAF50' }} />
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                fontFamily: 'Syne, sans-serif'
              }}>
                Active Services
              </h3>
            </div>
            <div style={{
              fontSize: '36px',
              fontWeight: 700,
              color: '#4CAF50',
              marginBottom: '12px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              {stats.activeServices}
            </div>
            <button
              onClick={() => navigate('/admin/services?status=active')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif',
                width: '100%'
              }}
            >
              View Services
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px'
        }}>
          {/* Recent Bookings */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 600,
                fontFamily: 'Syne, sans-serif'
              }}>
                Recent Bookings
              </h3>
              <Calendar size={20} style={{ color: '#666' }} />
            </div>

            {recentActivity.bookings.length === 0 ? (
              <p style={{
                textAlign: 'center',
                color: '#999',
                padding: '40px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                No recent bookings
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentActivity.bookings.map((booking: any) => (
                  <div
                    key={booking._id}
                    style={{
                      padding: '16px',
                      backgroundColor: '#F5F5F5',
                      borderRadius: '8px',
                      borderLeft: '4px solid #2196F3'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        {booking.clientId?.name || 'Unknown Client'}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        color: '#666',
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#666',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      {booking.serviceId?.title || 'Service'} • {booking.vendorId?.name || 'Vendor'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Enrollments */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 600,
                fontFamily: 'Syne, sans-serif'
              }}>
                Recent Enrollments
              </h3>
              <GraduationCap size={20} style={{ color: '#666' }} />
            </div>

            {recentActivity.enrollments.length === 0 ? (
              <p style={{
                textAlign: 'center',
                color: '#999',
                padding: '40px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                No recent enrollments
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentActivity.enrollments.map((enrollment: any) => (
                  <div
                    key={enrollment._id}
                    style={{
                      padding: '16px',
                      backgroundColor: '#F5F5F5',
                      borderRadius: '8px',
                      borderLeft: '4px solid #E91E63'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        {enrollment.clientId?.name || 'Unknown Client'}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        color: '#666',
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        {new Date(enrollment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#666',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      {enrollment.courseId?.title || 'Course'} • {enrollment.vendorId?.name || 'Vendor'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;