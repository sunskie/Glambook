// Frontend/src/pages/Vendor/VendorCourseDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Plus, Users, TrendingUp, DollarSign, 
  Edit, Trash2, Eye, Clock, Award, CheckCircle 
} from 'lucide-react';
import courseService from '../../services/api/courseService';
import enrollmentService from '../../services/api/enrollmentService';
import VendorSidebar from '../../components/Vendor/VendorSidebar';

interface Course {
  _id: string;
  title: string;
  category: string;
  price: number;
  discountPrice: number | null;
  duration: number;
  imageUrl: string | null;
  status: string;
  enrollmentCount: number;
  rating: number;
  lessons: any[];
  batches: any[];
}

interface Stats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  activeCourses: number;
}

const VendorCourseDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    activeCourses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getMyCourses();
      const coursesData = response.data || [];
      setCourses(coursesData);
      
      // Calculate stats
      const totalStudents = coursesData.reduce((sum: number, c: Course) => sum + c.enrollmentCount, 0);
      const totalRevenue = coursesData.reduce((sum: number, c: Course) => {
        const price = c.discountPrice || c.price;
        return sum + (price * c.enrollmentCount);
      }, 0);
      const activeCourses = coursesData.filter((c: Course) => c.status === 'active' || c.status === 'approved').length;
      
      setStats({
        totalCourses: coursesData.length,
        totalStudents,
        totalRevenue,
        activeCourses
      });
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      await courseService.deleteCourse(courseId);
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:5000${imageUrl}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'Montserrat, sans-serif'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafafa', fontFamily: 'Montserrat, sans-serif' }}>
      <VendorSidebar />
      <div style={{ marginLeft: '280px', flex: 1, padding: '32px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div>
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
              Manage your courses, students, and content
            </p>
          </div>
          
          <button
            onClick={() => navigate('/vendor/courses/create')}
            style={{
              padding: '14px 28px',
              backgroundColor: '#E91E63',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'Montserrat, sans-serif',
              boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)'
            }}
          >
            <Plus size={20} />
            Create New Course
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
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
                  Total Courses
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
                  Total Students
                </p>
                <p style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#111',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {stats.totalStudents}
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
                <Users size={24} style={{ color: '#E91E63' }} />
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
                  Total Revenue
                </p>
                <p style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#111',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  ${stats.totalRevenue.toLocaleString()}
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
                <DollarSign size={24} style={{ color: '#4CAF50' }} />
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
                  Active Courses
                </p>
                <p style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#111',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {stats.activeCourses}
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
        </div>

        {/* Courses List */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: '24px',
            fontFamily: 'Syne, sans-serif'
          }}>
            Your Courses
          </h2>

          {courses.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px'
            }}>
              <BookOpen size={64} style={{ color: '#ddd', margin: '0 auto 16px' }} />
              <h3 style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#999',
                marginBottom: '8px',
                fontFamily: 'Syne, sans-serif'
              }}>
                No courses yet
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#999',
                marginBottom: '24px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Create your first course to start teaching
              </p>
              <button
                onClick={() => navigate('/vendor/courses/create')}
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
                Create Course
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              {courses.map(course => (
                <div
                  key={course._id}
                  style={{
                    border: '1px solid #eee',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  {/* Image */}
                  <div style={{ position: 'relative', height: '160px' }}>
                    <img
                      src={getImageUrl(course.imageUrl)}
                      alt={course.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px'
                    }}>
                      <span className={getStatusColor(course.status)} style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        {getStatusLabel(course.status)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '16px' }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#E91E63',
                      fontWeight: 600,
                      marginBottom: '8px',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      {course.category}
                    </div>

                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      marginBottom: '12px',
                      fontFamily: 'Syne, sans-serif',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {course.title}
                    </h3>

                    {/* Stats */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '12px',
                      marginBottom: '16px',
                      paddingBottom: '16px',
                      borderBottom: '1px solid #eee'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: 700,
                          color: '#2196F3',
                          fontFamily: 'Montserrat, sans-serif'
                        }}>
                          {course.enrollmentCount}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: '#666',
                          fontFamily: 'Montserrat, sans-serif'
                        }}>
                          Students
                        </div>
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: 700,
                          color: '#FF9800',
                          fontFamily: 'Montserrat, sans-serif'
                        }}>
                          {course.lessons?.length || 0}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: '#666',
                          fontFamily: 'Montserrat, sans-serif'
                        }}>
                          Lessons
                        </div>
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: 700,
                          color: '#4CAF50',
                          fontFamily: 'Montserrat, sans-serif'
                        }}>
                          ${course.discountPrice || course.price}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: '#666',
                          fontFamily: 'Montserrat, sans-serif'
                        }}>
                          Price
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '8px'
                    }}>
                      <button
                        onClick={() => navigate(`/vendor/courses/${course._id}/students`)}
                        style={{
                          padding: '8px',
                          backgroundColor: '#E3F2FD',
                          color: '#2196F3',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          fontFamily: 'Montserrat, sans-serif'
                        }}
                        title="View Students"
                      >
                        <Users size={14} />
                        Students
                      </button>

                      <button
                        onClick={() => navigate(`/vendor/courses/${course._id}/edit`)}
                        style={{
                          padding: '8px',
                          backgroundColor: '#FFF3E0',
                          color: '#FF9800',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          fontFamily: 'Montserrat, sans-serif'
                        }}
                        title="Edit Course"
                      >
                        <Edit size={14} />
                        Edit
                      </button>

                      <button
                        onClick={() => navigate(`/vendor/quiz/create?courseId=${course._id}`)}
                        style={{
                          padding: '8px',
                          backgroundColor: '#EEF0FF',
                          color: '#5B62B3',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          fontFamily: 'Montserrat, sans-serif'
                        }}
                        title="Add Quiz"
                      >
                        <Award size={14} />
                        Quiz
                      </button>

                      <button
                        onClick={() => handleDeleteCourse(course._id)}
                        style={{
                          padding: '8px',
                          backgroundColor: '#FFEBEE',
                          color: '#F44336',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          fontFamily: 'Montserrat, sans-serif'
                        }}
                        title="Delete Course"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorCourseDashboard;