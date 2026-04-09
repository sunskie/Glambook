import React, { useState } from 'react';
import { X, Clock, MapPin, Calendar, Star, CheckCircle, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Service } from '../../types';
import ReviewsList from '../common/ReviewsList';
import ReviewForm from '../common/ReviewForm';

/* ─── types ─────────────────────────────────────────────────── */
interface ServiceDetailModalProps {
  service: Service;
  onClose: () => void;
}

/* ─── helpers ───────────────────────────────────────────────── */
const resolveImage = (url: string | null | undefined) => {
  if (!url) return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80';
  if (url.startsWith('http')) return url;
  return `http://localhost:5000${url}`;
};

const Stars: React.FC<{ n: number; size?: number }> = ({ n, size = 14 }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24"
        fill={i <= Math.round(n) ? '#F59E0B' : 'none'} stroke="#F59E0B" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   SERVICE DETAIL MODAL
══════════════════════════════════════════════════════════════════ */
const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({ service, onClose }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]     = useState<'details' | 'reviews'>('details');
  const [showReviewForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey]   = useState(0);

  const vendorName  = typeof service.vendorId === 'object' && service.vendorId !== null ? service.vendorId.name  : 'Vendor';
  const vendorEmail = typeof service.vendorId === 'object' && service.vendorId !== null ? service.vendorId.email : '';

  const handleBookNow = () => { onClose(); navigate(`/client/book/${service._id}`); };
  const handleReviewSuccess = () => { setShowForm(false); setRefreshKey(k => k + 1); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap');
        @keyframes modalIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
        .sdm-tab { transition: color 0.18s, border-color 0.18s; cursor: pointer; }
        .sdm-tab:hover { color: #5B62B3 !important; }
        .sdm-close:hover { background: #F1F5F9 !important; }
        .sdm-book { transition: all 0.22s ease; }
        .sdm-book:hover { background: #4851A0 !important; box-shadow: 0 12px 28px rgba(91,98,179,0.3) !important; transform: translateY(-1px); }
        .sdm-book:active { transform: scale(0.97); }
      `}</style>

      {/* ── Backdrop ─────────────────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 50, overflowY: 'auto' }}>
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }} />

        <div style={{ display: 'flex', minHeight: '100%', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', zIndex: 1 }}>

          {/* ── Modal shell ───────────────────────────────────── */}
          <div style={{
            backgroundColor: 'white', borderRadius: '24px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
            maxWidth: '960px', width: '100%',
            maxHeight: '92vh', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            animation: 'modalIn 0.25s ease both',
            fontFamily: 'Montserrat, sans-serif',
          }}>

            {/* ── Close button ─────────────────────────────── */}
            <button onClick={onClose} className="sdm-close"
              style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 20, width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.12)', transition: 'background 0.18s' }}>
              <X size={18} style={{ color: '#475569' }} />
            </button>

            {/* ── Top section: image + info ─────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

              {/* Image */}
              <div style={{ position: 'relative', height: '360px', overflow: 'hidden' }}>
                <img src={resolveImage(service.imageUrl)} alt={service.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80'; }} />

                {/* Category badge */}
                <span style={{ position: 'absolute', top: '16px', left: '16px', padding: '6px 14px', borderRadius: '999px', backgroundColor: '#5B62B3', color: 'white', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em' }}>
                  {service.category}
                </span>

                {/* Rating badge */}
                <div style={{ position: 'absolute', bottom: '16px', left: '16px', backgroundColor: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(8px)', padding: '8px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <Stars n={Math.round(service.rating || 0)} />
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#1A1C30' }}>{(service.rating || 0).toFixed(1)}</span>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>({service.reviewCount || 0})</span>
                </div>
              </div>

              {/* Info panel */}
              <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ margin: '0 0 20px', fontSize: '28px', fontWeight: 800, color: '#1A1C30', letterSpacing: '-0.02em', lineHeight: 1.15, paddingRight: '40px' }}>
                    {service.title}
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                    {/* Vendor */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <MapPin size={18} style={{ color: '#5B62B3', flexShrink: 0, marginTop: '1px' }} />
                      <div>
                        <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '14px', color: '#1A1C30' }}>{vendorName}</p>
                        {vendorEmail && <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>{vendorEmail}</p>}
                      </div>
                    </div>

                    {/* Duration */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Clock size={18} style={{ color: '#5B62B3', flexShrink: 0 }} />
                      <span style={{ fontSize: '14px', color: '#475569' }}>{service.duration} minutes</span>
                    </div>

                    {/* Price */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Price</span>
                      <span style={{ fontSize: '30px', fontWeight: 800, color: '#5B62B3', letterSpacing: '-0.02em' }}>
                        Rs. {service.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '20px', marginBottom: '20px' }}>
                    <h3 style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: 700, color: '#1A1C30' }}>About this service</h3>
                    <p style={{ margin: 0, color: '#64748B', lineHeight: 1.7, fontSize: '14px', fontWeight: 300 }}>
                      {service.description}
                    </p>
                  </div>

                  {/* Perks row */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {['Premium Products', 'Expert Stylist', 'Instant Confirm'].map(p => (
                      <span key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: '#5B62B3', backgroundColor: 'rgba(91,98,179,0.07)', padding: '5px 10px', borderRadius: '999px' }}>
                        <CheckCircle size={11} /> {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div style={{ marginTop: '24px' }}>
                  <button onClick={handleBookNow} className="sdm-book"
                    style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', backgroundColor: '#5B62B3', color: 'white', fontSize: '15px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 6px 20px rgba(91,98,179,0.28)', marginBottom: '10px' }}>
                    <Calendar size={18} /> Book Appointment
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Shield size={13} style={{ color: '#10B981' }} />
                    <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>Instant confirmation · Secure booking · No deposit</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Tab bar ──────────────────────────────────────── */}
            <div style={{ borderBottom: '1px solid #F1F5F9', display: 'flex', padding: '0 32px', backgroundColor: '#FAFAFA' }}>
              {(['details', 'reviews'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className="sdm-tab"
                  style={{
                    padding: '14px 20px', background: 'none', border: 'none',
                    borderBottom: `2.5px solid ${activeTab === tab ? '#5B62B3' : 'transparent'}`,
                    color: activeTab === tab ? '#5B62B3' : '#64748B',
                    fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                    fontFamily: 'Montserrat, sans-serif', textTransform: 'capitalize',
                    marginBottom: '-1px', transition: 'all 0.18s',
                  }}>
                  {tab === 'reviews' ? `Reviews (${service.reviewCount || 0})` : 'Details'}
                </button>
              ))}
            </div>

            {/* ── Tab content ──────────────────────────────────── */}
            <div style={{ padding: '28px 32px', overflowY: 'auto', flex: 1 }}>

              {activeTab === 'details' && (
                <div>
                  <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 800, color: '#1A1C30', letterSpacing: '-0.02em' }}>Service Details</h3>
                  <p style={{ margin: '0 0 24px', color: '#475569', lineHeight: 1.8, fontSize: '15px', fontWeight: 300 }}>
                    {service.description}
                  </p>

                  {/* Detail cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
                    {[
                      { label: 'Category', value: service.category },
                      { label: 'Duration', value: `${service.duration} min` },
                      { label: 'Price', value: `Rs. ${service.price.toLocaleString()}` },
                      { label: 'Provider', value: vendorName },
                      { label: 'Status', value: (service as any).status || 'Active' },
                      { label: 'Rating', value: `${(service.rating || 0).toFixed(1)} / 5.0` },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ backgroundColor: '#F8FAFC', borderRadius: '14px', padding: '16px', border: '1px solid #EDF0F7' }}>
                        <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1A1C30' }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: '#1A1C30', letterSpacing: '-0.02em' }}>Client Reviews</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Stars n={Math.round(service.rating || 0)} size={16} />
                        <span style={{ fontSize: '16px', fontWeight: 800, color: '#1A1C30' }}>{(service.rating || 0).toFixed(1)}</span>
                        <span style={{ fontSize: '13px', color: '#64748B' }}>({service.reviewCount || 0} reviews)</span>
                      </div>
                    </div>
                    <button onClick={() => setShowForm(true)}
                      style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', backgroundColor: '#5B62B3', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', boxShadow: '0 4px 14px rgba(91,98,179,0.25)' }}>
                      Write a Review
                    </button>
                  </div>

                  <ReviewsList
                    key={refreshKey}
                    targetType="service"
                    targetId={service._id}
                    onWriteReview={() => setShowForm(true)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Review Form Modal ─────────────────────────────────── */}
      {showReviewForm && (
        <ReviewForm
          targetType="service"
          targetId={service._id}
          onSuccess={handleReviewSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}
    </>
  );
};

export default ServiceDetailModal;
