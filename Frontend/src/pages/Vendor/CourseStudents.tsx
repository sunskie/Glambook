// Frontend/src/pages/Vendor/CourseStudents.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, Mail, Phone, Calendar, 
  TrendingUp, CheckCircle, Clock, Download,
  Filter, Search
} from 'lucide-react';
import enrollmentService from '../../services/api/enrollmentService';
import courseService from '../../services/api/courseService';

interface Enrollment {
  _id: string;
  clientId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  enrollmentDate: string;
  status: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  batchStartDate: string | null;
  batchLocation: string | null;
  paymentStatus: string;
  certificateIssued: boolean;
}

interface Course {
  _id: string;
  title: string;
  category: string;
  imageUrl: string | null;
}

const CourseStudents: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    filterEnrollments();
  }, [enrollments, filterStatus, searchQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseResponse = await courseService.getCourseById(id!);
      setCourse(courseResponse.data);
      
      // Fetch enrollments
      const enrollmentsResponse = await enrollmentService.getVendorEnrollments({ 
        courseId: id 
      });
      setEnrollments(enrollmentsResponse.data || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEnrollments = () => {
    let filtered = enrollments;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(e => e.status === filterStatus);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(e => {
        const name = e.clientId?.name?.toLowerCase() || '';
        const email = e.clientId?.email?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        return name.includes(query) || email.includes(query);
      });
    }

    setFilteredEnrollments(filtered);
  };

  const handleMarkComplete = async (enrollmentId: string) => {
    if (!window.confirm('Mark this student as completed?')) return;

    try {
      await enrollmentService.updateEnrollmentStatus(enrollmentId, 'completed');
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const stats = {
    total: enrollments.length,
    active: enrollments.filter(e => e.status === 'enrolled').length,
    completed: enrollments.filter(e => e.status === 'completed').length,
    avgProgress: enrollments.length > 0 
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
      : 0
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
        Loading students...
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
            Students - {course?.title}
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#666',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            Manage your students and track their progress
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
                  Total Students
                </p>
                <p style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#111',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {stats.total}
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
                <Users size={24} style={{ color: '#2196F3' }} />
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
                  Active Students
                </p>
                <p style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#111',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {stats.active}
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
                <Clock size={24} style={{ color: '#FF9800' }} />
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
                  Avg Progress
                </p>
                <p style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#111',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {stats.avgProgress}%
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
                <TrendingUp size={24} style={{ color: '#E91E63' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: '24px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#999'
            }} />
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px 10px 40px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif',
                outline: 'none'
              }}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'Montserrat, sans-serif',
              outline: 'none',
              cursor: 'pointer',
              minWidth: '150px'
            }}
          >
            <option value="all">All Status</option>
            <option value="enrolled">Enrolled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Students Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          {filteredEnrollments.length === 0 ? (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              color: '#999',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                No students found
              </p>
              <p style={{ fontSize: '14px' }}>
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Students will appear here once they enroll'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#F5F5F5' }}>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#666',
                      borderBottom: '1px solid #eee'
                    }}>
                      Student
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#666',
                      borderBottom: '1px solid #eee'
                    }}>
                      Contact
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#666',
                      borderBottom: '1px solid #eee'
                    }}>
                      Enrolled
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#666',
                      borderBottom: '1px solid #eee'
                    }}>
                      Progress
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#666',
                      borderBottom: '1px solid #eee'
                    }}>
                      Status
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#666',
                      borderBottom: '1px solid #eee'
                    }}>
                      Payment
                    </th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'center',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#666',
                      borderBottom: '1px solid #eee'
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnrollments.map((enrollment) => (
                    <tr 
                      key={enrollment._id}
                      style={{ borderBottom: '1px solid #f5f5f5' }}
                    >
                      <td style={{ padding: '16px' }}>
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#111',
                            marginBottom: '4px'
                          }}>
                            {enrollment.clientId?.name || 'N/A'}
                          </div>
                          {enrollment.certificateIssued && (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              color: '#4CAF50',
                              backgroundColor: '#E8F5E9',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontWeight: 600
                            }}>
                              <CheckCircle size={12} />
                              Certified
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontSize: '13px', color: '#666' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <Mail size={14} />
                            {enrollment.clientId?.email || 'N/A'}
                          </div>
                          {enrollment.clientId?.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Phone size={14} />
                              {enrollment.clientId.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontSize: '13px', color: '#666' }}>
                          {new Date(enrollment.enrollmentDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ width: '120px' }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '6px',
                            fontSize: '12px',
                            color: '#666'
                          }}>
                            <span>{enrollment.completedLessons}/{enrollment.totalLessons} lessons</span>
                            <span style={{ fontWeight: 600, color: '#111' }}>{enrollment.progress}%</span>
                          </div>
                          <div style={{
                            width: '100%',
                            height: '6px',
                            backgroundColor: '#E0E0E0',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${enrollment.progress}%`,
                              height: '100%',
                              backgroundColor: enrollment.progress === 100 ? '#4CAF50' : '#2196F3',
                              transition: 'width 0.3s'
                            }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span className={getStatusColor(enrollment.status)} style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}>
                          {enrollment.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span className={getPaymentStatusColor(enrollment.paymentStatus)} style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}>
                          {enrollment.paymentStatus}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        {enrollment.status === 'enrolled' && enrollment.progress === 100 && (
                          <button
                            onClick={() => handleMarkComplete(enrollment._id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Mark Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseStudents;
