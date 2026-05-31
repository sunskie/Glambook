// Frontend/src/pages/Admin/CourseManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  BookOpen, Search, CheckCircle, XCircle, Trash2,
  AlertCircle, Clock, Users, Eye, X, MapPin, Calendar,
  Award, FileText, Video, ChevronDown, ChevronUp
} from 'lucide-react';
import adminService from '../../services/api/adminService';
import showToast from '../../components/common/Toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import api from '../../utils/api';

interface Batch {
  _id: string;
  startDate: string;
  endDate: string;
  location: string;
  seatsTotal: number;
  seatsRemaining: number;
  schedule: string;
  status: string;
}

interface Lesson {
  _id: string;
  title: string;
  description: string;
  duration: number;
  contentType: string;
  contentUrl: string;
  isPreview: boolean;
}

interface CourseDetail {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPrice: number | null;
  duration: number;
  level: string;
  status: string;
  enrollmentCount: number;
  vendorId?: { _id: string; name: string; email: string };
  createdAt: string;
  imageUrl: string | null;
  instructorName: string;
  instructorBio: string;
  whatYouWillLearn: string[];
  requirements: string[];
  certificateIncluded: boolean;
  courseFormat: {
    theoryHours: number;
    practicalHours: number;
    onlineContent: boolean;
    physicalClasses: boolean;
  };
  lessons: Lesson[];
  batches: Batch[];
}

interface Course {
  _id: string;
  title: string;
  category: string;
  price: number;
  duration: number;
  level: string;
  status: string;
  enrollmentCount: number;
  vendorId?: { name: string; email: string };
  createdAt: string;
}

const resolveImage = (url: string | null) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://localhost:5000${url}`;
};

