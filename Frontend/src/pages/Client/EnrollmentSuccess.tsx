// Frontend/src/pages/Client/EnrollmentSuccess.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Award, BookOpen, Calendar } from 'lucide-react';
import enrollmentService from '../../services/api/enrollmentService';

interface Enrollment {
  _id: string;
  courseId: {
    title: string;
    imageUrl: string | null;
    duration: number;
    certificateIncluded: boolean;
  };
  batchStartDate: string | null;
  batchLocation: string | null;
  totalPrice: number;
  enrollmentDate: string;
}

const EnrollmentSuccess: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchEnrollmentDetails();
    }
  }, [id]);

  const fetchEnrollmentDetails = async () => {
    try {
      const response = await enrollmentService.getEnrollmentById(id!);
      setEnrollment(response.data);
    } catch (error) {
      console.error('Error fetching enrollment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:5000${imageUrl}`;
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

  if (!enrollment) {
    return (
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'Montserrat, sans-serif'
      }}>
        Enrollment not found
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#FAFAFA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{ 
        maxWidth: '800px',
        width: '100%'
      }}>
        {/* Success Animation */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px',
          animation: 'fadeIn 0.5s ease-in'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            backgroundColor: '#4CAF50',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            animation: 'scaleIn 0.5s ease-out'
          }}>
            <CheckCircle size={64} style={{ color: 'white' }} />
          </div>
          
          <h1 style={{
            fontSize: '36px',
            fontWeight: 700,
            color: '#4CAF50',
            marginBottom: '12px',
            fontFamily: 'Syne, sans-serif'
          }}>
            You're Enrolled!
          </h1>
          
          <p style={{
            fontSize: '18px',
            color: '#666',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            Congratulations! You have full access to <strong>{enrollment.courseId.title}</strong>
          </p>
        </div>

        {/* Enrollment Summary Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 600,
            marginBottom: '24px',
            fontFamily: 'Syne, sans-serif'
          }}>
            Enrollment Summary
          </h2>

          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Course Info */}
            <div style={{
              display: 'flex',
              gap: '16px',
              padding: '20px',
              backgroundColor: '#F5F5F5',
              borderRadius: '12px'
            }}>
              <img
                src={getImageUrl(enrollment.courseId.imageUrl)}
                alt={enrollment.courseId.title}
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '8px',
                  objectFit: 'cover'
                }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {enrollment.courseId.title}
                </h3>
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#666' }}>
                  <span style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {enrollment.courseId.duration} hours
                  </span>
                  {enrollment.courseId.certificateIncluded && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Montserrat, sans-serif' }}>
                      <Award size={16} style={{ color: '#E91E63' }} />
                      Certificate
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px'
            }}>
              <div style={{
                padding: '16px',
                backgroundColor: '#F5F5F5',
                borderRadius: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <Calendar size={18} style={{ color: '#E91E63' }} />
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    Enrollment Date
                  </span>
                </div>
                <p style={{
                  fontSize: '15px',
                  color: '#333',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {new Date(enrollment.enrollmentDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>

              {enrollment.batchStartDate && (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#F5F5F5',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <Calendar size={18} style={{ color: '#E91E63' }} />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      Batch Starts
                    </span>
                  </div>
                  <p style={{
                    fontSize: '15px',
                    color: '#333',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {new Date(enrollment.batchStartDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}

              <div style={{
                padding: '16px',
                backgroundColor: '#F5F5F5',
                borderRadius: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <BookOpen size={18} style={{ color: '#E91E63' }} />
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    Enrollment ID
                  </span>
                </div>
                <p style={{
                  fontSize: '15px',
                  color: '#333',
                  fontFamily: 'Montserrat, sans-serif',
                  wordBreak: 'break-all'
                }}>
                  {enrollment._id}
                </p>
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: '#E8F5E9',
                borderRadius: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <CheckCircle size={18} style={{ color: '#4CAF50' }} />
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    Total Paid
                  </span>
                </div>
                <p style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#2E7D32',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  ${enrollment.totalPrice}
                </p>
              </div>
            </div>
          </div>

          {/* Certificate Info */}
          {enrollment.courseId.certificateIncluded && (
            <div style={{
              marginTop: '24px',
              padding: '20px',
              backgroundColor: '#F3E5F5',
              borderRadius: '12px',
              border: '2px dashed #E91E63'
            }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Award size={40} style={{ color: '#E91E63' }} />
                <div>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    marginBottom: '4px',
                    color: '#E91E63',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    Certificate of Completion Awaits!
                  </h4>
                  <p style={{
                    fontSize: '14px',
                    color: '#666',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    Complete the course to receive your QR-verified certificate
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px'
        }}>
          <button
            onClick={() => navigate(`/client/learning/${enrollment._id}`)}
            style={{
              padding: '16px',
              backgroundColor: '#E91E63',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            Start Learning
          </button>
          
          <button
            onClick={() => navigate('/client/my-courses')}
            style={{
              padding: '16px',
              backgroundColor: 'white',
              color: '#E91E63',
              border: '2px solid #E91E63',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            View My Courses
          </button>
        </div>

        {/* Next Steps */}
        <div style={{
          marginTop: '32px',
          padding: '24px',
          backgroundColor: '#E3F2FD',
          borderRadius: '12px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '16px',
            color: '#1976D2',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            What's Next?
          </h3>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <li style={{
              display: 'flex',
              alignItems: 'start',
              gap: '12px',
              fontSize: '14px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              <CheckCircle size={20} style={{ color: '#1976D2', flexShrink: 0, marginTop: '2px' }} />
              <span>Access your course materials anytime from "My Courses"</span>
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'start',
              gap: '12px',
              fontSize: '14px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              <CheckCircle size={20} style={{ color: '#1976D2', flexShrink: 0, marginTop: '2px' }} />
              <span>Complete lessons at your own pace and track your progress</span>
            </li>
            {enrollment.batchLocation && (
              <li style={{
                display: 'flex',
                alignItems: 'start',
                gap: '12px',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                <CheckCircle size={20} style={{ color: '#1976D2', flexShrink: 0, marginTop: '2px' }} />
                <span>Attend practical sessions at: {enrollment.batchLocation}</span>
              </li>
            )}
            <li style={{
              display: 'flex',
              alignItems: 'start',
              gap: '12px',
              fontSize: '14px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              <CheckCircle size={20} style={{ color: '#1976D2', flexShrink: 0, marginTop: '2px' }} />
              <span>Receive your certificate upon successful completion</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentSuccess;