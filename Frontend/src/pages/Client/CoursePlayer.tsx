import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import Breadcrumbs from '../../components/common/Breadcrumbs';

const CoursePlayer = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const backDestination = location.state?.from || '/client/my-courses';
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
    api.get(`/courses/${courseId}`)
      .then((res: any) => {
        const c = res?.data?.data || res?.data?.course || res?.data?.data?.course || res?.data || res?.course || null;
        if (c && c._id) {
          setCourse(c);
          const courseLessons = c.lessons || c.curriculum || c.content?.lessons || [];
          if (courseLessons.length > 0) {
            setCurrentLesson(courseLessons[0]);
            setCurrentIndex(0);
          }
        }
      })
      .catch((err: any) => console.error('Failed to fetch course:', err))
      .finally(() => setLoading(false));

    api.get('/enrollments/my')
      .then((res: any) => {
        const enrollments = res?.data?.enrollments || res?.data?.data?.enrollments || res?.enrollments || [];
        const found = enrollments.find((e: any) => {
          const eCourseId = e.courseId?._id || e.courseId;
          return eCourseId?.toString() === courseId;
        });
        setEnrollment(found || null);
      })
      .catch((err: any) => console.error('Failed to fetch enrollment:', err));
  }, [courseId]);

  const detectContentType = (lesson: any): 'video' | 'pdf' | 'article' | 'none' => {
    if (!lesson) return 'none';
    const ct: string = (lesson?.contentType || '').toLowerCase().trim();
    const url: string = lesson?.contentUrl || lesson?.videoUrl || lesson?.pdfUrl || '';
    if (ct === 'video') return url ? 'video' : 'none';
    if (ct === 'pdf') return url ? 'pdf' : 'none';
    if (ct === 'article') return url ? 'article' : 'none';
    if (!url) return 'none';
    const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || '';
    if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v'].includes(ext)) return 'video';
    if (ext === 'pdf') return 'pdf';
    if (url.includes('/videos/')) return 'video';
    if (url.includes('/pdfs/')) return 'pdf';
    return 'none';
  };

  const getMediaSrc = (lesson: any): string => {
    const url: string = lesson?.contentUrl || lesson?.videoUrl || lesson?.pdfUrl || '';
    if (!url) return '';
    return url.startsWith('http') ? url : `${BASE_URL}${url}`;
  };

  // Derive video MIME type from URL extension
  const getVideoMime = (src: string): string => {
    const ext = src.split('?')[0].split('.').pop()?.toLowerCase() || '';
    const map: Record<string, string> = {
      mp4: 'video/mp4',
      webm: 'video/webm',
      mov: 'video/quicktime',
      m4v: 'video/mp4',
      avi: 'video/x-msvideo',
      mkv: 'video/x-matroska',
    };
    return map[ext] || 'video/mp4';
  };

  const isLessonCompleted = (lessonId: string): boolean => {
    if (!enrollment?.completedLessons) return false;
    if (Array.isArray(enrollment.completedLessons)) {
      return enrollment.completedLessons.some((id: any) =>
        (id?._id || id) === lessonId || id?.toString() === lessonId
      );
    }
    if (typeof enrollment.completedLessons === 'object') {
      return !!enrollment.completedLessons[lessonId];
    }
    return false;
  };

  const handleMarkComplete = async () => {
    if (!enrollment?._id || !currentLesson?._id) return;
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
      api.get('/enrollments/my')
        .then((res: any) => {
          const enrollments = res?.data?.enrollments || res?.data?.data?.enrollments || res?.enrollments || [];
          const found = enrollments.find((e: any) => {
            const eCourseId = e.courseId?._id || e.courseId;
            return eCourseId?.toString() === courseId;
          });
          if (found) setEnrollment(found);
        })
        .catch((err: any) => console.error('Failed to refetch enrollment:', err));

      const courseLessons = course?.lessons || course?.curriculum || course?.content?.lessons || [];
      if (currentIndex < courseLessons.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setCurrentLesson(courseLessons[currentIndex + 1]);
      }
    } catch (err: any) {
      console.error('Failed to mark lesson complete:', err);
    } finally {
      setMarking(false);
    }
  };

  const lessons = course?.lessons || course?.curriculum || course?.content?.lessons || [];
  const progress = enrollment?.progress || 0;
  const completedCount = enrollment?.completedLessons
    ? Array.isArray(enrollment.completedLessons)
      ? enrollment.completedLessons.length
      : Object.keys(enrollment.completedLessons).length
    : 0;

  const allLessonsComplete = progress >= 100;
  const onlineCompleted = enrollment?.onlineCompleted || allLessonsComplete;
  const quizPassed = enrollment?.quizPassed || false;
  const onlineCertEligible = progress === 100 && quizPassed;
  const finalCertEligible = progress === 100 && quizPassed &&
    (enrollment?.attendancePercentage || 0) >= 80 && enrollment?.practicalPassed;

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
        <p>Loading course...</p>
      </div>
    </div>
  );

  if (!loading && !course) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
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
      <div style={{ textAlign: 'center' }}>
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
    <div style={{ minHeight: '100vh', backgroundColor: '#0F0F1A', fontFamily: 'Montserrat, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <Breadcrumbs items={[
        { label: 'Home', path: '/client/dashboard' },
        { label: 'My Courses', path: '/client/my-courses' },
        { label: course?.title || 'Course', path: `/client/courses/${courseId}` },
        { label: currentLesson?.title || 'Learning' },
      ]} />

      {/* Top bar */}
      <div style={{ backgroundColor: '#1e1b4b', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate(backDestination)}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
            ← Back to Courses
          </button>
          <span style={{ color: '#4B5563', fontSize: '12px' }}>|</span>
          <span style={{ color: 'white', fontSize: '14px', fontWeight: 600, maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

        {/* Left — content + info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>

          {/* Content area */}
          <div style={{
            backgroundColor: '#000',
            width: '100%',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
          }}>
            {(() => {
              const contentKind = detectContentType(currentLesson);
              const mediaSrc = getMediaSrc(currentLesson);

              // ── VIDEO ──────────────────────────────────────────────
              // FIX: single <source> with correct MIME type instead of 3 identical sources
              // FIX: crossOrigin="anonymous" removed — causes CORS preflight issues with static files
              if (contentKind === 'video' && mediaSrc) {
                return (
                  <video
                    key={mediaSrc}
                    ref={videoRef}
                    controls
                    preload="metadata"
                    style={{ width: '100%', height: '100%', maxHeight: '500px', background: '#000' }}
                    onError={(e) => console.error('Video load error:', (e.target as HTMLVideoElement).error)}
                  >
                    <source src={mediaSrc} type={getVideoMime(mediaSrc)} />
                    Your browser does not support the video tag.
                  </video>
                );
              }

              // ── PDF ────────────────────────────────────────────────
              // FIX: replace iframe (blocked by CSP frame-ancestors) with a styled preview card
              if (contentKind === 'pdf' && mediaSrc) {
                const fileName = mediaSrc.split('/').pop()?.split('?')[0] || 'document.pdf';
                return (
                  <div style={{
                    width: '100%',
                    minHeight: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 24px',
                    boxSizing: 'border-box',
                  }}>
                    <div style={{
                      backgroundColor: '#1a1a2e',
                      border: '1px solid #374151',
                      borderRadius: '16px',
                      padding: '48px 40px',
                      maxWidth: '480px',
                      width: '100%',
                      textAlign: 'center',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    }}>
                      {/* PDF icon */}
                      <div style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: '#E91E6320',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        fontSize: '36px',
                      }}>
                        📄
                      </div>

                      <h3 style={{
                        margin: '0 0 8px',
                        color: 'white',
                        fontSize: '18px',
                        fontWeight: 700,
                        fontFamily: 'Syne, sans-serif',
                        wordBreak: 'break-word',
                      }}>
                        {currentLesson?.title}
                      </h3>

                      <p style={{
                        margin: '0 0 4px',
                        color: '#6B7280',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                      }}>
                        {fileName}
                      </p>

                      <p style={{ margin: '0 0 28px', color: '#94A3B8', fontSize: '13px' }}>
                        PDF Document • {currentLesson?.duration || 0} min read
                      </p>

                      {/* Primary CTA */}
                      <a
                        href={mediaSrc}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '13px 32px',
                          backgroundColor: '#E91E63',
                          color: 'white',
                          borderRadius: '10px',
                          textDecoration: 'none',
                          fontWeight: 700,
                          fontSize: '14px',
                          fontFamily: 'Montserrat, sans-serif',
                          marginBottom: '12px',
                          transition: 'opacity 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                      >
                        Open PDF ↗
                      </a>

                      <p style={{ margin: '8px 0 0', color: '#6B7280', fontSize: '11px' }}>
                        Opens in a new tab
                      </p>
                    </div>
                  </div>
                );
              }

              // ── ARTICLE ────────────────────────────────────────────
              if (contentKind === 'article' && mediaSrc) {
                return (
                  <div style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    color: '#94A3B8', padding: '60px', textAlign: 'center', gap: '16px',
                  }}>
                    <span style={{ fontSize: '64px' }}>🔗</span>
                    <h3 style={{ color: 'white', margin: '0 0 8px', fontFamily: 'Syne, sans-serif' }}>
                      {currentLesson?.title}
                    </h3>
                    <p style={{ color: '#94A3B8', fontSize: '14px', margin: '0 0 16px' }}>
                      This lesson links to an external article.
                    </p>
                    <a
                      href={mediaSrc}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: '12px 24px', backgroundColor: '#5B62B3',
                        color: 'white', borderRadius: '10px', textDecoration: 'none',
                        fontWeight: 700, fontSize: '14px', fontFamily: 'Montserrat, sans-serif',
                      }}
                    >
                      Open Article ↗
                    </a>
                  </div>
                );
              }

              // ── NO CONTENT ─────────────────────────────────────────
              return (
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#6B7280', padding: '60px', textAlign: 'center',
                }}>
                  <span style={{ fontSize: '64px', marginBottom: '16px' }}>📄</span>
                  <h3 style={{ color: '#94A3B8', margin: '0 0 8px', fontFamily: 'Syne, sans-serif' }}>
                    {currentLesson?.title || 'This lesson'}
                  </h3>
                  <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 8px' }}>
                    No media uploaded for this lesson yet.
                  </p>
                  <p style={{ color: '#9CA3AF', fontSize: '12px', margin: 0 }}>
                    Check back later or contact your instructor.
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Lesson info */}
          <div style={{ padding: '24px 32px', backgroundColor: '#111827', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'white', fontFamily: 'Syne, sans-serif' }}>
                {currentLesson?.title || 'Select a lesson'}
              </h2>
              {currentLesson && (
                <button
                  onClick={handleMarkComplete}
                  disabled={marking || isLessonCompleted(currentLesson?._id)}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: isLessonCompleted(currentLesson?._id) ? '#10B981' : '#E91E63',
                    color: 'white', border: 'none', borderRadius: '10px',
                    fontWeight: 700, fontSize: '13px',
                    cursor: isLessonCompleted(currentLesson?._id) ? 'default' : 'pointer',
                    fontFamily: 'Montserrat, sans-serif', opacity: marking ? 0.7 : 1,
                  }}
                >
                  {isLessonCompleted(currentLesson?._id) ? '✓ Completed' : marking ? 'Saving...' : 'Mark as Complete ✓'}
                </button>
              )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0', marginBottom: '20px', borderBottom: '1px solid #374151' }}>
              {(['overview', 'resources'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '10px 20px', background: 'none', border: 'none',
                    borderBottom: activeTab === tab ? '2px solid #E91E63' : '2px solid transparent',
                    color: activeTab === tab ? '#E91E63' : '#6B7280',
                    fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                    fontFamily: 'Montserrat, sans-serif', textTransform: 'capitalize',
                  }}>
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <p style={{ color: '#94A3B8', fontSize: '14px', lineHeight: 1.8 }}>
                {currentLesson?.description?.trim() ||
                 currentLesson?.content?.trim() ||
                 currentLesson?.overview?.trim() ||
                 'No lesson content available.'}
              </p>
            )}

            {activeTab === 'resources' && (
              <div>
                {(() => {
                  const contentKind = detectContentType(currentLesson);
                  const mediaSrc = getMediaSrc(currentLesson);
                  const hasExtraResources = currentLesson?.pdfUrl ||
                    currentLesson?.resources ||
                    currentLesson?.materials ||
                    currentLesson?.files;

                  if (contentKind === 'pdf' && mediaSrc) {
                    return (
                      <a
                        href={mediaSrc}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '12px 16px', backgroundColor: '#1e1b4b',
                          borderRadius: '10px', textDecoration: 'none',
                          color: 'white', fontSize: '14px',
                        }}
                      >
                        📄 Download PDF: {currentLesson?.title}
                      </a>
                    );
                  }
                  if (hasExtraResources) {
                    const resourceUrl = currentLesson?.pdfUrl ||
                      currentLesson?.resources?.[0] ||
                      currentLesson?.materials?.[0] ||
                      currentLesson?.files?.[0];
                    const fullUrl = resourceUrl?.startsWith('http') ? resourceUrl : `${BASE_URL}${resourceUrl}`;
                    return (
                      <a
                        href={fullUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '12px 16px', backgroundColor: '#1e1b4b',
                          borderRadius: '10px', textDecoration: 'none',
                          color: 'white', fontSize: '14px',
                        }}
                      >
                        📄 Download Lesson Resources
                      </a>
                    );
                  }
                  return <p style={{ color: '#6B7280', fontSize: '14px' }}>No resources for this lesson.</p>;
                })()}
              </div>
            )}

            {/* Bottom nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #374151' }}>
              <button
                onClick={() => {
                  if (currentIndex > 0) {
                    setCurrentIndex(currentIndex - 1);
                    setCurrentLesson(lessons[currentIndex - 1]);
                  }
                }}
                disabled={currentIndex === 0}
                style={{
                  padding: '10px 20px',
                  backgroundColor: currentIndex === 0 ? '#1F2937' : '#374151',
                  color: currentIndex === 0 ? '#6B7280' : 'white',
                  border: 'none', borderRadius: '10px', fontWeight: 700,
                  fontSize: '13px', cursor: currentIndex === 0 ? 'default' : 'pointer',
                  fontFamily: 'Montserrat, sans-serif',
                }}>
                ← Previous
              </button>

              {finalCertEligible ? (
                <button onClick={() => navigate(`/client/courses/${courseId}/certificate`)}
                  style={{ padding: '10px 24px', backgroundColor: '#FFD700', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
                  🏆 View Final Certificate
                </button>
              ) : onlineCertEligible ? (
                <button onClick={() => navigate(`/client/courses/${courseId}/online-certificate`)}
                  style={{ padding: '10px 24px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
                  🎓 View Online Certificate
                </button>
              ) : onlineCompleted && !quizPassed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 24px', backgroundColor: '#EEF0FF', borderRadius: '10px' }}>
                  <span style={{ fontSize: '14px', color: '#5B62B3', fontWeight: 600 }}>Online lessons complete!</span>
                  <button onClick={() => navigate(`/client/courses/${courseId}/quiz`)}
                    style={{ padding: '8px 16px', backgroundColor: '#E91E63', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', whiteSpace: 'nowrap' }}>
                    Take Quiz 📝
                  </button>
                </div>
              ) : null}

              <button
                onClick={() => {
                  if (currentIndex < lessons.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                    setCurrentLesson(lessons[currentIndex + 1]);
                  }
                }}
                disabled={currentIndex === lessons.length - 1}
                style={{
                  padding: '10px 20px',
                  backgroundColor: currentIndex === lessons.length - 1 ? '#1F2937' : '#5B62B3',
                  color: currentIndex === lessons.length - 1 ? '#6B7280' : 'white',
                  border: 'none', borderRadius: '10px', fontWeight: 700,
                  fontSize: '13px',
                  cursor: currentIndex === lessons.length - 1 ? 'default' : 'pointer',
                  fontFamily: 'Montserrat, sans-serif',
                }}>
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Right — sidebar */}
        {sidebarOpen && (
          <div style={{ width: '320px', flexShrink: 0, backgroundColor: '#1e1b4b', overflowY: 'auto', borderLeft: '1px solid #374151' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #374151', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>Course Content</span>
              <span style={{ color: '#94A3B8', fontSize: '12px' }}>{completedCount}/{lessons.length} completed</span>
            </div>
            {lessons.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>
                <p style={{ fontSize: '14px' }}>No lessons added to this course yet.</p>
              </div>
            ) : (
              lessons.map((lesson: any, idx: number) => {
                const done = isLessonCompleted(lesson._id);
                const isCurrent = idx === currentIndex;
                const kind = detectContentType(lesson);
                const icon = kind === 'video' ? '▶' : kind === 'pdf' ? '📄' : '•';
                return (
                  <div key={lesson._id}
                    onClick={() => { setCurrentIndex(idx); setCurrentLesson(lesson); }}
                    style={{
                      padding: '14px 20px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '12px',
                      backgroundColor: isCurrent ? 'rgba(233,30,99,0.15)' : 'transparent',
                      borderLeft: isCurrent ? '3px solid #E91E63' : '3px solid transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!isCurrent) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={e => { if (!isCurrent) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                  >
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                      backgroundColor: done ? '#10B981' : isCurrent ? '#E91E63' : '#374151',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', color: 'white', fontWeight: 700,
                    }}>
                      {done ? '✓' : idx + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0, fontSize: '13px',
                        fontWeight: isCurrent ? 700 : 500,
                        color: isCurrent ? 'white' : '#94A3B8',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {lesson.title}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6B7280' }}>
                        {icon} {kind !== 'none' ? kind.toUpperCase() : (lesson.contentType || 'Video')} • {lesson.duration || 0} min
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