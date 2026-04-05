import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  LayoutDashboard,
  Store,
  GraduationCap,
  DollarSign,
  Star,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import vendorBookingService from '../../services/api/vendorBookingService';
import reviewService, { Review } from '../../services/api/reviewService';
import showToast from '../../components/common/Toast';

interface Booking {
  _id: string;
  clientId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  } | null;
  serviceId: {
    _id: string;
    title: string;
    category: string;
    price: number;
    duration: number;
  } | null;
  bookingDate: string;
  bookingTime: string;
  duration: number;
  totalPrice: number;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
}

const STATUS_CONFIG = {
  pending:   { bg: '#FFF7ED', color: '#92400E', label: 'Pending',   icon: <AlertCircle size={14} /> },
  confirmed: { bg: '#DCFCE7', color: '#166534', label: 'Confirmed', icon: <CheckCircle size={14} /> },
  cancelled: { bg: '#FEE2E2', color: '#991B1B', label: 'Cancelled', icon: <XCircle size={14} /> },
  completed: { bg: '#EEF2FF', color: '#3730A3', label: 'Completed', icon: <CheckCircle size={14} /> },
};

const VendorBookings: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats>({ total: 0, pending: 0, confirmed: 0, cancelled: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [serviceReviews, setServiceReviews] = useState<Array<{ review: Review; serviceTitle: string }>>([]);
  const [reviewsAvg, setReviewsAvg] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  useEffect(() => {
    if (loading) return;
    const loadReviews = async () => {
      const ids = [...new Set(bookings.map(b => b.serviceId?._id).filter(Boolean))] as string[];
      if (ids.length === 0) {
        setServiceReviews([]);
        setReviewsAvg(0);
        return;
      }
      setReviewsLoading(true);
      try {
        const results = await Promise.all(ids.map(sid => reviewService.getReviewsByTarget('service', sid)));
        const flat: Array<{ review: Review; serviceTitle: string }> = [];
        let sum = 0;
        let n = 0;
        ids.forEach((sid, idx) => {
          const res = results[idx] as { data?: Review[] };
          const list = res?.data || [];
          const title = bookings.find(b => b.serviceId?._id === sid)?.serviceId?.title || 'Service';
          list.forEach((r: Review) => {
            flat.push({ review: r, serviceTitle: title });
            sum += r.rating;
            n += 1;
          });
        });
        flat.sort((a, b) => new Date(b.review.createdAt).getTime() - new Date(a.review.createdAt).getTime());
        setServiceReviews(flat);
        setReviewsAvg(n ? sum / n : 0);
      } catch {
        showToast.error('Failed to load reviews');
      } finally {
        setReviewsLoading(false);
      }
    };
    loadReviews();
  }, [bookings, loading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, statsRes]: any[] = await Promise.all([
        vendorBookingService.getVendorBookings({
          status: statusFilter !== 'all' ? statusFilter : undefined,
        }),
        vendorBookingService.getBookingStats(),
      ]);

      // vendorBookingService uses api.ts which auto-unwraps
      // getVendorBookings returns { success, data: [], total, page, totalPages }
      setBookings(bookingsRes.data || []);
      // getBookingStats returns { success, data: { total, pending, confirmed, cancelled, completed } }
      setStats(statsRes.data || { total: 0, pending: 0, confirmed: 0, cancelled: 0, completed: 0 });
    } catch (error: any) {
      showToast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      setUpdatingId(bookingId);
      await vendorBookingService.updateBookingStatus(bookingId, newStatus);
      showToast.success(`Booking ${newStatus}`);
      fetchData();
    } catch (error: any) {
      showToast.error(error.message || 'Failed to update booking');
    } finally {
      setUpdatingId(null);
    }
  };

  // ✅ FIXED: null-safe — use stored clientName as fallback if clientId is null
  const getClientName = (booking: Booking): string => {
    if (booking.clientId && booking.clientId.name) return booking.clientId.name;
    return booking.clientName || 'Unknown Client';
  };

  const getClientEmail = (booking: Booking): string => {
    if (booking.clientId && booking.clientId.email) return booking.clientId.email;
    return booking.clientEmail || '—';
  };

  const getClientPhone = (booking: Booking): string => {
    if (booking.clientId && booking.clientId.phone) return booking.clientId.phone;
    return booking.clientPhone || '—';
  };

  // ✅ FIXED: null-safe — serviceId can be null if service was deleted
  const getServiceName = (booking: Booking): string => {
    if (booking.serviceId && booking.serviceId.title) return booking.serviceId.title;
    return 'Deleted Service';
  };

  const filteredBookings = bookings.filter(b => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      getClientName(b).toLowerCase().includes(q) ||
      getClientEmail(b).toLowerCase().includes(q) ||
      getServiceName(b).toLowerCase().includes(q)
    );
  });

  const StatusBadge = ({ status }: { status: string }) => {
    const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
        backgroundColor: cfg.bg, color: cfg.color,
      }}>
        {cfg.icon} {cfg.label}
      </span>
    );
  };

  const ReviewStars = ({ rating }: { rating: number }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={16}
          strokeWidth={2}
          style={{
            color: i <= Math.round(rating) ? '#F59E0B' : '#D1D5DB',
            fill: i <= Math.round(rating) ? '#F59E0B' : 'transparent',
          }}
        />
      ))}
    </div>
  );

  const reviewerName = (r: Review) =>
    (typeof r.userId === 'object' && r.userId?.name) || (r as any).clientName || 'Client';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA', fontFamily: 'Montserrat, sans-serif' }}>
      {/* Top Nav */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB', padding: '0 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '0' }}>
          {[
            { label: 'Dashboard', icon: <LayoutDashboard size={16} />, path: '/vendor/dashboard' },
            { label: 'Services', icon: <Store size={16} />, path: '/vendor/services/create' },
            { label: 'Bookings', icon: <Calendar size={16} />, path: '/vendor/bookings', active: true },
            { label: 'Courses', icon: <GraduationCap size={16} />, path: '/vendor/courses' },
          ].map(item => (
            <button key={item.label} onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '14px 18px', background: 'none', border: 'none',
                borderBottom: item.active ? '3px solid #5B62B3' : '3px solid transparent',
                color: item.active ? '#5B62B3' : '#6B7280',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif',
              }}>
              {item.icon}{item.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111', margin: 0 }}>My Bookings</h1>
          <p style={{ color: '#666', marginTop: '6px', fontSize: '14px' }}>Manage incoming client bookings</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Total', value: stats.total, color: '#5B62B3', bg: '#EEF2FF' },
            { label: 'Pending', value: stats.pending, color: '#92400E', bg: '#FFF7ED' },
            { label: 'Confirmed', value: stats.confirmed, color: '#166534', bg: '#DCFCE7' },
            { label: 'Completed', value: stats.completed, color: '#1D4ED8', bg: '#DBEAFE' },
            { label: 'Cancelled', value: stats.cancelled, color: '#991B1B', bg: '#FEE2E2' },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by client name, email, or service..."
              style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Montserrat, sans-serif' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                style={{
                  padding: '9px 16px', borderRadius: '8px', border: '1.5px solid',
                  borderColor: statusFilter === s ? '#5B62B3' : '#E5E7EB',
                  backgroundColor: statusFilter === s ? '#5B62B3' : 'white',
                  color: statusFilter === s ? 'white' : '#374151',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
                }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>Loading bookings...</div>
          ) : filteredBookings.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <Calendar size={48} style={{ color: '#D1D5DB', marginBottom: '12px' }} />
              <p style={{ color: '#666', fontWeight: 600, fontSize: '16px' }}>No bookings found</p>
              <p style={{ color: '#9CA3AF', fontSize: '14px' }}>
                {search ? 'Try adjusting your search.' : 'New bookings will appear here when clients book your services.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    {['Client', 'Service', 'Date & Time', 'Price', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking, i) => (
                    <tr key={booking._id} style={{ borderBottom: i < filteredBookings.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                      {/* Client */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#111', marginBottom: '3px' }}>
                          {getClientName(booking)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={11} /> {getClientEmail(booking)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Phone size={11} /> {getClientPhone(booking)}
                        </div>
                      </td>

                      {/* Service */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                          {getServiceName(booking)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                          <Clock size={11} style={{ display: 'inline', marginRight: '3px' }} />
                          {booking.duration} min
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                          {new Date(booking.bookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                          {booking.bookingTime}
                        </div>
                      </td>

                      {/* Price */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#111' }}>
                          Rs. {booking.totalPrice?.toLocaleString()}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge status={booking.status} />
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                                disabled={updatingId === booking._id}
                                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#DCFCE7', color: '#166534', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
                                {updatingId === booking._id ? '...' : 'Confirm'}
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                disabled={updatingId === booking._id}
                                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#FEE2E2', color: '#991B1B', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
                                Cancel
                              </button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(booking._id, 'completed')}
                                disabled={updatingId === booking._id}
                                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#EEF2FF', color: '#3730A3', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
                                {updatingId === booking._id ? '...' : 'Complete'}
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                disabled={updatingId === booking._id}
                                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#FEE2E2', color: '#991B1B', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
                                Cancel
                              </button>
                            </>
                          )}
                          {(booking.status === 'cancelled' || booking.status === 'completed') && (
                            <span style={{ fontSize: '12px', color: '#9CA3AF', padding: '6px 0' }}>No actions</span>
                          )}
                        </div>
                        {booking.specialRequests && (
                          <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '6px', fontStyle: 'italic' }}>
                            Note: {booking.specialRequests}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Client Reviews */}
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111', margin: '0 0 16px', fontFamily: 'Montserrat, sans-serif' }}>
            Client Reviews
          </h2>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px' }}>
            {reviewsLoading ? (
              <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>Loading reviews…</p>
            ) : serviceReviews.length === 0 ? (
              <p style={{ color: '#9CA3AF', fontSize: '14px', margin: 0 }}>No reviews for your booked services yet.</p>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #F3F4F6' }}>
                  <ReviewStars rating={reviewsAvg} />
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#111' }}>{reviewsAvg.toFixed(1)}</span>
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>average ({serviceReviews.length} review{serviceReviews.length !== 1 ? 's' : ''})</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {serviceReviews.map(({ review, serviceTitle }) => (
                    <div key={review._id} style={{ paddingBottom: '20px', borderBottom: '1px solid #F3F4F6' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                        <div>
                          <p style={{ fontSize: '15px', fontWeight: 700, color: '#111', margin: 0 }}>{reviewerName(review)}</p>
                          <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '4px 0 0' }}>{serviceTitle}</p>
                        </div>
                        <ReviewStars rating={review.rating} />
                      </div>
                      {review.title ? (
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#374151', margin: '0 0 6px' }}>{review.title}</p>
                      ) : null}
                      <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>{review.comment}</p>
                      <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '10px 0 0' }}>
                        {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorBookings;