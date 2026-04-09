// Frontend/src/pages/Vendor/VendorDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Bell, MessageCircle, DollarSign, 
  Calendar, Users, Settings, RefreshCw, BookOpen,
  TrendingUp, Clock, MoreHorizontal, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import serviceService from '../../services/api/serviceService';
import vendorBookingService from '../../services/api/vendorBookingService';
import courseService from '../../services/api/courseService';
import showToast from '../../components/common/Toast';

const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    pendingApprovals: 0,
    activeStudents: 0
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
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
      const bookings = bookingsRes.data || [];
      const courses = coursesRes.data || [];
      const bStats = bookingStatsRes.data || {};
      setStats({
        todayEarnings: bookings.filter((b: any) => b.status === 'completed').reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0),
        pendingApprovals: bStats.pending || 0,
        activeStudents: courses.reduce((sum: number, c: any) => sum + (c.enrollmentCount || 0), 0),
      });
      setRecentBookings(bookings.slice(0, 5));
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
        backgroundColor: '#f8f9fc'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e2e4f0',
          borderTopColor: '#5B62B3',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fc',
      fontFamily: 'Montserrat, sans-serif'
    }}>
      {/* Sidebar */}
      <aside style={{
        width: '288px',
        backgroundColor: 'white',
        borderRight: '1px solid #e2e8f0',
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '32px', 
          padding: '24px',
          height: '100%'
        }}>
          {/* Logo */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '0 8px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#5B62B3',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <span style={{ fontSize: '24px' }}>💎</span>
            </div>
            <div>
              <h1 style={{
                color: '#5B62B3',
                fontSize: '20px',
                fontWeight: 700,
                margin: 0,
                lineHeight: 1.2
              }}>
                GlamBook
              </h1>
              <p style={{
                color: '#94a3b8',
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                margin: 0
              }}>
                Vendor Excellence
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '6px',
            flex: 1
          }}>
            <button
              onClick={() => navigate('/vendor/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(91, 98, 179, 0.1)',
                color: '#5B62B3',
                fontWeight: 600,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <TrendingUp size={20} />
              Dashboard
            </button>

            <button
              onClick={() => navigate('/vendor/bookings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: 'transparent',
                color: '#64748b',
                fontWeight: 500,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <Calendar size={20} />
              Bookings
            </button>

            <button
              onClick={() => navigate('/vendor/my-courses')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: 'transparent',
                color: '#64748b',
                fontWeight: 500,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <BookOpen size={20} />
              Academy
            </button>

            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: 'transparent',
                color: '#64748b',
                fontWeight: 500,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <DollarSign size={20} />
              Earnings
            </button>

            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: 'transparent',
                color: '#64748b',
                fontWeight: 500,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <Users size={20} />
              Customers
            </button>

            {/* Bottom section */}
            <div style={{
              marginTop: 'auto',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: 'transparent',
                  color: '#64748b',
                  fontWeight: 500,
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <Settings size={20} />
                Settings
              </button>

              <button
                onClick={() => navigate('/client/dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: 'transparent',
                  color: '#5B62B3',
                  fontWeight: 600,
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <RefreshCw size={20} />
                User View
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        minWidth: 0
      }}>
        {/* Top Bar */}
        <header style={{
          height: '80px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            flex: 1 
          }}>
            <div style={{ position: 'relative', maxWidth: '448px', width: '100%' }}>
              <Search size={20} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }} />
              <input
                type="text"
                placeholder="Search appointments, students, or analytics..."
                style={{
                  width: '100%',
                  backgroundColor: '#f8fafc',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 16px 10px 40px',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'Montserrat, sans-serif'
                }}
              />
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '24px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button style={{
                position: 'relative',
                padding: '8px',
                color: '#64748b',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer'
              }}>
                <Bell size={24} />
                <span style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  border: '2px solid white'
                }} />
              </button>

              <button style={{
                padding: '8px',
                color: '#64748b',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer'
              }}>
                <MessageCircle size={24} />
              </button>
            </div>

            <div style={{
              width: '1px',
              height: '32px',
              backgroundColor: '#e2e8f0'
            }} />

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              paddingLeft: '8px'
            }}>
              <button
                onClick={logout}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#5B62B3',
                  border: '1px solid #5B62B3',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'Montserrat, sans-serif'
                }}
              >
                Logout
              </button>
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: 1,
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {user?.name || 'Vendor'}
                </p>
                <p style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  fontWeight: 500,
                  margin: '4px 0 0 0',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Lead Educator
                </p>
              </div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: '#cbd5e1',
                boxShadow: '0 4px 20px -2px rgba(91, 98, 179, 0.08)'
              }} />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div style={{ 
          padding: '32px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '32px' 
        }}>
          {/* Welcome Section */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-end' 
          }}>
            <div>
              <h2 style={{
                fontSize: '30px',
                fontWeight: 800,
                color: '#111111',
                margin: 0,
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Good morning, {user?.name?.split(' ')[0] || 'Vendor'}
              </h2>
              <p style={{
                color: '#64748b',
                marginTop: '4px',
                fontWeight: 500,
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Your salon and academy performance is up 12% this week.
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
                boxShadow: '0 4px 20px -2px rgba(91, 98, 179, 0.08)',
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              <Plus size={18} />
              New Service
            </button>
          </div>

          {/* Metric Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px'
          }}>
            {/* Today's Earnings */}
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '24px',
              boxShadow: '0 4px 20px -2px rgba(91, 98, 179, 0.08)',
              border: '1px solid #f1f5f9'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#ecfdf5',
                  color: '#10b981',
                  borderRadius: '12px'
                }}>
                  <DollarSign size={24} />
                </div>
                <span style={{
                  color: '#10b981',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: '#ecfdf5',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  +12.4%
                </span>
              </div>
              <p style={{
                color: '#64748b',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: 0,
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Today's Earnings
              </p>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 800,
                marginTop: '4px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Rs. {stats.todayEarnings.toLocaleString()}
              </h3>
            </div>

            {/* Pending Approvals */}
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '24px',
              boxShadow: '0 4px 20px -2px rgba(91, 98, 179, 0.08)',
              border: '1px solid #f1f5f9'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#fef3c7',
                  color: '#f59e0b',
                  borderRadius: '12px'
                }}>
                  <Clock size={24} />
                </div>
                <span style={{
                  color: '#94a3b8',
                  fontSize: '12px',
                  fontWeight: 500,
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Attention needed
                </span>
              </div>
              <p style={{
                color: '#64748b',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: 0,
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Pending Approvals
              </p>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 800,
                marginTop: '4px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                {stats.pendingApprovals}
              </h3>
            </div>

            {/* Active Students */}
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '24px',
              boxShadow: '0 4px 20px -2px rgba(91, 98, 179, 0.08)',
              border: '1px solid #f1f5f9'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <div style={{
                  padding: '12px',
                  backgroundColor: 'rgba(91, 98, 179, 0.1)',
                  color: '#5B62B3',
                  borderRadius: '12px'
                }}>
                  <BookOpen size={24} />
                </div>
                <span style={{
                  color: '#5B62B3',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: 'rgba(91, 98, 179, 0.1)',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  +5%
                </span>
              </div>
              <p style={{
                color: '#64748b',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: 0,
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Active Students
              </p>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 800,
                marginTop: '4px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                {stats.activeStudents}
              </h3>
            </div>
          </div>

          {/* Schedule at a Glance */}
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              <Calendar size={20} style={{ color: '#5B62B3' }} />
              Schedule at a Glance
            </h3>

            <div style={{
              display: 'flex',
              gap: '16px',
              overflowX: 'auto',
              paddingBottom: '16px'
            }}>
              {/* Slot 1 */}
              <div style={{
                minWidth: '280px',
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '24px',
                borderLeft: '4px solid #5B62B3',
                boxShadow: '0 4px 20px -2px rgba(91, 98, 179, 0.08)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#5B62B3',
                    backgroundColor: 'rgba(91, 98, 179, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    09:00 AM
                  </span>
                  <MoreHorizontal size={18} style={{ color: '#cbd5e1' }} />
                </div>
                <h4 style={{
                  fontWeight: 700,
                  fontSize: '14px',
                  margin: 0,
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Bridal Makeup Trial
                </h4>
                <p style={{
                  fontSize: '12px',
                  color: '#64748b',
                  marginTop: '4px',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Priya Sharma • Studio A
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '16px'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#cbd5e1'
                  }} />
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#94a3b8',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    Paid Rs. 1,500 deposit
                  </span>
                </div>
              </div>

              {/* Slot 2 */}
              <div style={{
                minWidth: '280px',
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '24px',
                borderLeft: '4px solid #e2e8f0',
                boxShadow: '0 4px 20px -2px rgba(91, 98, 179, 0.08)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#64748b',
                    backgroundColor: '#f1f5f9',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    11:30 AM
                  </span>
                  <MoreHorizontal size={18} style={{ color: '#cbd5e1' }} />
                </div>
                <h4 style={{
                  fontWeight: 700,
                  fontSize: '14px',
                  margin: 0,
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Advanced Color Theory
                </h4>
                <p style={{
                  fontSize: '12px',
                  color: '#64748b',
                  marginTop: '4px',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Academy Group B • Hall 1
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '16px'
                }}>
                  <div style={{ display: 'flex', marginLeft: '-8px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#cbd5e1',
                      border: '2px solid white',
                      marginLeft: '-8px'
                    }} />
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#cbd5e1',
                      border: '2px solid white',
                      marginLeft: '-8px'
                    }} />
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#cbd5e1',
                      border: '2px solid white',
                      marginLeft: '-8px'
                    }} />
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#94a3b8',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    12 Students joined
                  </span>
                </div>
              </div>

              {/* Slot 3 */}
              <div style={{
                minWidth: '280px',
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '24px',
                borderLeft: '4px solid #5B62B3',
                boxShadow: '0 4px 20px -2px rgba(91, 98, 179, 0.08)',
                opacity: 0.75
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#64748b',
                    backgroundColor: '#f1f5f9',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    02:00 PM
                  </span>
                  <MoreHorizontal size={18} style={{ color: '#cbd5e1' }} />
                </div>
                <h4 style={{
                  fontWeight: 700,
                  fontSize: '14px',
                  margin: 0,
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Dermalogica Facial
                </h4>
                <p style={{
                  fontSize: '12px',
                  color: '#64748b',
                  marginTop: '4px',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Ananya Iyer • Treatment Room 2
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '16px'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#cbd5e1'
                  }} />
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#94a3b8',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    Awaiting confirmation
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Bookings & Academy Progress */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '32px'
          }}>
            {/* Latest Bookings Table */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              boxShadow: '0 4px 20px -2px rgba(91, 98, 179, 0.08)',
              border: '1px solid #f1f5f9',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                padding: '24px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{
                  fontWeight: 700,
                  margin: 0,
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Latest Bookings
                </h3>
                <button style={{
                  color: '#5B62B3',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  View All
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  textAlign: 'left',
                  borderCollapse: 'collapse'
                }}>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr>
                      <th style={{
                        padding: '16px 24px',
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#94a3b8',
                        letterSpacing: '0.05em',
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        Customer
                      </th>
                      <th style={{
                        padding: '16px 24px',
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#94a3b8',
                        letterSpacing: '0.05em',
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        Service
                      </th>
                      <th style={{
                        padding: '16px 24px',
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#94a3b8',
                        letterSpacing: '0.05em',
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        Amount
                      </th>
                      <th style={{
                        padding: '16px 24px',
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#94a3b8',
                        letterSpacing: '0.05em',
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody style={{ 
                    borderTop: '1px solid #f1f5f9'
                  }}>
                    {recentBookings.length === 0 ? (
                      <tr><td colSpan={4} style={{padding:'32px', textAlign:'center', color:'#94a3b8', fontFamily:'Montserrat, sans-serif'}}>No bookings yet</td></tr>
                    ) : recentBookings.map((booking: any) => (
                      <tr key={booking._id} style={{borderBottom:'1px solid #f1f5f9'}}>
                        <td style={{padding:'16px 24px'}}>
                          <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                            <div style={{width:'32px', height:'32px', borderRadius:'8px', backgroundColor:'#5B62B3', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, color:'white'}}>
                              {booking.clientName?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <p style={{fontSize:'14px', fontWeight:700, margin:0, fontFamily:'Montserrat, sans-serif'}}>{booking.clientName}</p>
                              <p style={{fontSize:'10px', color:'#94a3b8', margin:0, fontFamily:'Montserrat, sans-serif'}}>{booking.clientEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{padding:'16px 24px', fontSize:'14px', fontWeight:500, fontFamily:'Montserrat, sans-serif'}}>{booking.serviceId?.title || 'Service'}</td>
                        <td style={{padding:'16px 24px', fontSize:'14px', fontWeight:700, fontFamily:'Montserrat, sans-serif'}}>Rs. {booking.totalPrice?.toLocaleString()}</td>
                        <td style={{padding:'16px 24px'}}>
                          <span style={{padding:'4px 10px', borderRadius:'9999px', fontSize:'10px', fontWeight:700, textTransform:'uppercase', fontFamily:'Montserrat, sans-serif',
                            backgroundColor: booking.status==='completed'?'#ecfdf5':booking.status==='confirmed'?'#eff6ff':booking.status==='cancelled'?'#fef2f2':'#fffbeb',
                            color: booking.status==='completed'?'#10b981':booking.status==='confirmed'?'#3b82f6':booking.status==='cancelled'?'#ef4444':'#f59e0b'}}>
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
            <div style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              boxShadow: '0 4px 20px -2px rgba(91, 98, 179, 0.08)',
              border: '1px solid #f1f5f9',
              padding: '24px'
            }}>
              <h3 style={{
                fontWeight: 700,
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Academy Progress
                <BookOpen size={20} style={{ color: '#cbd5e1' }} />
              </h3>

              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '24px' 
              }}>
                {myCourses.length === 0 ? (
                  <div style={{textAlign:'center', padding:'32px', color:'#94a3b8', fontFamily:'Montserrat, sans-serif'}}>No courses yet</div>
                ) : myCourses.map((course: any) => (
                  <div key={course._id}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}}>
                      <p style={{fontSize:'14px', fontWeight:700, margin:0, fontFamily:'Montserrat, sans-serif'}}>{course.title}</p>
                      <span style={{fontSize:'12px', fontWeight:500, color:'#94a3b8', fontFamily:'Montserrat, sans-serif'}}>{course.status}</span>
                    </div>
                    <div style={{width:'100%', backgroundColor:'#f1f5f9', height:'8px', borderRadius:'9999px', overflow:'hidden'}}>
                      <div style={{backgroundColor:'#5B62B3', height:'100%', width:`${Math.min((course.enrollmentCount||0)*10,100)}%`, borderRadius:'9999px'}} />
                    </div>
                    <p style={{fontSize:'10px', color:'#94a3b8', marginTop:'8px', fontFamily:'Montserrat, sans-serif'}}>{course.enrollmentCount||0} students enrolled</p>
                  </div>
                ))}

                <button
                  onClick={() => navigate('/vendor/my-courses')}
                  style={{
                    marginTop: '16px',
                    width: '100%',
                    border: '1px solid #e2e8f0',
                    color: '#64748b',
                    padding: '12px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '12px',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                >
                  Manage Curriculum
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default VendorDashboard;

