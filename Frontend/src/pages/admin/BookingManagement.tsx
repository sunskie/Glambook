// Frontend/src/pages/Admin/BookingManagement.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, Search, Mail, Phone, CheckCircle, Clock, XCircle } from 'lucide-react';
import adminService from '../../services/api/adminService';
import showToast from '../../components/common/Toast';

interface Booking {
  _id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceId?: { title: string; category: string };
  vendorId?: { name: string; email: string };
  bookingDate: string;
  bookingTime: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  pending:   { bg: '#FFF7ED', text: '#92400E', icon: <Clock size={12} /> },
  confirmed: { bg: '#DCFCE7', text: '#166534', icon: <CheckCircle size={12} /> },
  cancelled: { bg: '#FEE2E2', text: '#991B1B', icon: <XCircle size={12} /> },
  completed: { bg: '#EEF2FF', text: '#3730A3', icon: <CheckCircle size={12} /> },
};

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchBookings(); }, [search, statusFilter, page]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // ✅ FIXED: response.bookings (not response.data.bookings)
      const response: any = await adminService.getAllBookingsAdmin({
        search: search || undefined,
        status: statusFilter || undefined,
        page,
        limit: 10,
      });
      setBookings(response.bookings || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotal(response.pagination?.total || 0);
    } catch {
      showToast.error('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, backgroundColor: cfg.bg, color: cfg.text }}>
        {cfg.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111', margin: 0 }}>Booking Management</h1>
        <p style={{ color: '#666', marginTop: '6px' }}>{total} total booking{total !== 1 ? 's' : ''}</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by client name or email..."
            style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', minWidth: '150px' }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Calendar size={48} style={{ color: '#D1D5DB', marginBottom: '12px' }} />
            <p style={{ color: '#666', fontWeight: 600 }}>No bookings found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Client', 'Service', 'Vendor', 'Date & Time', 'Price', 'Status'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr key={b._id} style={{ borderBottom: i < bookings.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#111' }}>{b.clientName}</div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={11} />{b.clientEmail}
                      </div>
                      {b.clientPhone && (
                        <div style={{ fontSize: '12px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={11} />{b.clientPhone}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151' }}>
                      {typeof b.serviceId === 'object' ? b.serviceId?.title : '—'}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151' }}>
                      {typeof b.vendorId === 'object' ? b.vendorId?.name : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '14px', color: '#374151', fontWeight: 500 }}>
                        {new Date(b.bookingDate).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{b.bookingTime}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, color: '#111' }}>
                      Rs. {b.totalPrice?.toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge status={b.status} />
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
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: page === 1 ? '#F9FAFB' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
            Previous
          </button>
          <span style={{ padding: '8px 16px', fontSize: '14px', color: '#374151' }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: page === totalPages ? '#F9FAFB' : 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;