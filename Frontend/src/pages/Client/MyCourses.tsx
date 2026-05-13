import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import ClientSidebar from '../../components/Client/ClientSidebar';

const MyCourses = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'inprogress' | 'completed'>('all');
  const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    api.get('/enrollments/my')
      .then((res: any) => {
        const data =
          res?.data?.enrollments ||
          res?.data?.data?.enrollments ||
          (Array.isArray(res?.data) ? res.data : null) ||
          res?.enrollments ||
          [];
        setEnrollments(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getProgress = (e: any) => e.progress ?? e.completionPercentage ?? 0;

  const stats = {
    total: enrollments.filter(e => e.status !== 'dropped').length,
    inProgress: enrollments.filter(e => getProgress(e) < 100 && e.status !== 'dropped').length,
    completed: enrollments.filter(e => getProgress(e) >= 100).length,
    certificates: enrollments.filter(e => getProgress(e) >= 100 && (e.courseId?.certificate || e.course?.certificate)).length,
  };

  const filtered = enrollments.filter(e => {
    if (e.status === 'dropped') return false;
    if (activeTab === 'inprogress') return getProgress(e) < 100;
    if (activeTab === 'completed') return getProgress(e) >= 100;
    return true;
  });

  // Match sidebar width from ClientSidebar
  const SIDEBAR_WIDTH = 280;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8F9FC', fontFamily: 'Montserrat, sans-serif' }}>
      <ClientSidebar />

      <div style={{ marginLeft: `${SIDEBAR_WIDTH}px`, flex: 1, padding: '40px', overflowY: 'auto' as const, minHeight: '100vh' }}>

        {/* Header */}
        <h1 style={{ margin: '0 0 4px', fontSize: '32px', fontWeight: 800, color: '#111', fontFamily: 'Syne, sans-serif' }}>
          My Courses
        </h1>
        <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#6B7280' }}>
          Continue your learning journey
        </p>

        {/* Enrollment limit banner */}
        <div style={{
          backgroundColor: stats.inProgress >= 2 ? '#FFF0F5' : '#F0FDF4',
          border: `1px solid ${stats.inProgress >= 2 ? '#FBCFE8' : '#BBF7D0'}`,
          borderRadius: '12px', padding: '12px 20px', marginBottom: '28px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ fontSize: '18px' }}>{stats.inProgress >= 2 ? '⚠️' : '✅'}</span>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: stats.inProgress >= 2 ? '#BE185D' : '#166534' }}>
            {stats.inProgress >= 2
              ? 'You have reached the maximum of 2 active enrollments. Complete or drop a course to enroll in a new one.'
              : `You have ${2 - stats.inProgress} enrollment slot${2 - stats.inProgress === 1 ? '' : 's'} available.`}
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Courses', value: stats.total, icon: '📚' },
            { label: 'In Progress', value: stats.inProgress, icon: '📈' },
            { label: 'Completed', value: stats.completed, icon: '🏅' },
            { label: 'Certificates', value: stats.certificates, icon: '🎓' },
          ].map((stat, i) => (
            <div key={i} style={{
              backgroundColor: 'white', borderRadius: '16px', padding: '20px 24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>{stat.label}</p>
                <p style={{ margin: 0, fontSize: '30px', fontWeight: 800, color: '#111', fontFamily: 'Syne, sans-serif' }}>{stat.value}</p>
              </div>
              <span style={{ fontSize: '28px' }}>{stat.icon}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {[
            { key: 'all', label: `All Courses (${stats.total})` },
            { key: 'inprogress', label: `In Progress (${stats.inProgress})` },
            { key: 'completed', label: `Completed (${stats.completed})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '10px 22px',
                border: `2px solid ${activeTab === tab.key ? '#E91E63' : '#E5E7EB'}`,
                borderRadius: '24px',
                backgroundColor: activeTab === tab.key ? '#E91E63' : 'white',
                color: activeTab === tab.key ? 'white' : '#374151',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif', transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center' as const, padding: '60px', color: '#9CA3AF', fontSize: '15px' }}>
            Loading your courses...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center' as const, padding: '60px',
            backgroundColor: 'white', borderRadius: '20px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}>
            <p style={{ fontSize: '48px', margin: '0 0 16px' }}>🎓</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#111', margin: '0 0 8px' }}>No courses here yet</p>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 24px' }}>
              Browse our academy and enroll in up to 2 courses at a time.
            </p>
            <button
              onClick={() => navigate('/client/browse/courses')}
              style={{
                padding: '12px 28px', backgroundColor: '#E91E63', color: 'white',
                border: 'none', borderRadius: '12px', fontWeight: 700,
                fontSize: '14px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
              }}
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '20px' }}>
            {filtered.map((enrollment: any) => {
              const course = enrollment.courseId || enrollment.course || {};
              const progress = getProgress(enrollment);
              const isCompleted = progress >= 100;
              const rawSrc = course.thumbnail || course.images?.[0] || '';
              const imgSrc = rawSrc.startsWith('http') ? rawSrc : rawSrc ? `${BASE_URL}${rawSrc}` : '';

              return (
                <div key={enrollment._id} style={{
                  backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.07)', display: 'flex', minHeight: '200px',
                }}>
                  {/* Thumbnail */}
                  <div style={{
                    width: '280px', flexShrink: 0, position: 'relative' as const,
                    backgroundColor: '#FFF0F5', overflow: 'hidden',
                  }}>
                    <div style={{
                      position: 'absolute' as const, inset: 0,
                      background: 'linear-gradient(135deg, #FFF0F5, #FBCFE8)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '48px', zIndex: 0,
                    }}>🎓</div>
                    {imgSrc && (
                      <img
                        src={imgSrc}
                        alt={course.title}
                        style={{ position: 'absolute' as const, inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <span style={{
                      position: 'absolute' as const, top: '12px', left: '12px', zIndex: 2,
                      backgroundColor: isCompleted ? '#10B981' : 'rgba(0,0,0,0.55)',
                      color: 'white', fontSize: '10px', fontWeight: 800,
                      padding: '4px 10px', borderRadius: '12px',
                    }}>
                      {isCompleted ? 'Completed' : course.courseType || 'Online'}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{
                    flex: 1, padding: '24px 28px',
                    display: 'flex', flexDirection: 'column' as const, justifyContent: 'space-between',
                  }}>
                    <div>
                      <span style={{
                        fontSize: '11px', fontWeight: 700, color: '#E91E63',
                        textTransform: 'uppercase' as const, letterSpacing: '1px',
                      }}>
                        {course.category || 'Academy'}
                      </span>
                      <h3 style={{ margin: '6px 0 4px', fontSize: '20px', fontWeight: 800, color: '#111', fontFamily: 'Syne, sans-serif' }}>
                        {course.title || 'Course'}
                      </h3>
                      <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6B7280' }}>
                        by {course.vendorId?.name || 'Instructor'}
                      </p>

                      {/* Progress bar */}
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>🖥 Theory Progress</span>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#E91E63' }}>{progress}%</span>
                        </div>
                        <div style={{ height: '8px', backgroundColor: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${progress}%`,
                            backgroundColor: isCompleted ? '#10B981' : '#5B62B3',
                            borderRadius: '4px', transition: 'width 0.4s',
                          }} />
                        </div>
                      </div>

                      {/* Meta */}
                      <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                        {course.lessons?.length > 0 && (
                          <span style={{ fontSize: '12px', color: '#6B7280' }}>📚 {course.lessons.length} lessons</span>
                        )}
                        {course.duration && (
                          <span style={{ fontSize: '12px', color: '#6B7280' }}>⏱ {course.duration} hours</span>
                        )}
                      </div>

                      {/* Next lesson */}
                      {!isCompleted && enrollment.nextLesson && (
                        <div style={{ marginTop: '12px', backgroundColor: '#FFF0F5', borderRadius: '10px', padding: '10px 14px' }}>
                          <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>Next Lesson</p>
                          <p style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: 700, color: '#111' }}>{enrollment.nextLesson}</p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F3F4F6',
                    }}>
                      <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                        Last accessed:{' '}
                        {enrollment.lastAccessedAt
                          ? new Date(enrollment.lastAccessedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'Not yet'}
                      </span>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {isCompleted && course.certificate && (
                          <button
                            onClick={() => navigate(`/client/courses/${course._id}/certificate`)}
                            style={{
                              padding: '10px 18px', backgroundColor: '#10B981', color: 'white',
                              border: 'none', borderRadius: '10px', fontWeight: 700,
                              fontSize: '13px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
                            }}
                          >
                            View Certificate 🎓
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/client/courses/${course._id}/learn`)}
                          style={{
                            padding: '10px 22px', backgroundColor: '#E91E63', color: 'white',
                            border: 'none', borderRadius: '10px', fontWeight: 700,
                            fontSize: '13px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
                          }}
                        >
                          {isCompleted ? 'Review Course' : 'Continue Learning'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;