/* ─── View Course Modal ─────────────────────────────────────── */
const ViewCourseModal: React.FC<{
  courseId: string;
  onClose: () => void;
  onApprove: (id: string, title: string) => void;
  onReject: (id: string, title: string) => void;
}> = ({ courseId, onClose, onApprove, onReject }) => {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [openLesson, setOpenLesson] = useState<number>(0);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res: any = await api.get(`/courses/${courseId}`);
        setCourse(res?.data?.data || res?.data || null);
      } catch {
        showToast.error('Failed to load course details');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  if (loading) return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, fontFamily: 'Montserrat, sans-serif',
    }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '48px 64px', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #E2E8F0', borderTopColor: '#5B62B3', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color: '#64748B', fontWeight: 600 }}>Loading course...</p>
      </div>
    </div>
  );

  if (!course) return null;

  const img = resolveImage(course.imageUrl);

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, fontFamily: 'Montserrat, sans-serif', padding: '24px',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '20px',
        width: '100%', maxWidth: '780px', maxHeight: '90vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #F3F4F6',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#111' }}>
              Course Review
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9CA3AF' }}>
              Review before approving or rejecting
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {course.status === 'pending' && (
              <>
                <button
                  onClick={() => { onClose(); onApprove(course._id, course.title); }}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', border: 'none',
                    backgroundColor: '#DCFCE7', color: '#166534',
                    fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                  <CheckCircle size={14} /> Approve
                </button>
                <button
                  onClick={() => { onClose(); onReject(course._id, course.title); }}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', border: 'none',
                    backgroundColor: '#FEE2E2', color: '#991B1B',
                    fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                  <XCircle size={14} /> Reject
                </button>
              </>
            )}
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9CA3AF', padding: '4px', borderRadius: '6px',
              display: 'flex', alignItems: 'center',
            }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>

          {/* Hero image + title */}
          <div style={{
            height: '180px', backgroundColor: '#1e1b4b', position: 'relative',
            overflow: 'hidden', flexShrink: 0,
          }}>
            {img
              ? <img src={img} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1e1b4b,#5B62B3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>🎓</div>
            }
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
              display: 'flex', alignItems: 'flex-end', padding: '20px 24px',
            }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.3)' }}>
                    {course.category}
                  </span>
                  <span style={{
                    backgroundColor: course.level === 'beginner' ? '#10B981' : course.level === 'intermediate' ? '#3B82F6' : '#F59E0B',
                    color: 'white', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px',
                  }}>
                    {course.level}
                  </span>
                  <span style={{
                    backgroundColor: course.status === 'pending' ? '#F59E0B' : course.status === 'approved' ? '#10B981' : '#EF4444',
                    color: 'white', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px',
                  }}>
                    {course.status.toUpperCase()}
                  </span>
                </div>
                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>
                  {course.title}
                </h1>
              </div>
            </div>
          </div>

          <div style={{ padding: '24px' }}>

            {/* Stats row */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px',
            }}>
              {[
                { icon: '💰', label: 'Price', value: `Rs. ${course.price?.toLocaleString()}` },
                { icon: '⏱', label: 'Duration', value: `${course.duration}h` },
                { icon: '📚', label: 'Lessons', value: `${course.lessons?.length || 0}` },
                { icon: '👥', label: 'Enrolled', value: `${course.enrollmentCount}` },
              ].map(stat => (
                <div key={stat.label} style={{
                  backgroundColor: '#F8F9FC', borderRadius: '12px', padding: '14px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#111' }}>{stat.value}</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Vendor + Instructor */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#F8F9FC', borderRadius: '12px', padding: '16px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vendor</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#111' }}>
                  {typeof course.vendorId === 'object' ? course.vendorId?.name : '—'}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                  {typeof course.vendorId === 'object' ? course.vendorId?.email : ''}
                </p>
              </div>
              <div style={{ backgroundColor: '#F8F9FC', borderRadius: '12px', padding: '16px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Instructor</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#111' }}>{course.instructorName}</p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
                  {course.instructorBio || 'No bio provided'}
                </p>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 800, color: '#111' }}>Description</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.7 }}>
                {course.description}
              </p>
            </div>

            {/* What students will learn */}
            {course.whatYouWillLearn?.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 800, color: '#111' }}>
                  What Students Will Learn
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {course.whatYouWillLearn.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <CheckCircle size={14} style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Format */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 800, color: '#111' }}>Course Format</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' as const }}>
                {course.courseFormat?.onlineContent && (
                  <span style={{ padding: '6px 14px', backgroundColor: '#EEF2FF', color: '#3730A3', borderRadius: '8px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Video size={12} /> Online · {course.courseFormat.theoryHours}h theory
                  </span>
                )}
                {course.courseFormat?.physicalClasses && (
                  <span style={{ padding: '6px 14px', backgroundColor: '#F0FDF4', color: '#166534', borderRadius: '8px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={12} /> Physical · {course.courseFormat.practicalHours}h practical
                  </span>
                )}
                {course.certificateIncluded && (
                  <span style={{ padding: '6px 14px', backgroundColor: '#FEF3C7', color: '#92400E', borderRadius: '8px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={12} /> Certificate included
                  </span>
                )}
              </div>
            </div>

            {/* Lessons */}
            {course.lessons?.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 800, color: '#111' }}>
                  Lessons ({course.lessons.length})
                </h3>
                <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
                  {course.lessons.map((lesson, i) => (
                    <div key={i} style={{
                      borderBottom: i < course.lessons.length - 1 ? '1px solid #F3F4F6' : 'none',
                    }}>
                      <div
                        onClick={() => setOpenLesson(openLesson === i ? -1 : i)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 16px', cursor: 'pointer', backgroundColor: openLesson === i ? '#F8F9FC' : 'white',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '8px',
                            backgroundColor: lesson.contentType === 'video' ? '#FFF0F5' : '#EEF2FF',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            {lesson.contentType === 'video'
                              ? <Video size={12} style={{ color: '#E91E63' }} />
                              : <FileText size={12} style={{ color: '#5B62B3' }} />
                            }
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111' }}>
                              {i + 1}. {lesson.title}
                            </p>
                            <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF' }}>
                              {lesson.duration} min · {lesson.contentType}
                              {lesson.contentUrl ? ' · ✅ File uploaded' : ' · ⚠️ No file'}
                            </p>
                          </div>
                        </div>
                        {openLesson === i ? <ChevronUp size={14} style={{ color: '#9CA3AF' }} /> : <ChevronDown size={14} style={{ color: '#9CA3AF' }} />}
                      </div>
                      {openLesson === i && lesson.description && (
                        <div style={{ padding: '0 16px 12px 54px' }}>
                          <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: 1.5 }}>
                            {lesson.description}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Batches */}
            {course.batches?.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 800, color: '#111' }}>
                  Batches ({course.batches.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {course.batches.map((batch, i) => (
                    <div key={i} style={{
                      padding: '14px 16px', borderRadius: '12px',
                      border: '1px solid #E5E7EB', backgroundColor: '#F8F9FC',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <span style={{
                          fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px',
                          backgroundColor: batch.status === 'open' ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)',
                          color: batch.status === 'open' ? '#065F46' : '#475569',
                        }}>
                          {batch.status === 'open' ? 'Open' : batch.status}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                          {batch.seatsRemaining}/{batch.seatsTotal} seats left
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '12px', color: '#475569' }}>
                          <Calendar size={11} style={{ color: '#5B62B3' }} />
                          {new Date(batch.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} –{' '}
                          {new Date(batch.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        {batch.location && (
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '12px', color: '#475569' }}>
                            <MapPin size={11} style={{ color: '#5B62B3' }} /> {batch.location}
                          </div>
                        )}
                        {batch.schedule && (
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '12px', color: '#475569' }}>
                            <Clock size={11} style={{ color: '#5B62B3' }} /> {batch.schedule}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        {course.status === 'pending' && (
          <div style={{
            padding: '16px 24px', borderTop: '1px solid #F3F4F6',
            display: 'flex', gap: '10px', justifyContent: 'flex-end',
            backgroundColor: '#FAFAFA', flexShrink: 0,
          }}>
            <button onClick={onClose} style={{
              padding: '10px 20px', borderRadius: '10px',
              border: '1.5px solid #E5E7EB', backgroundColor: 'white',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#374151',
            }}>
              Cancel
            </button>
            <button
              onClick={() => { onClose(); onReject(course._id, course.title); }}
              style={{
                padding: '10px 20px', borderRadius: '10px', border: 'none',
                backgroundColor: '#FEE2E2', color: '#991B1B',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
              <XCircle size={14} /> Reject Course
            </button>
            <button
              onClick={() => { onClose(); onApprove(course._id, course.title); }}
              style={{
                padding: '10px 20px', borderRadius: '10px', border: 'none',
                backgroundColor: '#16A34A', color: 'white',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
              <CheckCircle size={14} /> Approve Course
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────── */
const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewCourseId, setViewCourseId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean; type: 'approve' | 'reject' | 'delete'; courseId: string; courseTitle: string;
  }>({ open: false, type: 'approve', courseId: '', courseTitle: '' });

  useEffect(() => { fetchCourses(); }, [search, statusFilter, page]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response: any = await adminService.getAllCoursesAdmin({
        search: search || undefined,
        status: statusFilter || undefined,
        page,
        limit: 10,
      });
      setCourses(response.courses || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotal(response.pagination?.total || 0);
    } catch {
      showToast.error('Failed to load courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    try {
      setActionLoading(true);
      if (confirmModal.type === 'approve') {
        await adminService.approveCourse(confirmModal.courseId);
        showToast.success('Course approved');
      } else if (confirmModal.type === 'reject') {
        await adminService.rejectCourse(confirmModal.courseId);
        showToast.success('Course rejected');
      } else {
        await adminService.deleteCourseAdmin(confirmModal.courseId);
        showToast.success('Course deleted');
      }
      setConfirmModal({ open: false, type: 'approve', courseId: '', courseTitle: '' });
      fetchCourses();
    } catch {
      showToast.error('Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const openApprove = (id: string, title: string) =>
    setConfirmModal({ open: true, type: 'approve', courseId: id, courseTitle: title });

  const openReject = (id: string, title: string) =>
    setConfirmModal({ open: true, type: 'reject', courseId: id, courseTitle: title });

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      pending:  { bg: '#FFF7ED', text: '#92400E' },
      approved: { bg: '#DCFCE7', text: '#166534' },
      active:   { bg: '#EEF2FF', text: '#3730A3' },
      rejected: { bg: '#FEE2E2', text: '#991B1B' },
    };
    const c = map[status] || { bg: '#F3F4F6', text: '#374151' };
    return (
      <span style={{
        padding: '3px 10px', borderRadius: '999px', fontSize: '12px',
        fontWeight: 600, backgroundColor: c.bg, color: c.text,
      }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const pendingCount = courses.filter(c => c.status === 'pending').length;

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Montserrat, sans-serif' }}>

      {/* View Modal */}
      {viewCourseId && (
        <ViewCourseModal
          courseId={viewCourseId}
          onClose={() => setViewCourseId(null)}
          onApprove={openApprove}
          onReject={openReject}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111', margin: 0 }}>Course Management</h1>
          <p style={{ color: '#666', marginTop: '6px' }}>{total} total course{total !== 1 ? 's' : ''}</p>
        </div>
        {pendingCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFF7ED', border: '1px solid #FED7AA', padding: '10px 16px', borderRadius: '8px' }}>
            <AlertCircle size={16} style={{ color: '#F59E0B' }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#92400E' }}>{pendingCount} pending review</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search courses..."
            style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', minWidth: '150px' }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="active">Active</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>Loading courses...</div>
        ) : courses.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <BookOpen size={48} style={{ color: '#D1D5DB', marginBottom: '12px' }} />
            <p style={{ color: '#666', fontWeight: 600 }}>No courses found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Course', 'Vendor', 'Price', 'Duration', 'Enrolled', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courses.map((course, i) => (
                  <tr key={course._id} style={{ borderBottom: i < courses.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#111', maxWidth: '220px' }}>{course.title}</div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                        {course.category} · {course.level}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151' }}>
                      {typeof course.vendorId === 'object' ? course.vendorId?.name : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#111' }}>
                        Rs. {course.price?.toLocaleString()}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#374151' }}>
                        <Clock size={13} style={{ color: '#9CA3AF' }} /> {course.duration}h
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#374151' }}>
                        <Users size={13} style={{ color: '#9CA3AF' }} /> {course.enrollmentCount}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>{getStatusBadge(course.status)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {/* View button — always visible */}
                        <button
                          onClick={() => setViewCourseId(course._id)}
                          style={{
                            padding: '6px 10px', borderRadius: '6px',
                            border: '1px solid #E5E7EB', backgroundColor: '#F8F9FC',
                            color: '#374151', fontSize: '12px', fontWeight: 600,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px',
                          }}>
                          <Eye size={12} /> View
                        </button>

                        {course.status === 'pending' && (
                          <>
                            <button
                              onClick={() => openApprove(course._id, course.title)}
                              style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#DCFCE7', color: '#166534', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button
                              onClick={() => openReject(course._id, course.title)}
                              style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#FEE2E2', color: '#991B1B', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <XCircle size={12} /> Reject
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => setConfirmModal({ open: true, type: 'delete', courseId: course._id, courseTitle: course.title })}
                          style={{ padding: '6px', borderRadius: '6px', border: '1px solid #FEE2E2', backgroundColor: '#FFF5F5', color: '#DC2626', cursor: 'pointer' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: page === 1 ? '#F9FAFB' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
            Previous
          </button>
          <span style={{ padding: '8px 16px', fontSize: '14px', color: '#374151' }}>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: page === totalPages ? '#F9FAFB' : 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
            Next
          </button>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, type: 'approve', courseId: '', courseTitle: '' })}
        onConfirm={handleAction}
        loading={actionLoading}
        title={confirmModal.type === 'approve' ? 'Approve Course' : confirmModal.type === 'reject' ? 'Reject Course' : 'Delete Course'}
        message={confirmModal.type === 'delete'
          ? `Permanently delete "${confirmModal.courseTitle}"?`
          : `${confirmModal.type === 'approve' ? 'Approve' : 'Reject'} the course "${confirmModal.courseTitle}"?`}
        confirmText={confirmModal.type === 'approve' ? 'Approve' : confirmModal.type === 'reject' ? 'Reject' : 'Delete'}
      />
    </div>
  );
};

export default CourseManagement;