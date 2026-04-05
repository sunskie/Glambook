// Frontend/src/pages/Admin/EnrollmentManagement.tsx
import React, { useState, useEffect } from 'react';
import { GraduationCap, Search, Mail, Phone, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react';
import adminService from '../../services/api/adminService';
import showToast from '../../components/common/Toast';

interface Enrollment {
  _id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  courseId?: { title: string; category: string };
  vendorId?: { name: string };
  status: string;
  progress: number;
  totalPrice: number;
  paymentStatus: string;
  enrollmentDate: string;
  createdAt: string;
}

const EnrollmentManagement: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchEnrollments(); }, [search, statusFilter, page]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      // ✅ FIXED: response.enrollments (not response.data.enrollments)
      const response: any = await adminService.getAllEnrollmentsAdmin({
        search: search || undefined,
        status: statusFilter || undefined,
        page,
        limit: 10,
      });
      setEnrollments(response.enrollments || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotal(response.pagination?.total || 0);
    } catch {
      showToast.error('Failed to load enrollments');
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      enrolled:   { bg: '#EEF2FF', text: '#3730A3', icon: <TrendingUp size={11} /> },
      completed:  { bg: '#DCFCE7', text: '#166534', icon: <CheckCircle size={11} /> },
      cancelled:  { bg: '#FEE2E2', text: '#991B1B', icon: <XCircle size={11} /> },
      pending:    { bg: '#FFF7ED', text: '#92400E', icon: <Clock size={11} /> },
    };
    const c = map[status] || { bg: '#F3F4F6', text: '#374151', icon: null };
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, backgroundColor: c.bg, color: c.text }}>
        {c.icon}{status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      paid:    { bg: '#DCFCE7', text: '#166534' },
      pending: { bg: '#FFF7ED', text: '#92400E' },
      refunded:{ bg: '#F3F4F6', text: '#374151' },
    };
    const c = map[status] || { bg: '#F3F4F6', text: '#374151' };
    return (
      <span style={{ padding: '3px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, backgroundColor: c.bg, color: c.text }}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111', margin: 0 }}>Enrollment Management</h1>
        <p style={{ color: '#666', marginTop: '6px' }}>{total} total enrollment{total !== 1 ? 's' : ''}</p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search enrollments..."
            style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', minWidth: '150px' }}>
          <option value="">All Status</option>
          <option value="enrolled">Enrolled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>Loading enrollments...</div>
        ) : enrollments.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <GraduationCap size={48} style={{ color: '#D1D5DB', marginBottom: '12px' }} />
            <p style={{ color: '#666', fontWeight: 600 }}>No enrollments found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Student', 'Course', 'Progress', 'Price', 'Payment', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e, i) => (
                  <tr key={e._id} style={{ borderBottom: i < enrollments.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#111' }}>{e.clientName}</div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Mail size={11} />{e.clientEmail}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151', maxWidth: '200px' }}>
                      {typeof e.courseId === 'object' ? e.courseId?.title : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '64px', height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${e.progress || 0}%`, height: '100%', backgroundColor: '#5B62B3', borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>{e.progress || 0}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, color: '#111' }}>
                      Rs. {e.totalPrice?.toLocaleString() || '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>{getPaymentBadge(e.paymentStatus || 'pending')}</td>
                    <td style={{ padding: '14px 16px' }}>{getStatusBadge(e.status)}</td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6B7280' }}>
                      {new Date(e.createdAt).toLocaleDateString()}
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
    </div>
  );
};

export default EnrollmentManagement;