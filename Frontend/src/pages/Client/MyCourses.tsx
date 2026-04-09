// Frontend/src/pages/Client/MyCourses.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Clock, Award, TrendingUp, PlayCircle,
  Calendar, MapPin, Users, CheckCircle 
} from 'lucide-react';
import enrollmentService from '../../services/api/enrollmentService';

interface Enrollment {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    category: string;
    imageUrl: string | null;
    duration: number;
    instructorName: string;
    lessons: any[];
  };
  status: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  batchStartDate: string | null;
  batchLocation: string | null;
  enrollmentDate: string;
  certificateIssued: boolean;
}

const MyCourses: React.FC = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'enrolled' | 'completed'>('all');

  useEffect(() => {
    fetchEnrollments();
  }, [activeTab]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await enrollmentService.getClientEnrollments(
        activeTab === 'all' ? undefined : activeTab
      );
      setEnrollments(response.data || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:5000${imageUrl}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#999';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Calculate stats
  const stats = {
    totalCourses: enrollments.length,
    inProgress: enrollments.filter(e => e.status === 'enrolled').length,
    completed: enrollments.filter(e => e.status === 'completed').length,
    certificates: enrollments.filter(e => e.certificateIssued).length,
  };

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
            My Courses
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#666',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            Continue your learning journey
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '8px',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  My Courses
                </p>
                <p style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#111',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {stats.totalCourses}
                </p>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#E3F2FD',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BookOpen size={24} style={{ color: '#2196F3' }} />
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '8px',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  In Progress
                </p>
                <p style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#111',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {stats.inProgress}
                </p>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#FFF3E0',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp size={24} style={{ color: '#FF9800' }} />
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '8px',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Completed
                </p>
                <p style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#111',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {stats.completed}
                </p>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#E8F5E9',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle size={24} style={{ color: '#4CAF50' }} />
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '8px',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Certificates
                </p>
                <p style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#111',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {stats.certificates}
                </p>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#FCE4EC',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Award size={24} style={{ color: '#E91E63' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '24px',
          marginBottom: '24px',
          borderBottom: '2px solid #eee'
        }}>
          {[
            { key: 'all', label: 'All Courses', count: stats.totalCourses },
            { key: 'enrolled', label: 'In Progress', count: stats.inProgress },
            { key: 'completed', label: 'Completed', count: stats.completed }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                background: 'none',
                border: 'none',
                padding: '16px 0',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                color: activeTab === tab.key ? '#E91E63' : '#666',
                borderBottom: activeTab === tab.key ? '3px solid #E91E63' : 'none',
                marginBottom: '-2px',
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            fontFamily: 'Montserrat, sans-serif',
            color: '#666'
          }}>
            Loading courses...
          </div>
        ) : enrollments.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px'
          }}>
            <BookOpen size={64} style={{ color: '#ddd', marginBottom: '16px' }} />
            <h3 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#999',
              marginBottom: '8px',
              fontFamily: 'Syne, sans-serif'
            }}>
              No courses found
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#999',
              marginBottom: '24px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Enroll in a course to start learning
            </p>
            <button
              onClick={() => navigate('/client/courses')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#E91E63',
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
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {enrollments.map(enrollment => (
              <div
                key={enrollment._id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/client/learning/${enrollment._id}`)}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {/* Image with Status Badge */}
                <div style={{ position: 'relative', height: '200px' }}>
                  <img
                    src={getImageUrl(enrollment.courseId.imageUrl)}
                    alt={enrollment.courseId.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: getStatusColor(enrollment.status),
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {getStatusLabel(enrollment.status)}
                  </div>

                  {/* Progress Overlay */}
                  {enrollment.status === 'enrolled' && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      padding: '12px 16px'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <span style={{
                          fontSize: '12px',
                          color: 'white',
                          fontFamily: 'Montserrat, sans-serif'
                        }}>
                          Progress
                        </span>
                        <span style={{
                          fontSize: '12px',
                          color: 'white',
                          fontWeight: 600,
                          fontFamily: 'Montserrat, sans-serif'
                        }}>
                          {enrollment.progress}%
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '6px',
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${enrollment.progress}%`,
                          height: '100%',
                          backgroundColor: '#4CAF50',
                          transition: 'width 0.3s'
                        }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '20px' }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#E91E63',
                    fontWeight: 600,
                    marginBottom: '8px',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {enrollment.courseId.category}
                  </div>

                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: '#111',
                    fontFamily: 'Syne, sans-serif',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {enrollment.courseId.title}
                  </h3>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '16px'
                  }}>
                    <BookOpen size={14} style={{ color: '#666' }} />
                    <span style={{
                      fontSize: '13px',
                      color: '#666',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      by {enrollment.courseId.instructorName}
                    </span>
                  </div>

                  {/* Stats Row */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid #eee'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <PlayCircle size={16} style={{ color: '#666' }} />
                      <span style={{
                        fontSize: '13px',
                        color: '#666',
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        {enrollment.completedLessons}/{enrollment.totalLessons} lessons
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={16} style={{ color: '#666' }} />
                      <span style={{
                        fontSize: '13px',
                        color: '#666',
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        {enrollment.courseId.duration}h
                      </span>
                    </div>
                  </div>

                  {/* Batch Info */}
                  {enrollment.batchStartDate && enrollment.batchLocation && (
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      backgroundColor: '#F5F5F5',
                      borderRadius: '8px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '6px'
                      }}>
                        <Calendar size={14} style={{ color: '#666' }} />
                        <span style={{
                          fontSize: '12px',
                          color: '#666',
                          fontFamily: 'Montserrat, sans-serif'
                        }}>
                          Starts: {new Date(enrollment.batchStartDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <MapPin size={14} style={{ color: '#666' }} />
                        <span style={{
                          fontSize: '12px',
                          color: '#666',
                          fontFamily: 'Montserrat, sans-serif'
                        }}>
                          {enrollment.batchLocation}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Certificate Badge */}
                  {enrollment.certificateIssued && (
                    <div style={{
                      marginTop: '12px',
                      padding: '8px 12px',
                      backgroundColor: '#E8F5E9',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Award size={16} style={{ color: '#4CAF50' }} />
                      <span style={{
                        fontSize: '12px',
                        color: '#2E7D32',
                        fontWeight: 600,
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        Certificate Issued
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;