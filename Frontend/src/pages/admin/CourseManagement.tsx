// Frontend/src/pages/Admin/CourseManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  BookOpen, Search, CheckCircle, XCircle, Trash2,
  AlertCircle, DollarSign, Clock, Users
} from 'lucide-react';
import adminService from '../../services/api/adminService';
import showToast from '../../components/common/Toast';
import ConfirmModal from '../../components/common/ConfirmModal';

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

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean; type: 'approve' | 'reject' | 'delete'; courseId: string; courseTitle: string;
  }>({ open: false, type: 'approve', courseId: '', courseTitle: '' });

  useEffect(() => { fetchCourses(); }, [search, statusFilter, page]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // ✅ FIXED: response.courses (not response.data.courses)
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

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      pending:  { bg: '#FFF7ED', text: '#92400E' },
      approved: { bg: '#DCFCE7', text: '#166534' },
      active:   { bg: '#EEF2FF', text: '#3730A3' },
      rejected: { bg: '#FEE2E2', text: '#991B1B' },
    };
    const c = map[status] || { bg: '#F3F4F6', text: '#374151' };
    return (
      <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, backgroundColor: c.bg, color: c.text }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const pendingCount = courses.filter(c => c.status === 'pending').length;

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Montserrat, sans-serif' }}>
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

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search courses..."
            style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', minWidth: '150px' }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="active">Active</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600, color: '#111' }}>
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
                        {course.status === 'pending' && (
                          <>
                            <button onClick={() => setConfirmModal({ open: true, type: 'approve', courseId: course._id, courseTitle: course.title })}
                              style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#DCFCE7', color: '#166534', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button onClick={() => setConfirmModal({ open: true, type: 'reject', courseId: course._id, courseTitle: course.title })}
                              style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#FEE2E2', color: '#991B1B', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <XCircle size={12} /> Reject
                            </button>
                          </>
                        )}
                        <button onClick={() => setConfirmModal({ open: true, type: 'delete', courseId: course._id, courseTitle: course.title })}
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

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: page === 1 ? '#F9FAFB' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Previous</button>
          <span style={{ padding: '8px 16px', fontSize: '14px', color: '#374151' }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: page === totalPages ? '#F9FAFB' : 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Next</button>
        </div>
      )}

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