import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const CoursePlayer = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [marking, setMarking] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'resources'>('overview');
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    // Fetch course
    api.get(`/courses/${courseId}`)
      .then((res: any) => {
        const c = res?.data?.course || res?.data?.data?.course || res?.data?.data || res?.data || res?.course || null;
        if (c && c._id) {
          setCourse(c);
          const lessons = c.lessons || [];
          if (lessons.length > 0) {
            setCurrentLesson(lessons[0]);
            setCurrentIndex(0);
          }
        }
      })
      .catch(() => {});

    // Fetch enrollment
    api.get('/enrollments/my')
      .then((res: any) => {
        const enrollments = res?.data?.enrollments || res?.enrollments || [];
        const found = enrollments.find((e: any) => {
          const eCourseId = e.courseId?._id || e.courseId;
          return eCourseId?.toString() === courseId;
        });
        setEnrollment(found || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  const isLessonCompleted = (lessonId: string) => {
    return enrollment?.completedLessons?.some((id: any) =>
      (id?._id || id) === lessonId || id?.toString() === lessonId
    ) || false;
  };

  const handleMarkComplete = async () => {
    if (!enrollment || !currentLesson) return;
    setMarking(true);
    try {
      const res: any = await api.post('/enrollments/lesson-complete', {
        enrollmentId: enrollment._id,
        lessonId: currentLesson._id,
      });
      setEnrollment((prev: any) => ({
        ...prev,
        completedLessons: [...(prev.completedLessons || []), currentLesson._id],
        progress: res?.data?.progress || prev.progress,
      }));
      // Auto-advance to next
      const lessons = course?.lessons || [];
      if (currentIndex < lessons.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setCurrentLesson(lessons[currentIndex + 1]);
      }
    } catch (err) {}
    finally { setMarking(false); }
  };

  const getVideoSrc = (lesson: any) => {
    if (!lesson?.videoUrl) return '';
    return lesson.videoUrl.startsWith('http') ? lesson.videoUrl : `${BASE_URL}${lesson.videoUrl}`;
  };

  const lessons = course?.lessons || [];
  const progress = enrollment?.progress || 0;
  const completedCount = enrollment?.completedLessons?.length || 0;

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ textAlign: 'center' as const }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
        <p>Loading course...</p>
      </div>
    </div>
  );

  if (!loading && !course) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ textAlign: 'center' as const }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
        <h2 style={{ margin: '0 0 8px', fontFamily: 'Syne, sans-serif' }}>Course could not be loaded</h2>
        <p style={{ color: '#9CA3AF', margin: '0 0 24px' }}>The course may have been removed or you may not have access.</p>
        <button onClick={() => navigate('/client/my-courses')}
          style={{ padding: '12px 24px', backgroundColor: '#E91E63', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
          ← Back to My Courses
        </button>
      </div>
    </div>
  );

  if (!loading && course && !enrollment) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ textAlign: 'center' as const }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ margin: '0 0 8px', fontFamily: 'Syne, sans-serif' }}>Not enrolled</h2>
        <p style={{ color: '#9CA3AF', margin: '0 0 24px' }}>You need to enroll in this course to access the lessons.</p>
        <button onClick={() => navigate(`/client/courses/${courseId}`)}
          style={{ padding: '12px 24px', backgroundColor: '#5B62B3', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
          View Course
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F0F1A', fontFamily: 'Montserrat, sans-serif', display: 'flex', flexDirection: 'column' as const }}>

      {/* Top bar */}
      <div style={{ backgroundColor: '#1e1b4b', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate(`/client/courses/${courseId}`)}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
            ← Back to Course
          </button>
          <span style={{ color: '#4B5563', fontSize: '12px' }}>|</span>
          <span style={{ color: 'white', fontSize: '14px', fontWeight: 600, maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
            {course.title}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#94A3B8', fontSize: '12px' }}>
            Lesson {currentIndex + 1} of {lessons.length}
          </span>
          <div style={{ width: '120px', height: '6px', backgroundColor: '#374151', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, backgroundColor: '#E91E63', borderRadius: '3px', transition: 'width 0.3s' }} />
          </div>
          <span style={{ color: '#E91E63', fontSize: '12px', fontWeight: 700 }}>{progress}%</span>
        </div>
      </div>

      {/* Main area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left — video + content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'auto' }}>

          {/* Video / Content area */}
          <div style={{ backgroundColor: '#000', width: '100%', position: 'relative' as const, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            {currentLesson?.videoUrl ? (
              <video
                key={currentLesson._id}
                controls
                style={{ width: '100%', maxHeight: '500px', objectFit: 'contain' }}
                src={(() => {
                  const src = currentLesson.videoUrl;
                  const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
                  return src.startsWith('http') ? src : `${BASE_URL}${src}`;
                })()}
              >
                Your browser does not support video playback.
              </video>
            ) : currentLesson?.pdfUrl ? (
              <iframe
                src={(() => {
                  const src = currentLesson.pdfUrl;
                  const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
                  return src.startsWith('http') ? src : `${BASE_URL}${src}`;
                })()}
                style={{ width: '100%', height: '500px', border: 'none' }}
                title={currentLesson?.title}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', color: '#6B7280', padding: '60px', textAlign: 'center' as const }}>
                <span style={{ fontSize: '64px', marginBottom: '16px' }}>📄</span>
                <h3 style={{ color: '#94A3B8', margin: '0 0 8px', fontFamily: 'Syne, sans-serif' }}>{currentLesson?.title || 'Select a lesson'}</h3>
                <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
                  {currentLesson ? 'No media uploaded for this lesson yet.' : 'Select a lesson from the sidebar to begin.'}
                </p>
              </div>
            )}
          </div>

          {/* Lesson info */}
          <div style={{ padding: '24px 32px', backgroundColor: '#111827', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'white', fontFamily: 'Syne, sans-serif' }}>
                {currentLesson?.title || 'Select a lesson'}
              </h2>
              <button
                onClick={handleMarkComplete}
                disabled={marking || isLessonCompleted(currentLesson?._id)}
                style={{
                  padding: '10px 24px',
                  backgroundColor: isLessonCompleted(currentLesson?._id) ? '#10B981' : '#E91E63',
                  color: 'white', border: 'none', borderRadius: '10px',
                  fontWeight: 700, fontSize: '13px', cursor: isLessonCompleted(currentLesson?._id) ? 'default' : 'pointer',
                  fontFamily: 'Montserrat, sans-serif', opacity: marking ? 0.7 : 1,
                }}
              >
                {isLessonCompleted(currentLesson?._id) ? '✓ Completed' : marking ? 'Saving...' : 'Mark as Complete ✓'}
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0', marginBottom: '20px', borderBottom: '1px solid #374151' }}>
              {(['overview', 'resources'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid #E91E63' : '2px solid transparent', color: activeTab === tab ? '#E91E63' : '#6B7280', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', textTransform: 'capitalize' as const }}>
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <p style={{ color: '#94A3B8', fontSize: '14px', lineHeight: 1.8 }}>
                {currentLesson?.description || 'No description for this lesson.'}
              </p>
            )}
            {activeTab === 'resources' && (
              <div>
                {currentLesson?.pdfUrl ? (
                  <a href={currentLesson.pdfUrl.startsWith('http') ? currentLesson.pdfUrl : `${BASE_URL}${currentLesson.pdfUrl}`}
                    target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: '#1e1b4b', borderRadius: '10px', textDecoration: 'none', color: 'white', fontSize: '14px' }}>
                    📄 Download Lesson PDF
                  </a>
                ) : (
                  <p style={{ color: '#6B7280', fontSize: '14px' }}>No resources for this lesson.</p>
                )}
              </div>
            )}

            {/* Bottom nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #374151' }}>
              <button
                onClick={() => { if (currentIndex > 0) { setCurrentIndex(currentIndex - 1); setCurrentLesson(lessons[currentIndex - 1]); } }}
                disabled={currentIndex === 0}
                style={{ padding: '10px 20px', backgroundColor: currentIndex === 0 ? '#1F2937' : '#374151', color: currentIndex === 0 ? '#6B7280' : 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: currentIndex === 0 ? 'default' : 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
                ← Previous
              </button>
              {progress >= 100 ? (
                <button onClick={() => navigate(`/client/courses/${courseId}/quiz`)}
                  style={{ padding: '10px 24px', backgroundColor: '#E91E63', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
                  Take Final Quiz 📝
                </button>
              ) : null}
              <button
                onClick={() => { if (currentIndex < lessons.length - 1) { setCurrentIndex(currentIndex + 1); setCurrentLesson(lessons[currentIndex + 1]); } }}
                disabled={currentIndex === lessons.length - 1}
                style={{ padding: '10px 20px', backgroundColor: currentIndex === lessons.length - 1 ? '#1F2937' : '#5B62B3', color: currentIndex === lessons.length - 1 ? '#6B7280' : 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: currentIndex === lessons.length - 1 ? 'default' : 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Right — curriculum sidebar */}
        {sidebarOpen && (
          <div style={{ width: '320px', flexShrink: 0, backgroundColor: '#1e1b4b', overflowY: 'auto', borderLeft: '1px solid #374151' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #374151', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>Course Content</span>
              <span style={{ color: '#94A3B8', fontSize: '12px' }}>{completedCount}/{lessons.length} completed</span>
            </div>
            {lessons.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center' as const, color: '#6B7280' }}>
                <p style={{ fontSize: '14px' }}>No lessons added to this course yet.</p>
              </div>
            ) : (
              lessons.map((lesson: any, idx: number) => {
              const done = isLessonCompleted(lesson._id);
              const isCurrent = idx === currentIndex;
              return (
                <div key={lesson._id}
                  onClick={() => { setCurrentIndex(idx); setCurrentLesson(lesson); }}
                  style={{
                    padding: '14px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                    backgroundColor: isCurrent ? 'rgba(233,30,99,0.15)' : 'transparent',
                    borderLeft: isCurrent ? '3px solid #E91E63' : '3px solid transparent',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!isCurrent) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { if (!isCurrent) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                >
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0, backgroundColor: done ? '#10B981' : isCurrent ? '#E91E63' : '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'white', fontWeight: 700 }}>
                    {done ? '✓' : idx + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'white' : '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                      {lesson.title}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6B7280' }}>
                      {lesson.contentType || 'Video'} • {lesson.duration || 0} min
                    </p>
                  </div>
                </div>
              );
            })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;
