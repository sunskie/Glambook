import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Bell, Calendar, BookOpen, History, Award,
  Star, ChevronRight, Gift, Sparkles
} from 'lucide-react';
import serviceService from '../../services/api/serviceService';
import courseService from '../../services/api/courseService';
import { useAuth } from '../../context/AuthContext';
import type { Service } from '../../types';

interface Course {
  _id: string;
  title: string;
  price: number;
  imageUrl: string | null;
}

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [services, setServices] = useState<Service[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [servicesRes, coursesRes] = await Promise.all([
        serviceService.getAllServices({ status: 'active' }, 1),
        courseService.getAllCourses()
      ]);
      
      const servicesData = Array.isArray(servicesRes.data) ? servicesRes.data.slice(0, 3) : [];
      const coursesData = Array.isArray(coursesRes.data) ? coursesRes.data.slice(0, 3) : [];
      
      setServices(servicesData);
      setCourses(coursesData);
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
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8F9FA'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #E2E4F0',
          borderTopColor: '#5B62B3',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
        borderBottom: '1px solid #E2E4F0',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        padding: '12px 48px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                backgroundColor: '#5B62B3',
                color: 'white'
              }}>
                <Sparkles size={24} />
              </div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#111111',
                fontFamily: 'Syne, sans-serif',
                margin: 0
              }}>
                GlamBook
              </h2>
            </div>

            {/* Search Bar */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={20} style={{
                position: 'absolute',
                left: '12px',
                color: '#94a3b8'
              }} />
              <input
                type="text"
                placeholder="Search services, courses..."
                style={{
                  width: '256px',
                  height: '40px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#f1f5f9',
                  paddingLeft: '40px',
                  paddingRight: '16px',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'Montserrat, sans-serif'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Notifications */}
            <button style={{
              position: 'relative',
              borderRadius: '50%',
              padding: '8px',
              color: '#64748b',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}>
              <Bell size={24} />
              <span style={{
                position: 'absolute',
                right: '8px',
                top: '8px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#5B62B3',
                border: '2px solid white'
              }} />
            </button>

            {/* User Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderLeft: '1px solid #E2E4F0',
              paddingLeft: '24px'
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
                  fontWeight: 600,
                  color: '#111111',
                  margin: 0,
                  lineHeight: 1,
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {user?.name || 'Guest'}
                </p>
                <p style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#5B62B3',
                  margin: '4px 0 0 0',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Silver Member
                </p>
              </div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#cbd5e1',
                border: '2px solid rgba(91, 98, 179, 0.2)'
              }} />
            </div>
          </div>
        </div>
      </header>

      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px 48px'
      }}>
        {/* Welcome Section */}
        <section style={{
          position: 'relative',
          marginBottom: '40px',
          overflow: 'hidden',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #5B62B3 0%, #747BCF 50%, #5B62B3 100%)',
          padding: '48px',
          color: 'white',
          boxShadow: '0 20px 60px rgba(91, 98, 179, 0.2)'
        }}>
          <div style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '32px'
          }}>
            <div>
              <h1 style={{
                fontSize: '36px',
                fontWeight: 700,
                fontFamily: 'Syne, sans-serif',
                margin: '0 0 8px 0'
              }}>
                Welcome to GlamBook, {user?.name?.split(' ')[0] || 'Guest'}
              </h1>
              <p style={{
                fontSize: '18px',
                fontWeight: 300,
                color: 'rgba(255, 255, 255, 0.8)',
                margin: '0 0 24px 0',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Your journey to beauty and professional excellence starts here.
              </p>
              
              <div style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(12px)',
                  padding: '6px 16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Member Since Oct 2023
                </div>
                <div style={{
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(12px)',
                  padding: '6px 16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  50 Loyalty Points
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                border: '4px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                marginBottom: '8px'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '4px solid white',
                  borderTopColor: 'transparent',
                  transform: 'rotate(18deg)'
                }} />
                <span style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  5%
                </span>
              </div>
              <p style={{
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'rgba(255, 255, 255, 0.7)',
                margin: 0,
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Next Tier: Gold
              </p>
            </div>
          </div>
        </section>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: '16px',
          marginBottom: '40px'
        }}>
          <button
            onClick={() => navigate('/client/services')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '16px',
              backgroundColor: 'white',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              border: '1px solid #f1f5f9',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Calendar size={32} style={{ color: '#5B62B3', marginBottom: '12px' }} />
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#64748b',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Book Service
            </span>
          </button>

          <button
            onClick={() => navigate('/client/courses')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '16px',
              backgroundColor: 'white',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              border: '1px solid #f1f5f9',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <BookOpen size={32} style={{ color: '#5B62B3', marginBottom: '12px' }} />
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#64748b',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Browse Courses
            </span>
          </button>

          <button
            onClick={() => navigate('/client/bookings')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '16px',
              backgroundColor: 'white',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              border: '1px solid #f1f5f9',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <History size={32} style={{ color: '#5B62B3', marginBottom: '12px' }} />
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#64748b',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              My Bookings
            </span>
          </button>

          <button
            onClick={() => navigate('/client/my-courses')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '16px',
              backgroundColor: 'white',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              border: '1px solid #f1f5f9',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Award size={32} style={{ color: '#5B62B3', marginBottom: '12px' }} />
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#64748b',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Certificates
            </span>
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '32px'
        }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {/* Upcoming Bookings - Empty State */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#111111',
                  margin: 0,
                  fontFamily: 'Syne, sans-serif'
                }}>
                  Upcoming Bookings
                </h3>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '16px',
                backgroundColor: 'white',
                padding: '48px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                border: '2px dashed #e2e8f0'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  backgroundColor: '#f8fafc',
                  marginBottom: '24px'
                }}>
                  <Calendar size={40} style={{ color: '#cbd5e1' }} />
                </div>
                <p style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#111111',
                  marginBottom: '8px',
                  textAlign: 'center',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  No upcoming bookings yet.
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  textAlign: 'center',
                  marginBottom: '32px',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Ready for a makeover? Browse our top-rated services to get started.
                </p>
                <button
                  onClick={() => navigate('/client/services')}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#5B62B3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                >
                  Browse Services
                </button>
              </div>
            </div>

            {/* Active Learning - Empty State */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#111111',
                  margin: 0,
                  fontFamily: 'Syne, sans-serif'
                }}>
                  Active Learning
                </h3>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '16px',
                backgroundColor: 'white',
                padding: '48px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                border: '2px dashed #e2e8f0'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  backgroundColor: '#f8fafc',
                  marginBottom: '24px'
                }}>
                  <BookOpen size={40} style={{ color: '#cbd5e1' }} />
                </div>
                <p style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#111111',
                  marginBottom: '8px',
                  textAlign: 'center',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  You haven't enrolled in any courses yet.
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  textAlign: 'center',
                  marginBottom: '32px',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Master new skills with our professional certification programs.
                </p>
                <button
                  onClick={() => navigate('/client/courses')}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#f1f5f9',
                    color: '#111111',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                >
                  Explore Academy
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Loyalty Card */}
            <div style={{
              borderRadius: '16px',
              backgroundColor: 'white',
              padding: '32px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              border: '1px solid #f1f5f9',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'relative', zIndex: 10 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '32px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(91, 98, 179, 0.1)',
                    color: '#5B62B3'
                  }}>
                    <Sparkles size={24} />
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: '#f1f5f9',
                    color: '#64748b',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    textTransform: 'uppercase',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    Silver Status
                  </span>
                </div>

                <p style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#64748b',
                  margin: '0 0 4px 0',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Current Balance
                </p>
                <h4 style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#111111',
                  margin: '0 0 32px 0',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  50 <span style={{ fontSize: '14px', fontWeight: 500, color: '#94a3b8' }}>pts</span>
                </h4>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '14px',
                    marginBottom: '16px'
                  }}>
                    <span style={{ color: '#64748b', fontFamily: 'Montserrat, sans-serif' }}>Next Reward</span>
                    <span style={{ fontWeight: 700, color: '#94a3b8', fontFamily: 'Montserrat, sans-serif' }}>Rs. 500 Coupon</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '9999px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: '10%',
                      height: '100%',
                      backgroundColor: '#5B62B3',
                      borderRadius: '9999px'
                    }} />
                  </div>
                  <p style={{
                    fontSize: '10px',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textAlign: 'center',
                    marginTop: '16px',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    450 more points to Gold
                  </p>
                </div>

                <button style={{
                  width: '100%',
                  borderRadius: '12px',
                  backgroundColor: '#5B62B3',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(91, 98, 179, 0.3)',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  View My Rewards
                </button>
              </div>

              <div style={{
                position: 'absolute',
                bottom: '-48px',
                right: '-48px',
                width: '128px',
                height: '128px',
                backgroundColor: 'rgba(91, 98, 179, 0.05)',
                borderRadius: '50%'
              }} />
            </div>

            {/* Recommended For You */}
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#111111',
                marginBottom: '24px',
                fontFamily: 'Syne, sans-serif'
              }}>
                Recommended for You
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {services.map((service) => (
                  <div
                    key={service._id}
                    onClick={() => navigate(`/client/book/${service._id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      borderRadius: '12px',
                      backgroundColor: 'white',
                      padding: '12px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                      border: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      width: '64px',
                      height: '64px',
                      flexShrink: 0,
                      borderRadius: '8px',
                      backgroundImage: `url(${getImageUrl(service.imageUrl)})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }} />
                    <div style={{ flex: 1 }}>
                      <h5 style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#111111',
                        margin: '0 0 4px 0',
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        {service.title}
                      </h5>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginBottom: '4px'
                      }}>
                        <Star size={14} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#64748b',
                          fontFamily: 'Montserrat, sans-serif'
                        }}>
                          4.9 (124)
                        </span>
                      </div>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#111111',
                        margin: 0,
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        Rs. {service.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Welcome Bonus */}
            <div style={{
              borderRadius: '16px',
              border: '2px dashed #e2e8f0',
              padding: '24px'
            }}>
              <h3 style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#94a3b8',
                marginBottom: '16px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Your Welcome Bonus
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    flexShrink: 0,
                    borderRadius: '8px',
                    backgroundColor: '#ecfdf5',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Gift size={20} />
                  </div>
                  <div>
                    <p style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#111111',
                      margin: '0 0 2px 0',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      10% Off First Service
                    </p>
                    <p style={{
                      fontSize: '10px',
                      color: '#94a3b8',
                      margin: 0,
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      Valid for 30 days
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    flexShrink: 0,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(91, 98, 179, 0.05)',
                    color: '#5B62B3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <p style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#111111',
                      margin: '0 0 2px 0',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      50 Points Added
                    </p>
                    <p style={{
                      fontSize: '10px',
                      color: '#94a3b8',
                      margin: 0,
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      New Account Bonus
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div style={{
          marginTop: '64px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '32px',
          paddingTop: '40px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={24} style={{ color: '#94a3b8' }} />
            </div>
            <div>
              <p style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#111111',
                margin: 0,
                lineHeight: 1,
                fontFamily: 'Montserrat, sans-serif'
              }}>
                0
              </p>
              <p style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#64748b',
                marginTop: '4px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Active Bookings
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={24} style={{ color: '#94a3b8' }} />
            </div>
            <div>
              <p style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#111111',
                margin: 0,
                lineHeight: 1,
                fontFamily: 'Montserrat, sans-serif'
              }}>
                0
              </p>
              <p style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#64748b',
                marginTop: '4px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Courses Enrolled
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={24} style={{ color: '#94a3b8' }} />
            </div>
            <div>
              <p style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#111111',
                margin: 0,
                lineHeight: 1,
                fontFamily: 'Montserrat, sans-serif'
              }}>
                50
              </p>
              <p style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#64748b',
                marginTop: '4px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Loyalty Points
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid #E2E4F0',
        padding: '40px 24px',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '14px',
          color: '#64748b',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          © 2023 GlamBook Elite. All rights reserved.
        </p>
      </footer>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ClientDashboard;
