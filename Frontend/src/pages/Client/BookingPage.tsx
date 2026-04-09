import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Star, MapPin, ChevronLeft, ChevronRight, Lock, Sparkles, Shield } from 'lucide-react';
import serviceService from '../../services/api/serviceService';
import { createBooking } from '../../services/api/bookingService';
import { useAuth } from '../../context/AuthContext';
import showToast from '../../components/common/Toast';
import { Service } from '../../types';

/* ─── constants ─────────────────────────────────────────────── */
const TIME_SLOTS = ['09:00 AM', '10:30 AM', '01:00 PM', '03:30 PM'];
const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

/* ─── helpers ───────────────────────────────────────────────── */
const resolveImage = (url?: string | null) => {
  if (!url) return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80';
  if (url.startsWith('http')) return url;
  return `http://localhost:5000${url}`;
};

const getVendorName = (vendorId: Service['vendorId']) =>
  typeof vendorId === 'string' ? 'Beauty Professional' : vendorId.name;

/* ─── star row ───────────────────────────────────────────────── */
const Stars: React.FC<{ n?: number }> = ({ n = 5 }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= n ? '#F59E0B' : 'none'} stroke="#F59E0B" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   BOOKING PAGE
══════════════════════════════════════════════════════════════════ */
const BookingPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [service, setService]       = useState<Service | null>(null);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [calYear, setCalYear]   = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [formData, setFormData] = useState({
    clientName: user?.name || '',
    clientEmail: user?.email || '',
    clientPhone: '',
    specialRequests: '',
  });

  useEffect(() => { if (serviceId) fetchService(); }, [serviceId]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const res = await serviceService.getServiceById(serviceId!);
      setService(res.data);
    } catch (err: any) {
      showToast.error(err.response?.data?.message || 'Failed to load service');
      navigate('/client/services');
    } finally { setLoading(false); }
  };

  /* ── calendar logic ─────────────────────────────────────── */
  const calDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
    const offset = firstDay === 0 ? 6 : firstDay - 1;        // Mon-based
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const prevMonthDays = new Date(calYear, calMonth, 0).getDate();
    const cells: { day: number; current: boolean; dateStr: string }[] = [];
    for (let i = offset - 1; i >= 0; i--)
      cells.push({ day: prevMonthDays - i, current: false, dateStr: '' });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      cells.push({ day: d, current: true, dateStr });
    }
    while (cells.length % 7 !== 0) cells.push({ day: cells.length - daysInMonth - offset + 1, current: false, dateStr: '' });
    return cells;
  }, [calYear, calMonth]);

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };
  const today = new Date().toISOString().split('T')[0];
  const isPast = (dateStr: string) => dateStr < today;

  /* ── form ───────────────────────────────────────────────── */
  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'clientPhone' ? value.replace(/\D/g,'').slice(0,10) : value }));
  };

  const handleBooking = async () => {
    if (!serviceId) return showToast.error('Service not found');
    if (!selectedDate || !selectedTime) return showToast.error('Please select date and time');
    if (!formData.clientName.trim() || !formData.clientEmail.trim() || !formData.clientPhone.trim())
      return showToast.error('Please fill in your contact details');
    try {
      setSubmitting(true);
      await createBooking({
        serviceId,
        clientName: formData.clientName.trim(),
        clientEmail: formData.clientEmail.trim(),
        clientPhone: formData.clientPhone.trim(),
        bookingDate: selectedDate,
        bookingTime: selectedTime,
        specialRequests: formData.specialRequests.trim(),
      });
      showToast.success('Booking confirmed!');
      navigate('/client/bookings');
    } catch (err: any) {
      showToast.error(err.response?.data?.message || 'Booking failed');
    } finally { setSubmitting(false); }
  };

  /* ── loading ─────────────────────────────────────────────── */
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FDFDFF' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid #E2E8F0', borderTopColor: '#5B62B3', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!service) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: '12px 16px', borderRadius: '12px',
    border: '1.5px solid #E2E8F0', outline: 'none',
    fontSize: '14px', fontFamily: 'Montserrat, sans-serif',
    color: '#1A1C30', backgroundColor: 'white',
    transition: 'border-color 0.18s',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FDFDFF', fontFamily: 'Montserrat, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .bk-anim { animation: fadeUp 0.4s ease both; }
        .bk-input:focus { border-color: #5B62B3 !important; box-shadow: 0 0 0 3px rgba(91,98,179,0.1); }
        .cal-day:hover { background: rgba(91,98,179,0.06) !important; color: #5B62B3 !important; }
        .time-btn:hover:not(.active) { border-color: #5B62B3 !important; color: #5B62B3 !important; }
        .feature-card:hover { border-color: rgba(91,98,179,0.3) !important; }
        .confirm-btn:hover:not(:disabled) { box-shadow: 0 20px 40px -12px rgba(91,98,179,0.35) !important; transform: translateY(-2px); }
        .confirm-btn:active:not(:disabled) { transform: scale(0.97); }
        .img-zoom { transition: transform 0.7s ease; }
        .img-wrap:hover .img-zoom { transform: scale(1.05); }
      `}</style>

      {/* ═══ TOP APP BAR ════════════════════════════════════════ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(226,232,240,0.5)',
        boxShadow: '0 1px 12px rgba(91,98,179,0.05)',
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#5B62B3', letterSpacing: '-0.04em' }}>GlamBook</span>
            <nav style={{ display: 'flex', gap: '28px' }}>
              {['Explore', 'Appointments', 'Services'].map(n => (
                <a key={n} style={{
                  fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: n === 'Services' ? '#5B62B3' : '#64748B', textDecoration: 'none',
                  borderBottom: n === 'Services' ? '2px solid #5B62B3' : '2px solid transparent',
                  paddingBottom: '2px',
                }}>{n}</a>
              ))}
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <button onClick={() => navigate('/client/bookings')} style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '9px 18px', borderRadius: '999px', border: '1.5px solid #5B62B3', backgroundColor: 'transparent', color: '#5B62B3', cursor: 'pointer' }}>My Bookings</button>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#5B62B3,#8C92E6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: 700 }}>G</div>
          </div>
        </div>
      </header>

      {/* ═══ MAIN ═══════════════════════════════════════════════ */}
      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 32px 64px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94A3B8' }}>
          <span onClick={() => navigate('/client/services')} style={{ cursor: 'pointer', transition: 'color 0.18s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#5B62B3')}
            onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}>
            Hair Care
          </span>
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#CBD5E1', display: 'inline-block' }} />
          <span style={{ color: '#5B62B3' }}>Service Selection</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0,420px)', gap: '40px', alignItems: 'start' }}>

          {/* ═══ LEFT COLUMN ══════════════════════════════════════ */}
          <div className="bk-anim" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

            {/* Title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h1 style={{ margin: 0, fontSize: '52px', fontWeight: 800, color: '#1A1C30', letterSpacing: '-0.03em', lineHeight: 1.05 }}>
                {service.title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Stars n={5} />
                  <span style={{ fontWeight: 700, fontSize: '16px', color: '#1A1C30' }}>4.8</span>
                  <span style={{ color: '#64748B', fontSize: '14px' }}>(124 Reviews)</span>
                </div>
                <div style={{ width: '1px', height: '16px', backgroundColor: '#E2E8F0' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#5B62B3' }}>
                  <Clock size={18} />
                  <span style={{ fontWeight: 700, fontSize: '16px', color: '#1A1C30' }}>{service.duration} min</span>
                </div>
              </div>
            </div>

            {/* Hero image */}
            <div className="img-wrap" style={{ position: 'relative', borderRadius: '32px', overflow: 'hidden', aspectRatio: '16/8', boxShadow: '0 4px 24px rgba(91,98,179,0.1)' }}>
              <div style={{ position: 'absolute', inset: '-4px', background: 'linear-gradient(135deg, rgba(91,98,179,0.1), transparent)', borderRadius: '34px', filter: 'blur(8px)', opacity: 0.4, pointerEvents: 'none' }} />
              <img className="img-zoom" src={resolveImage(service.imageUrl)} alt={service.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80'; }} />
            </div>

            {/* Description + price card */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <p style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: 700, color: '#5B62B3', letterSpacing: '0.18em', textTransform: 'uppercase' }}>The Experience</p>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '17px', fontWeight: 300, lineHeight: 1.8 }}>{service.description}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[['✦', 'Premium Products'], ['◈', 'Scalp Massage'], ['◉', 'Master Stylists'], ['◆', 'Organic Formulas']].map(([icon, label]) => (
                    <div key={label} className="feature-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', borderRadius: '16px', border: '1.5px solid #E2E8F0', transition: 'border-color 0.18s' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'rgba(91,98,179,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B62B3', fontSize: '16px' }}>{icon}</div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1C30' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Location */}
            <div style={{ paddingTop: '32px', borderTop: '1px solid rgba(226,232,240,0.4)' }}>
              <p style={{ margin: '0 0 28px', fontSize: '11px', fontWeight: 700, color: '#5B62B3', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Location &amp; Access</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 700, color: '#1A1C30' }}>Kathmandu Flagship</h4>
                    <p style={{ margin: 0, color: '#64748B', fontWeight: 500, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} style={{ color: '#5B62B3' }} />
                      Lazimpat Rd, Kathmandu 44600, Nepal
                    </p>
                  </div>
                  <button style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 24px', borderRadius: '999px', border: '1.5px solid #5B62B3', backgroundColor: 'transparent', color: '#5B62B3', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', width: 'fit-content', transition: 'all 0.25s' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#5B62B3'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#5B62B3'; }}>
                    ↗ Get Directions
                  </button>
                </div>
                <div style={{ height: '220px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(91,98,179,0.08)', border: '1px solid rgba(226,232,240,0.5)', filter: 'grayscale(1)', transition: 'filter 0.6s' }}
                  onMouseEnter={e => (e.currentTarget.style.filter = 'grayscale(0)')}
                  onMouseLeave={e => (e.currentTarget.style.filter = 'grayscale(1)')}>
                  <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80" alt="Map" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div style={{ paddingTop: '32px', borderTop: '1px solid rgba(226,232,240,0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#5B62B3', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Client Reviews</p>
                <a href="#" style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'underline', textUnderlineOffset: '4px' }}>View All</a>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {[
                  { name: 'Priya Sharma', stars: 5, text: '"Absolutely loved the session. The stylist was attentive and the results were stunning. Highly recommend for festive events!"' },
                  { name: 'Anil Thapa', stars: 4, text: '"Professional environment and great technique. Best hair service I\'ve had in Kathmandu so far."' },
                ].map(r => (
                  <div key={r.name} style={{ padding: '28px', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 2px 12px rgba(91,98,179,0.06)', border: '1px solid rgba(226,232,240,0.4)', transition: 'box-shadow 0.22s' }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 12px 32px rgba(91,98,179,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(91,98,179,0.06)')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>2
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg,#5B62B3,#8C92E6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '16px', fontWeight: 700 }}>
                        {r.name[0]}
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '14px', color: '#1A1C30' }}>{r.name}</p>
                        <Stars n={r.stars} />
                      </div>
                    </div>
                    <p style={{ margin: 0, color: '#64748B', fontSize: '13px', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.7 }}>{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ═══ RIGHT COLUMN — BOOKING SIDEBAR ═════════════════ */}
          <div className="bk-anim" style={{ position: 'sticky', top: '96px', animationDelay: '0.08s' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '28px', padding: '36px', boxShadow: '0 4px 24px rgba(91,98,179,0.1)', border: '1px solid rgba(226,232,240,0.4)' }}>
              <h2 style={{ margin: '0 0 28px', fontSize: '22px', fontWeight: 800, color: '#1A1C30', letterSpacing: '-0.02em' }}>Book the service</h2>

              {/* ── Calendar ──────────────────────────────────── */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1A1C30' }}>
                    {MONTHS[calMonth]} {calYear}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[{ icon: <ChevronLeft size={16} />, fn: prevMonth }, { icon: <ChevronRight size={16} />, fn: nextMonth }].map((b, i) => (
                      <button key={i} onClick={b.fn} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#64748B', transition: 'background 0.18s' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                        {b.icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Day headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
                  {DAYS.map(d => (
                    <div key={d} style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(100,116,139,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 0' }}>{d}</div>
                  ))}
                </div>

                {/* Day cells */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px' }}>
                  {calDays.map((cell, idx) => {
                    const isSelected = cell.dateStr === selectedDate;
                    const isToday = cell.dateStr === today;
                    const past = cell.current && isPast(cell.dateStr);
                    return (
                      <button key={idx} onClick={() => cell.current && !past && setSelectedDate(cell.dateStr)}
                        className={cell.current && !past && !isSelected ? 'cal-day' : ''}
                        style={{
                          height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '11px', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: cell.current && !past ? 'pointer' : 'default',
                          backgroundColor: isSelected ? '#5B62B3' : isToday ? 'rgba(91,98,179,0.08)' : 'transparent',
                          color: isSelected ? 'white' : !cell.current || past ? 'rgba(226,232,240,0.9)' : '#1A1C30',
                          boxShadow: isSelected ? '0 4px 14px rgba(91,98,179,0.3)' : 'none',
                          transition: 'all 0.18s',
                        }}>
                        {cell.day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Time Slots ───────────────────────────────── */}
              <div style={{ marginBottom: '28px' }}>
                <p style={{ margin: '0 0 14px', fontSize: '10px', fontWeight: 700, color: '#64748B', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Select Time</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {TIME_SLOTS.map(t => {
                    const active = selectedTime === t;
                    return (
                      <button key={t} onClick={() => setSelectedTime(t)} className={active ? '' : 'time-btn'}
                        style={{
                          padding: '12px 10px', borderRadius: '14px', fontSize: '12px', fontWeight: 700,
                          border: `1.5px solid ${active ? '#5B62B3' : '#E2E8F0'}`,
                          backgroundColor: active ? 'rgba(91,98,179,0.06)' : 'white',
                          color: active ? '#5B62B3' : '#1A1C30',
                          cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', transition: 'all 0.18s',
                        }}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Contact Fields ───────────────────────────── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                {[
                  { label: 'Full Name', name: 'clientName', type: 'text', placeholder: 'Your full name' },
                  { label: 'Email Address', name: 'clientEmail', type: 'email', placeholder: 'you@example.com' },
                  { label: 'Phone Number', name: 'clientPhone', type: 'tel', placeholder: '98XXXXXXXX' },
                ].map(f => (
                  <div key={f.name}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{f.label}</label>
                    <input className="bk-input" type={f.type} name={f.name}
                      value={formData[f.name as keyof typeof formData]}
                      onChange={handleInput} placeholder={f.placeholder}
                      style={inputStyle} maxLength={f.name === 'clientPhone' ? 10 : undefined}
                      onFocus={e => (e.target.style.borderColor = '#5B62B3')}
                      onBlur={e => (e.target.style.borderColor = '#E2E8F0')} />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Special Requests</label>
                  <textarea name="specialRequests" value={formData.specialRequests} onChange={handleInput} rows={3} placeholder="Any preferences or details…"
                    style={{ ...inputStyle, resize: 'none' }}
                    onFocus={e => (e.target.style.borderColor = '#5B62B3')}
                    onBlur={e => (e.target.style.borderColor = '#E2E8F0')} />
                </div>
              </div>

              {/* ── Pricing Summary ──────────────────────────── */}
              <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(226,232,240,0.5)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Service Amount</span>
                  <span style={{ fontWeight: 700, color: '#1A1C30' }}>Rs. {service.price.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Booking Fee</span>
                  <span style={{ fontWeight: 700, color: '#10B981' }}>Complimentary</span>
                </div>
                {selectedDate && selectedTime && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Appointment</span>
                    <span style={{ fontWeight: 700, color: '#5B62B3', fontSize: '12px' }}>{selectedDate} · {selectedTime}</span>
                  </div>
                )}

                <button onClick={handleBooking} disabled={submitting} className="confirm-btn"
                  style={{
                    marginTop: '8px', width: '100%', padding: '18px', borderRadius: '999px',
                    border: 'none', backgroundColor: '#5B62B3', color: 'white',
                    fontSize: '13px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
                    cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
                    boxShadow: '0 4px 20px rgba(91,98,179,0.25)',
                    fontFamily: 'Montserrat, sans-serif',
                    transition: 'all 0.25s',
                  }}>
                  {submitting ? 'Confirming…' : 'Confirm Selection'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: 0.45, marginTop: '4px' }}>
                  <Lock size={12} />
                  <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Secure Reservation · No Deposit</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ═══ FOOTER ═════════════════════════════════════════════ */}
      <footer style={{ backgroundColor: 'white', borderTop: '1px solid rgba(226,232,240,0.4)', marginTop: '48px' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '56px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '40px', marginBottom: '40px' }}>
            <div>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#5B62B3', letterSpacing: '-0.03em' }}>GlamBook</span>
              <p style={{ marginTop: '12px', fontSize: '13px', color: '#64748B', lineHeight: 1.7, maxWidth: '240px' }}>Refining the art of self-care. Discover premier stylists and elite wellness experiences near you.</p>
            </div>
            {[
              { title: 'Company', links: ['About Us', 'Press & Media'] },
              { title: 'Support', links: ['Concierge', 'Partner Lounge'] },
              { title: 'Legal', links: ['Privacy', 'Terms'] },
            ].map(col => (
              <div key={col.title}>
                <h5 style={{ margin: '0 0 14px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1A1C30' }}>{col.title}</h5>
                {col.links.map(l => (
                  <a key={l} href="#" style={{ display: 'block', fontSize: '13px', color: '#64748B', marginBottom: '10px', textDecoration: 'none', transition: 'color 0.18s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#5B62B3')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}>{l}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(226,232,240,0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(100,116,139,0.4)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>© 2024 GlamBook Marketplace. Curated with Excellence.</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['🌐','🔗'].map((ic, i) => (
                <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', transition: 'border-color 0.18s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#5B62B3')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E8F0')}>{ic}</div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BookingPage;
