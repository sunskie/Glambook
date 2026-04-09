// Frontend/src/pages/Client/LearningDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  PlayCircle, FileText, CheckCircle, Lock,
  Clock, Award, Calendar, MapPin, TrendingUp, Download
} from 'lucide-react';
import enrollmentService from '../../services/api/enrollmentService';

interface Enrollment {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    description: string;
    imageUrl: string | null;
    instructorName: string;
    duration: number;
    lessons: Array<{
      _id: string;
      title: string;
      description: string;
      duration: number;
      contentType: string;
      contentUrl: string | null;
      orderIndex: number;
      isPreview: boolean;
    }>;
    certificateIncluded: boolean;
    courseFormat: any;
  };
  status: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lessonsProgress: Array<{
    lessonId: string;
    completed: boolean;
    completedAt: string | null;
    timeSpent: number;
  }>;
  batchStartDate: string | null;
  batchEndDate: string | null;
  batchLocation: string | null;
  enrollmentDate: string;
  certificateIssued: boolean;
  certificateUrl: string | null;
}

const LearningDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'lessons' | 'attendance'>('lessons');

  useEffect(() => {
    if (id) {
      fetchEnrollment();
    }
  }, [id]);

  const fetchEnrollment = async () => {
    try {
      setLoading(true);
      const response = await enrollmentService.getEnrollmentById(id!);
      setEnrollment(response.data);
      
      // Auto-select first incomplete lesson
      const firstIncomplete = response.data.courseId.lessons.find((lesson: any) => {
        const progress = response.data.lessonsProgress.find(
          (lp: any) => lp.lessonId === lesson._id
        );
        return !progress?.completed;
      });
      
      setSelectedLesson(firstIncomplete || response.data.courseId.lessons[0]);
    } catch (error) {
      console.error('Error fetching enrollment:', error);
    } finally {
      setLoading(false);
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    if (!enrollment) return false;
    const progress = enrollment.lessonsProgress.find(lp => lp.lessonId === lessonId);
    return progress?.completed || false;
  };

  const handleMarkComplete = async (lessonId: string) => {
    if (!enrollment) return;
    
    try {
      await enrollmentService.updateLessonProgress(enrollment._id, {
        lessonId,
        completed: true,
        timeSpent: 0
      });
      
      // Refresh enrollment data
      fetchEnrollment();
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80';
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
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
      {/* Top Bar */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #eee',
        padding: '16px 24px'
      }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div>
                <h1 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  margin: 0,
                  fontFamily: 'Syne, sans-serif'
                }}>
                  {enrollment.courseId.title}
                </h1>
                <p style={{
                  fontSize: '13px',
                  color: '#666',
                  margin: 0,
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  by {enrollment.courseId.instructorName}
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px'
            }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '13px',
                  color: '#666',
                  marginBottom: '4px',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Your Progress
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '120px',
                    height: '8px',
                    backgroundColor: '#E0E0E0',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${enrollment.progress}%`,
                      height: '100%',
                      backgroundColor: '#4CAF50',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#4CAF50',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {enrollment.progress}%
                  </span>
                </div>
              </div>

              {enrollment.certificateIssued && (
                <button
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#E91E63',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                >
                  <Download size={16} />
                  Download Certificate
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px' }}>
          {/* Left Sidebar - Course Content */}
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              {/* Course Image */}
              <img
                src={getImageUrl(enrollment.courseId.imageUrl)}
                alt={enrollment.courseId.title}
                style={{ width: '100%', height: '180px', objectFit: 'cover' }}
              />

              {/* Stats */}
              <div style={{ padding: '20px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#F5F5F5',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      color: '#E91E63',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      {enrollment.completedLessons}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#666',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      Completed
                    </div>
                  </div>

                  <div style={{
                    padding: '12px',
                    backgroundColor: '#F5F5F5',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      color: '#2196F3',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      {enrollment.totalLessons}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#666',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      Total Lessons
                    </div>
                  </div>
                </div>

                {/* Lessons List */}
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '12px',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Course Content
                </div>

                <div style={{
                  maxHeight: '500px',
                  overflowY: 'auto'
                }}>
                  {enrollment.courseId.lessons.map((lesson, index) => {
                    const completed = isLessonCompleted(lesson._id);
                    const isSelected = selectedLesson?._id === lesson._id;

                    return (
                      <div
                        key={lesson._id}
                        onClick={() => setSelectedLesson(lesson)}
                        style={{
                          padding: '12px',
                          marginBottom: '8px',
                          backgroundColor: isSelected ? '#FCE4EC' : '#F9F9F9',
                          border: isSelected ? '2px solid #E91E63' : '2px solid transparent',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: completed ? '#4CAF50' : '#E0E0E0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {completed ? (
                              <CheckCircle size={18} style={{ color: 'white' }} />
                            ) : lesson.contentType === 'video' ? (
                              <PlayCircle size={18} style={{ color: '#666' }} />
                            ) : (
                              <FileText size={18} style={{ color: '#666' }} />
                            )}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: '13px',
                              fontWeight: 500,
                              color: '#111',
                              marginBottom: '4px',
                              fontFamily: 'Montserrat, sans-serif'
                            }}>
                              Lesson {index + 1}: {lesson.title}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: '#666',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontFamily: 'Montserrat, sans-serif'
                            }}>
                              <Clock size={12} />
                              {lesson.duration} min
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Batch Info Card */}
            {enrollment.batchStartDate && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                marginTop: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  marginBottom: '16px',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Practical Classes
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} style={{ color: '#666' }} />
                    <span style={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
                      {new Date(enrollment.batchStartDate).toLocaleDateString()} - {new Date(enrollment.batchEndDate!).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} style={{ color: '#666' }} />
                    <span style={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
                      {enrollment.batchLocation}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right - Lesson Content */}
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              minHeight: '600px'
            }}>
              {selectedLesson ? (
                <>
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      backgroundColor: '#E3F2FD',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#1976D2',
                      marginBottom: '12px',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      {selectedLesson.contentType.toUpperCase()}
                    </div>

                    <h2 style={{
                      fontSize: '28px',
                      fontWeight: 600,
                      marginBottom: '12px',
                      fontFamily: 'Syne, sans-serif'
                    }}>
                      {selectedLesson.title}
                    </h2>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '14px',
                      color: '#666',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={16} />
                        {selectedLesson.duration} minutes
                      </div>
                      {isLessonCompleted(selectedLesson._id) && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#4CAF50',
                          fontWeight: 600
                        }}>
                          <CheckCircle size={16} />
                          Completed
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Video Player or Content */}
                  <div style={{
                    marginBottom: '32px',
                    backgroundColor: '#F5F5F5',
                    borderRadius: '12px',
                    minHeight: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {selectedLesson.contentType === 'video' ? (
                      <div style={{ textAlign: 'center' }}>
                        <PlayCircle size={64} style={{ color: '#E91E63', marginBottom: '16px' }} />
                        <p style={{
                          fontSize: '16px',
                          color: '#666',
                          fontFamily: 'Montserrat, sans-serif'
                        }}>
                          Video Player Coming Soon
                        </p>
                        <p style={{
                          fontSize: '14px',
                          color: '#999',
                          fontFamily: 'Montserrat, sans-serif'
                        }}>
                          {selectedLesson.contentUrl || 'Content URL will be embedded here'}
                        </p>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <FileText size={64} style={{ color: '#E91E63', marginBottom: '16px' }} />
                        <p style={{
                          fontSize: '16px',
                          color: '#666',
                          fontFamily: 'Montserrat, sans-serif'
                        }}>
                          PDF Viewer Coming Soon
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div style={{ marginBottom: '32px' }}>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      marginBottom: '12px',
                      fontFamily: 'Syne, sans-serif'
                    }}>
                      About This Lesson
                    </h3>
                    <p style={{
                      fontSize: '15px',
                      lineHeight: '1.7',
                      color: '#666',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      {selectedLesson.description}
                    </p>
                  </div>

                  {/* Actions */}
                  {!isLessonCompleted(selectedLesson._id) && (
                    <button
                      onClick={() => handleMarkComplete(selectedLesson._id)}
                      style={{
                        width: '100%',
                        padding: '16px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                    >
                      <CheckCircle size={20} />
                      Mark as Complete
                    </button>
                  )}
                </>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '60px',
                  color: '#999',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Select a lesson to start learning
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningDashboard;
