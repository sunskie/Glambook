import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowRight, Plus, BookOpen, Sparkles, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getClientBookings, cancelBooking } from '../../services/api/bookingService';
import reviewService from '../../services/api/reviewService';
import showToast from '../../components/common/Toast';
import ConfirmModal from '../../components/common/ConfirmModal';

interface Booking {
  _id: string;
  serviceId: {
    _id: string;
    title: string;
    category: string;
    imageUrl: string | null;
    price: number;
    duration: number;
  } | string;
  bookingDate: string;
  bookingTime: string;
  totalPrice: number;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: '#FFF7ED', color: '#92400E', label: 'Pending' },
  confirmed: { bg: '#DCFCE7', color: '#166534', label: 'Confirmed' },
  cancelled: { bg: '#FEE2E2', color: '#991B1B', label: 'Cancelled' },
  completed: { bg: '#EEF2FF', color: '#3730A3', label: 'Completed' },
};

const ClientBookings: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'services' | 'courses'>('services');
  const [cancelModal, setCancelModal] = useState<{ open: boolean; bookingId: string; serviceName: string }>({
    open: false, bookingId: '', serviceName: '',
  });
  const [cancelLoading, setCancelLoading] = useState(false);

  // Review modal state
  const [reviewModal, setReviewModal] = useState<{
    open: boolean;
    bookingId: string;
    serviceId: string;
    serviceName: string;
  }>({ open: false, bookingId: '', serviceId: '', serviceName: '' });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'services') fetchBookings();
  }, [selectedStatus, activeTab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // response is auto-unwrapped by api.ts → { success, count, bookings: [...] }
      const response: any = await getClientBookings({
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      });
      setBookings(response.bookings || []);
    } catch (error: any) {
      showToast.error('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    try {
      setCancelLoading(true);
      await cancelBooking(cancelModal.bookingId);
      showToast.success('Booking cancelled successfully');
      setCancelModal({ open: false, bookingId: '', serviceName: '' });
      fetchBookings();
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      showToast.error('Please write a comment');
      return;
    }
    try {
      setReviewLoading(true);
      await reviewService.createReview({
        targetType: 'service',
        targetId: reviewModal.serviceId,
        rating: reviewRating,
        title: `Review for ${reviewModal.serviceName}`,
        comment: reviewComment.trim(),
      });
      showToast.success('Review submitted! Thank you.');
      setReviewModal({ open: false, bookingId: '', serviceId: '', serviceName: '' });
      setReviewRating(5);
      setReviewComment('');
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const getServiceTitle = (serviceId: Booking['serviceId']) => {
    if (typeof serviceId === 'object' && serviceId !== null) return serviceId.title;
    return 'Service';
  };

  const getServiceImage = (serviceId: Booking['serviceId']) => {
    if (typeof serviceId === 'object' && serviceId !== null && serviceId.imageUrl) {
      return serviceId.imageUrl.startsWith('http')
        ? serviceId.imageUrl
        : `http://localhost:5000${serviceId.imageUrl}`;
    }
    return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&q=80';
  };

  const canCancel = (booking: Booking) =>
    booking.status === 'pending' || booking.status === 'confirmed';

  const statusTabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA', fontFamily: 'Montserrat, sans-serif' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB', padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111', margin: 0 }}>My Bookings</h1>
            <p style={{ color: '#666', marginTop: '4px', fontSize: '14px' }}>Manage your service bookings and course enrollments</p>
          </div>
          <button
            onClick={() => navigate('/client/services')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#5B62B3', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}
          >
            <Plus size={16} /> Book New Service
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {/* Main Tabs: Services / Courses */}
        <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid #E5E7EB', marginBottom: '28px' }}>
          {[{ key: 'services', label: '💆 Services', icon: <Sparkles size={15} /> },
            { key: 'courses', label: '📚 Courses', icon: <BookOpen size={15} /> }].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '14px 28px', background: 'none', border: 'none', fontFamily: 'Montserrat, sans-serif',
                fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                color: activeTab === tab.key ? '#5B62B3' : '#6B7280',
                borderBottom: `3px solid ${activeTab === tab.key ? '#5B62B3' : 'transparent'}`,
                marginBottom: '-2px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── SERVICES TAB ── */}
        {activeTab === 'services' && (
          <>
            {/* Status filter tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {statusTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setSelectedStatus(tab.key); }}
                  style={{
                    padding: '7px 16px', borderRadius: '999px', border: '1.5px solid',
                    borderColor: selectedStatus === tab.key ? '#5B62B3' : '#E5E7EB',
                    backgroundColor: selectedStatus === tab.key ? '#5B62B3' : 'white',
                    color: selectedStatus === tab.key ? 'white' : '#374151',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>Loading bookings...</div>
            ) : bookings.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                <Calendar size={56} style={{ color: '#D1D5DB', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#374151', margin: '0 0 8px' }}>No bookings found</h3>
                <p style={{ color: '#9CA3AF', marginBottom: '24px' }}>
                  {selectedStatus === 'all' ? "You haven't made any bookings yet." : `No ${selectedStatus} bookings.`}
                </p>
                <button
                  onClick={() => navigate('/client/services')}
                  style={{ padding: '12px 24px', backgroundColor: '#5B62B3', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}
                >
                  Browse Services
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {bookings.map(booking => {
                  const ss = STATUS_STYLE[booking.status] || STATUS_STYLE.pending;
                  return (
                    <div key={booking._id} style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', display: 'flex', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                      {/* Image */}
                      <div style={{ width: '100px', flexShrink: 0 }}>
                        <img
                          src={getServiceImage(booking.serviceId)}
                          alt={getServiceTitle(booking.serviceId)}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&q=80'; }}
                        />
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#111', margin: '0 0 6px' }}>
                            {getServiceTitle(booking.serviceId)}
                          </h3>
                          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: '#6B7280' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Calendar size={13} />
                              {new Date(booking.bookingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Clock size={13} /> {booking.bookingTime}
                            </span>
                          </div>
                          <div style={{ marginTop: '8px', fontSize: '14px', fontWeight: 700, color: '#5B62B3' }}>
                            Rs. {booking.totalPrice?.toLocaleString()}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                          <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, backgroundColor: ss.bg, color: ss.color }}>
                            {ss.label}
                          </span>
                          {canCancel(booking) && (
                            <button
                              onClick={() => setCancelModal({ open: true, bookingId: booking._id, serviceName: getServiceTitle(booking.serviceId) })}
                              style={{ padding: '6px 14px', backgroundColor: 'white', color: '#DC2626', border: '1.5px solid #DC2626', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}
                            >
                              Cancel
                            </button>
                          )}
                          {booking.status === 'completed' && typeof booking.serviceId === 'object' && booking.serviceId !== null && (
                            <button
                              onClick={() => {
                                const svc = booking.serviceId as { _id: string; title: string };
                                setReviewModal({ open: true, bookingId: booking._id, serviceId: svc._id, serviceName: svc.title });
                                setReviewRating(5);
                                setReviewComment('');
                              }}
                              style={{ padding: '6px 14px', backgroundColor: '#5B62B3', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Star size={12} /> Leave Review
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── COURSES TAB ── */}
        {activeTab === 'courses' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              onClick={() => navigate('/client/my-courses')}
              style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'box-shadow 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(91,98,179,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '12px', backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={24} style={{ color: '#5B62B3' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111', margin: 0 }}>My Enrolled Courses</h3>
                  <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0' }}>View progress, lessons & certificates</p>
                </div>
              </div>
              <ArrowRight size={20} style={{ color: '#5B62B3' }} />
            </div>

            <div
              onClick={() => navigate('/client/courses')}
              style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'box-shadow 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(233,30,99,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '12px', backgroundColor: '#FFF0F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={24} style={{ color: '#E91E63' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111', margin: 0 }}>Browse More Courses</h3>
                  <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0' }}>Discover new beauty & wellness courses</p>
                </div>
              </div>
              <ArrowRight size={20} style={{ color: '#E91E63' }} />
            </div>
          </div>
        )}
      </div>

      {/* Cancel Confirm Modal */}
      <ConfirmModal
        isOpen={cancelModal.open}
        onClose={() => setCancelModal({ open: false, bookingId: '', serviceName: '' })}
        onConfirm={handleCancelBooking}
        loading={cancelLoading}
        title="Cancel Booking"
        message={`Cancel your booking for "${cancelModal.serviceName}"? This cannot be undone.`}
        confirmText="Yes, Cancel"
        cancelText="Keep Booking"
      />

      {/* ── Review Modal ── */}
      {reviewModal.open && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', fontFamily: 'Montserrat, sans-serif' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111', margin: '0 0 4px' }}>Leave a Review</h2>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px' }}>{reviewModal.serviceName}</p>

            {/* Star Rating */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '10px' }}>Your Rating</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onMouseEnter={() => setReviewHover(star)}
                    onMouseLeave={() => setReviewHover(0)}
                    onClick={() => setReviewRating(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                  >
                    <Star
                      size={32}
                      fill={(reviewHover || reviewRating) >= star ? '#F59E0B' : 'none'}
                      stroke={(reviewHover || reviewRating) >= star ? '#F59E0B' : '#D1D5DB'}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>Your Comment</label>
              <textarea
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                placeholder="Share your experience with this service..."
                rows={4}
                style={{ width: '100%', padding: '12px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontFamily: 'Montserrat, sans-serif', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = '#5B62B3')}
                onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setReviewModal({ open: false, bookingId: '', serviceId: '', serviceName: '' })}
                disabled={reviewLoading}
                style={{ flex: 1, padding: '12px', backgroundColor: 'white', color: '#374151', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={reviewLoading}
                style={{ flex: 2, padding: '12px', backgroundColor: '#5B62B3', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: reviewLoading ? 'not-allowed' : 'pointer', fontFamily: 'Montserrat, sans-serif', opacity: reviewLoading ? 0.7 : 1 }}
              >
                {reviewLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientBookings;