import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock, Users, Star, Award, BookOpen,
  CheckCircle, PlayCircle, FileText, ChevronDown, ChevronUp,
  Shield, Bell, MapPin, Calendar, MessageCircle
} from 'lucide-react';
import courseService from '../../services/api/courseService';
import enrollmentService from '../../services/api/enrollmentService';
import ReviewsList from '../../components/common/ReviewsList';
import ReviewForm from '../../components/common/ReviewForm';
import { useAuth } from '../../context/AuthContext';
import showToast from '../../components/common/Toast';
import api from '../../utils/api';

/* ─── types ─────────────────────────────────────────────────── */
interface Lesson {
  _id: string;
  title: string;
  description: string;
  duration: number;
  contentType: string;
  isPreview: boolean;
}

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

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPrice: number | null;
  duration: number;
  level: string;
  imageUrl: string | null;
  instructorName: string;
  instructorBio: string;
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  certificateIncluded: boolean;
  whatYouWillLearn: string[];
  requirements: string[];
  courseFormat: {
    theoryHours: number;
    practicalHours: number;
    onlineContent: boolean;
    physicalClasses: boolean;
  };
  lessons: Lesson[];
  batches: Batch[];
  vendorId: any;
}

/* ─── helpers ───────────────────────────────────────────────── */
const resolveImage = (url: string | null) => {
  if (!url) return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80';
  if (url.startsWith('http')) return url;
  return `http://localhost:5000${url}`;
};

const calcDiscount = (price: number, disc: number | null) =>
  disc ? Math.round(((price - disc) / price) * 100) : 0;

const groupByModule = (lessons: Lesson[]) => {
  const groups: { title: string; lessons: Lesson[] }[] = [];
  const PER = 4;
  for (let i = 0; i < lessons.length; i += PER) {
    groups.push({ title: `Module ${Math.floor(i / PER) + 1}`, lessons: lessons.slice(i, i + PER) });
  }
  return groups;
};

const Stars: React.FC<{ n: number }> = ({ n }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} width="14" height="14" viewBox="0 0 24 24"
        fill={i <= Math.round(n) ? '#F59E0B' : 'none'} stroke="#F59E0B" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   COURSE DETAIL
══════════════════════════════════════════════════════════════════ */
const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse]           = useState<Course | null>(null);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState<'overview' | 'curriculum' | 'instructor' | 'reviews'>('overview');
  const [expanded, setExpanded]       = useState<number[]>([0]);
  const [showReviewForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey]   = useState(0);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [enrolling, setEnrolling]     = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [openModule, setOpenModule] = useState<number>(0);

  useEffect(() => { if (id) fetchCourse(); }, [id]);

  useEffect(() => {
    if (!course?._id) return;
    api.get('/enrollments/my')
      .then((res: any) => {
        const enrollments = res?.data?.enrollments || res?.enrollments || [];
        const activeEnrollments = enrollments.filter((e: any) => e.status !== 'dropped');
        setEnrollmentCount(activeEnrollments.length);
        setIsEnrolled(activeEnrollments.some((e: any) =>
          (e.courseId?._id || e.courseId) === course._id
        ));
      })
      .catch(() => {});
  }, [course?._id]);

  useEffect(() => {
    if (!course?.courseFormat?.physicalClasses || !course.batches?.length) {
      setSelectedBatch(null);
      return;
    }
    const open = course.batches.find(b => b.status === 'open' && b.seatsRemaining > 0) || course.batches[0];
    setSelectedBatch(open || null);
  }, [course]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const res = await courseService.getCourseById(id!);
      setCourse(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const toggleModule = (i: number) =>
    setExpanded(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const handleReviewSuccess = () => { setShowForm(false); setRefreshKey(k => k + 1); };

  const handleEnrollClick = async () => {
    if (!course) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (course.courseFormat?.physicalClasses && course.batches?.length > 0 && !selectedBatch) {
      showToast.error('Please select a batch');
      return;
    }
    const price = course.discountPrice || course.price;
    if (!price || price === 0) {
      // Free course — enroll directly
      handleDirectEnroll();
    } else {
      // Paid course — show payment options
      setShowPaymentModal(true);
    }
  };

  const handleDirectEnroll = async () => {
    if (!course || !user) return;
    setEnrolling(true);
    try {
      await api.post('/enrollments', {
        courseId: course._id,
        selectedBatchId: selectedBatch?._id,
        clientName: user.name,
        clientPhone: user.phone?.trim() || '',
        clientEmail: user.email,
      });
      showToast.success('Enrolled successfully!');
      navigate(`/client/learn/${course._id}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to enroll';
      const requiresPhone = err?.response?.data?.requiresPhone;
      if (requiresPhone) {
        if (window.confirm(`${msg}\n\nGo to profile to add phone number?`)) {
          navigate('/client/profile');
        }
      } else {
        showToast.error(msg);
      }
    }
    setEnrolling(false);
  };

  const handleEsewaPayment = async () => {
    if (!course || !user) return;
    setEnrolling(true);
    try {
      const res: any = await api.post('/payments/course/initiate', {
        amount: course.price,
        courseId: course._id,
        courseName: course.title,
      });

      const paymentData = res.data || res;

      sessionStorage.setItem('pendingCourseEnrollment', JSON.stringify({
        courseId: course._id,
        selectedBatchId: selectedBatch?._id,
        amount: course.price,
      }));

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

      const fields: any = {
        amount: paymentData.amount,
        tax_amount: 0,
        total_amount: paymentData.amount,
        transaction_uuid: paymentData.transaction_uuid,
        product_code: paymentData.product_code,
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: paymentData.success_url,
        failure_url: paymentData.failure_url,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature: paymentData.signature,
      };

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      showToast.error('Failed to initiate payment');
      setEnrolling(false);
    }
  };

  const handleMockPayment = async () => {
    if (!course || !user) return;
    setEnrolling(true);
    try {
      await api.post('/enrollments', {
        courseId: course._id,
        selectedBatchId: selectedBatch?._id,
        clientName: user.name,
        clientPhone: user.phone?.trim() || '',
        clientEmail: user.email,
        paymentMethod: 'mock',
        transactionId: `MOCK-${Date.now()}`,
      });
      showToast.success('Enrolled successfully!');
      setShowPaymentModal(false);
      navigate(`/client/learn/${course._id}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to enroll';
      const requiresPhone = err?.response?.data?.requiresPhone;
      if (requiresPhone) {
        if (window.confirm(`${msg}\n\nGo to profile?`)) {
          navigate('/client/profile');
        }
      } else {
        showToast.error(msg);
      }
    }
    setEnrolling(false);
  };

  /* ── loading ──────────────────────────────────────────────── */
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FDFDFF', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '3px solid #E2E8F0', borderTopColor: '#5B62B3', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!course) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '18px', fontWeight: 600, color: '#64748B' }}>Course not found</p>
        <button onClick={() => navigate('/client/courses')} style={{ marginTop: '16px', padding: '10px 20px', borderRadius: '999px', border: 'none', backgroundColor: '#5B62B3', color: 'white', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>Back to Courses</button>
      </div>
    </div>
  );

  const modules = groupByModule(course.lessons);
  const TABS = ['overview', 'curriculum', 'instructor', 'reviews'] as const;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA', fontFamily: 'Montserrat, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .cd-tab { transition: color 0.18s, border-color 0.18s; cursor: pointer; }
        .cd-tab:hover { color: #5B62B3 !important; }
        .cd-module { transition: box-shadow 0.18s; cursor: pointer; }
        .cd-module:hover { box-shadow: 0 4px 16px rgba(91,98,179,0.1) !important; }
        .cd-enroll { transition: all 0.22s ease; }
        .cd-enroll:hover { box-shadow: 0 12px 28px rgba(91,98,179,0.3) !important; transform: translateY(-2px); }
        .cd-enroll:active { transform: scale(0.97); }
        .cd-lesson-row:hover { background: rgba(91,98,179,0.03) !important; }
        .cd-batch-card:hover { border-color: rgba(91,98,179,0.4) !important; }
        .nav-link:hover { color: #5B62B3 !important; }
      `}</style>

      {/* ═══ HEADER ═════════════════════════════════════════════ */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(226,232,240,0.5)', boxShadow: '0 1px 12px rgba(91,98,179,0.05)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#5B62B3', letterSpacing: '-0.04em', cursor: 'pointer' }} onClick={() => navigate('/client/dashboard')}>GlamBook</span>
            <nav style={{ display: 'flex', gap: '28px' }}>
              {[['Explore', '/client/services'], ['Courses', '/client/courses'], ['My Bookings', '/client/bookings']].map(([l, p]) => (
                <span key={l} className="nav-link" onClick={() => navigate(p)} style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: l === 'Courses' ? '#5B62B3' : '#64748B', cursor: 'pointer', borderBottom: l === 'Courses' ? '2px solid #5B62B3' : '2px solid transparent', paddingBottom: '2px' }}>{l}</span>
              ))}
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Bell size={20} style={{ color: '#94A3B8', cursor: 'pointer' }} />
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#5B62B3,#8C92E6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>G</div>
          </div>
        </div>
      </header>

      {/* ═══ HERO — dark banner ══════════════════════════════════ */}
      <div style={{ backgroundColor: '#0F0F1A', padding: '48px 0 0', fontFamily: 'Montserrat, sans-serif' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px', display: 'flex', gap: '48px', alignItems: 'flex-start' }}>

          {/* Left — course info */}
          <div style={{ flex: 1 }}>
            {/* Badges row */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' as const }}>
              {course.discountPrice && course.discountPrice < course.price && (
                <span style={{ backgroundColor: '#E91E63', color: 'white', fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '20px' }}>Bestseller</span>
              )}
              <span style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.3)' }}>{course.category}</span>
              <span style={{ backgroundColor: course.level === 'Beginner' ? '#10B981' : course.level === 'Intermediate' ? '#3B82F6' : '#F59E0B', color: 'white', fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px' }}>{course.level}</span>
            </div>

            {/* Title */}
            <h1 style={{ margin: '0 0 16px', fontSize: '38px', fontWeight: 800, color: 'white', fontFamily: 'Syne, sans-serif', lineHeight: 1.15 }}>
              {course.title}
            </h1>

            {/* Description */}
            <p style={{ margin: '0 0 24px', fontSize: '15px', color: '#CBD5E1', lineHeight: 1.7, maxWidth: '580px' }}>
              {course.description}
            </p>

            {/* Instructor row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#5B62B3', overflow: 'hidden', flexShrink: 0 }}>
                {course.vendorId?.profileImage
                  ? <img src={course.vendorId.profileImage} alt={course.vendorId.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '16px' }}>{course.vendorId?.name?.[0] || 'V'}</div>
                }
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'white' }}>{course.vendorId?.name || course.instructorName || 'Instructor'}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>{course.instructorBio || 'Professional Instructor'}</p>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' as const, marginBottom: '32px' }}>
              {[
                { icon: '⭐', label: `${course.rating?.toFixed(1) || '0.0'} (${course.reviewCount || 0} reviews)` },
                { icon: '⏱', label: `${course.duration || 0} hours` },
                { icon: '📚', label: `${course.lessons?.length || 0} lessons` },
                { icon: '🌐', label: 'English' },
                { icon: '🎓', label: course.certificateIncluded ? 'Certificate' : 'No Certificate' },
                { icon: '📍', label: course.courseFormat?.physicalClasses ? 'Physical + Online' : 'Online' },
              ].map((stat, i) => (
                <span key={i} style={{ fontSize: '13px', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {stat.icon} {stat.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right — enrollment card */}
          <div style={{ width: '380px', flexShrink: 0, backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.3)' }}>
            {/* Thumbnail with play button */}
            <div style={{ position: 'relative' as const, height: '210px', backgroundColor: '#1e1b4b', overflow: 'hidden' }}>
              {course.imageUrl
                ? <img src={resolveImage(course.imageUrl)} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1e1b4b, #5B62B3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>🎓</div>
              }
              <div style={{ position: 'absolute' as const, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#E91E63"><polygon points="5,3 19,12 5,21"/></svg>
                </div>
              </div>
            </div>

            {/* Price + CTA */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: '#111', fontFamily: 'Syne, sans-serif' }}>
                  Rs. {course.discountPrice || course.price}
                </span>
                {course.discountPrice && course.discountPrice < course.price && (
                  <>
                    <span style={{ fontSize: '16px', color: '#9CA3AF', textDecoration: 'line-through' }}>Rs. {course.price}</span>
                    <span style={{ backgroundColor: '#E91E63', color: 'white', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                      {Math.round((1 - (course.discountPrice / course.price)) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Enroll button — check enrollment limit */}
              {isEnrolled ? (
                <button onClick={() => navigate(`/client/learning/${course._id}`)}
                  style={{ width: '100%', padding: '14px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '15px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', marginBottom: '12px' }}>
                  Continue Learning →
                </button>
              ) : enrollmentCount >= 2 ? (
                <div style={{ marginBottom: '12px' }}>
                  <button disabled style={{ width: '100%', padding: '14px', backgroundColor: '#E5E7EB', color: '#9CA3AF', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '15px', cursor: 'not-allowed', fontFamily: 'Montserrat, sans-serif' }}>
                    Enrollment Full (Max 2 Courses)
                  </button>
                  <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#E91E63', textAlign: 'center' as const }}>
                    Complete or drop a course to enroll in a new one.
                  </p>
                </div>
              ) : (
                <button onClick={handleEnrollClick}
                  style={{ width: '100%', padding: '14px', backgroundColor: '#E91E63', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '15px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', marginBottom: '12px' }}>
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              )}

              {/* Action row */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ flex: 1, padding: '10px', backgroundColor: 'white', border: '1.5px solid #E5E7EB', borderRadius: '10px', cursor: 'pointer', fontSize: '18px' }}>🤍</button>
                <button style={{ flex: 1, padding: '10px', backgroundColor: 'white', border: '1.5px solid #E5E7EB', borderRadius: '10px', cursor: 'pointer', fontSize: '18px' }}>🔗</button>
              </div>

              {/* What's included */}
              <div style={{ marginTop: '20px', borderTop: '1px solid #F3F4F6', paddingTop: '16px' }}>
                {[
                  '✓ Lifetime access',
                  '✓ QR Certificate on completion',
                  '✓ Mobile friendly',
                  '✓ Direct instructor messaging',
                ].map((item, i) => (
                  <p key={i} style={{ margin: '0 0 8px', fontSize: '13px', color: '#374151' }}>{item}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ TABS + CONTENT ═════════════════════════════════════ */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 32px 64px' }}>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid #E2E8F0', marginBottom: '40px', marginTop: '40px' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className="cd-tab"
              style={{
                padding: '16px 24px', background: 'none', border: 'none',
                fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif', textTransform: 'capitalize',
                color: activeTab === tab ? '#5B62B3' : '#64748B',
                borderBottom: `3px solid ${activeTab === tab ? '#5B62B3' : 'transparent'}`,
                marginBottom: '-2px', transition: 'all 0.18s',
              }}>
              {tab === 'reviews' ? `Reviews (${course.reviewCount})` : tab}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '48px', alignItems: 'start' }}>

          {/* ══ LEFT: tab content ══ */}
          <div style={{ animation: 'fadeUp 0.35s ease both' }}>

            {/* ── OVERVIEW ─────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div>
                <h2 style={{ margin: '0 0 24px', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', color: '#1A1C30' }}>What You'll Learn</h2>
                {course.whatYouWillLearn?.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
                    {course.whatYouWillLearn.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <CheckCircle size={18} style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontSize: '14px', lineHeight: 1.6, color: '#475569' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '40px' }}>No learning objectives listed yet.</p>
                )}

                {course.requirements?.length > 0 && (
                  <>
                    <h2 style={{ margin: '0 0 20px', fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', color: '#1A1C30' }}>Requirements</h2>
                    <ul style={{ paddingLeft: '20px', margin: '0 0 40px' }}>
                      {course.requirements.map((r, i) => (
                        <li key={i} style={{ fontSize: '14px', marginBottom: '10px', lineHeight: 1.6, color: '#475569' }}>{r}</li>
                      ))}
                    </ul>
                  </>
                )}

                {/* Course format badges */}
                {course.courseFormat && (
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {[
                      { show: course.courseFormat.onlineContent, label: '🖥 Online Content', detail: `${course.courseFormat.theoryHours}h theory` },
                      { show: course.courseFormat.physicalClasses, label: '🏫 Physical Classes', detail: `${course.courseFormat.practicalHours}h practice` },
                      { show: course.certificateIncluded, label: '🏅 Certificate', detail: 'On completion' },
                    ].filter(x => x.show).map(x => (
                      <div key={x.label} style={{ padding: '14px 18px', borderRadius: '14px', backgroundColor: 'white', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
                        <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#1A1C30' }}>{x.label}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>{x.detail}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── CURRICULUM ───────────────────────────────── */}
            {activeTab === 'curriculum' && (
              <div>
                <h2 style={{ margin: '0 0 24px', fontSize: '24px', fontWeight: 800, color: '#111', fontFamily: 'Syne, sans-serif' }}>Course Curriculum</h2>
                {(course.modules || [{ title: 'Course Content', lessons: course.lessons || [] }]).map((module: any, mIdx: number) => (
                  <div key={mIdx} style={{ marginBottom: '12px' }}>
                    {/* Module header */}
                    <div
                      onClick={() => setOpenModule(openModule === mIdx ? -1 : mIdx)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', border: '1.5px solid #E5E7EB', borderRadius: openModule === mIdx ? '12px 12px 0 0' : '12px', cursor: 'pointer', backgroundColor: 'white' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#111' }}>
                          Module {mIdx + 1}: {module.title}
                        </span>
                        <span style={{ backgroundColor: '#F3F4F6', color: '#6B7280', fontSize: '12px', fontWeight: 600, padding: '2px 10px', borderRadius: '12px' }}>
                          {module.lessons?.length || 0} lessons
                        </span>
                      </div>
                      <span style={{ fontSize: '16px', color: '#6B7280', transition: 'transform 0.2s', display: 'inline-block', transform: openModule === mIdx ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
                    </div>

                    {/* Lessons */}
                    {openModule === mIdx && (
                      <div style={{ border: '1.5px solid #E5E7EB', borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
                        {(module.lessons || []).map((lesson: any, lIdx: number) => (
                          <div key={lIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', backgroundColor: lIdx % 2 === 0 ? '#FAFAFA' : 'white', borderTop: lIdx > 0 ? '1px solid #F3F4F6' : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              {/* Video icon — pink */}
                              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FFF0F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                  <rect x="2" y="4" width="15" height="16" rx="2" stroke="#E91E63" strokeWidth="2"/>
                                  <path d="M17 8.5l5-3v13l-5-3V8.5z" fill="#E91E63"/>
                                </svg>
                              </div>
                              <div>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111' }}>{lesson.title}</p>
                                <p style={{ margin: 0, fontSize: '12px', color: '#9CA3AF' }}>{lesson.duration || 0} minutes • {lesson.contentType || 'Video'}</p>
                              </div>
                            </div>
                            {(lesson.isPreview || lIdx === 0) && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '13px', fontWeight: 600 }}>
                                <span style={{ fontSize: '16px' }}>👁</span> Preview
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── INSTRUCTOR ───────────────────────────────── */}
            {activeTab === 'instructor' && (
              <div>
                <h2 style={{ margin: '0 0 28px', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', color: '#1A1C30' }}>Your Instructor</h2>
                <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '32px', border: '1.5px solid #EDF0F7', boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,#5B62B3,#8C92E6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '26px', fontWeight: 800, flexShrink: 0 }}>
                      {course.instructorName?.[0]?.toUpperCase() || 'I'}
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 800, color: '#1A1C30', letterSpacing: '-0.02em' }}>{course.instructorName}</h3>
                      <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#5B62B3', fontWeight: 600 }}>Beauty & Wellness Educator</p>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Star size={12} style={{ color: '#F59E0B', fill: '#F59E0B' }} /> {course.rating.toFixed(1)} rating
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Users size={12} /> {course.enrollmentCount} students
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <BookOpen size={12} /> 1 course
                        </span>
                      </div>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '15px', color: '#475569', lineHeight: 1.75, fontWeight: 300 }}>
                    {course.instructorBio || 'An experienced beauty professional dedicated to sharing knowledge and empowering students with industry-leading techniques and skills.'}
                  </p>
                </div>
              </div>
            )}

            {/* ── REVIEWS ──────────────────────────────────── */}
            {activeTab === 'reviews' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                  <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', color: '#1A1C30' }}>
                    Student Reviews
                  </h2>
                  <button onClick={() => setShowForm(true)}
                    style={{ padding: '11px 22px', borderRadius: '12px', border: 'none', backgroundColor: '#5B62B3', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', boxShadow: '0 4px 14px rgba(91,98,179,0.25)' }}>
                    Write a Review
                  </button>
                </div>

                {/* Rating summary */}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1.5px solid #EDF0F7', marginBottom: '28px', display: 'flex', gap: '28px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <p style={{ margin: '0 0 6px', fontSize: '52px', fontWeight: 800, color: '#1A1C30', letterSpacing: '-0.04em' }}>{course.rating.toFixed(1)}</p>
                    <Stars n={Math.round(course.rating)} />
                    <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#64748B' }}>Course rating</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    {[5,4,3,2,1].map(star => (
                      <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#64748B', width: '8px', textAlign: 'right' }}>{star}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        <div style={{ flex: 1, height: '6px', backgroundColor: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', backgroundColor: '#F59E0B', borderRadius: '999px', width: star === Math.round(course.rating) ? '60%' : `${Math.max(5, 60 - (Math.abs(star - course.rating) * 18))}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <ReviewsList
                  key={refreshKey}
                  targetType="course"
                  targetId={course._id}
                  onWriteReview={() => setShowForm(true)}
                />
              </div>
            )}
          </div>

          {/* ══ RIGHT sidebar ══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeUp 0.4s ease 0.08s both' }}>

            {/* Batches */}
            {course.batches?.length > 0 && (
              <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '24px', border: '1.5px solid #EDF0F7', boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
                <h3 style={{ margin: '0 0 18px', fontSize: '17px', fontWeight: 800, color: '#1A1C30' }}>Upcoming Batches</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {course.batches.map(batch => (
                    <div
                      key={batch._id}
                      role={course.courseFormat?.physicalClasses ? 'button' : undefined}
                      tabIndex={course.courseFormat?.physicalClasses ? 0 : undefined}
                      onClick={() => course.courseFormat?.physicalClasses && setSelectedBatch(batch)}
                      onKeyDown={e => {
                        if (!course.courseFormat?.physicalClasses) return;
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedBatch(batch);
                        }
                      }}
                      className="cd-batch-card"
                      style={{
                        padding: '16px',
                        borderRadius: '14px',
                        border: `1.5px solid ${selectedBatch?._id === batch._id ? '#5B62B3' : '#EDF0F7'}`,
                        transition: 'border-color 0.18s',
                        cursor: course.courseFormat?.physicalClasses ? 'pointer' : 'default',
                        boxShadow: selectedBatch?._id === batch._id ? '0 0 0 2px rgba(91,98,179,0.2)' : undefined,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', backgroundColor: batch.status === 'open' ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)', color: batch.status === 'open' ? '#065F46' : '#475569' }}>
                          {batch.status === 'open' ? 'Open' : 'Closed'}
                        </span>
                        <span style={{ fontSize: '12px', color: batch.seatsRemaining < 5 ? '#DC2626' : '#64748B', fontWeight: 600 }}>
                          {batch.seatsRemaining} seats left
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: '#475569' }}>
                          <Calendar size={13} style={{ color: '#5B62B3', flexShrink: 0 }} />
                          {new Date(batch.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(batch.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        {batch.location && (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: '#475569' }}>
                            <MapPin size={13} style={{ color: '#5B62B3', flexShrink: 0 }} /> {batch.location}
                          </div>
                        )}
                        {batch.schedule && (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: '#475569' }}>
                            <Clock size={13} style={{ color: '#5B62B3', flexShrink: 0 }} /> {batch.schedule}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick enroll CTA */}
            <div style={{ backgroundColor: '#1A1C30', borderRadius: '20px', padding: '24px', color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Shield size={18} style={{ color: '#10B981' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>30-Day Guarantee</span>
              </div>
              <p style={{ margin: '0 0 18px', fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                Not satisfied? Get a full refund within 30 days, no questions asked.
              </p>
              <button className="cd-enroll" onClick={handleEnrollClick} disabled={enrolling}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: enrolling ? '#F9A8C9' : '#E91E63', color: 'white', fontSize: '14px', fontWeight: 700, cursor: enrolling ? 'wait' : 'pointer', fontFamily: 'Montserrat, sans-serif', boxShadow: '0 6px 20px rgba(233,30,99,0.35)' }}>
                {enrolling ? 'Processing...' : `Enroll Now · Rs. ${(course.discountPrice || course.price).toLocaleString()}`}
              </button>
            </div>

            {/* Course stats */}
            <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '24px', border: '1.5px solid #EDF0F7', boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 800, color: '#1A1C30' }}>Course Details</h3>
              {[
                { label: 'Duration', value: `${course.duration} hours` },
                { label: 'Level', value: course.level },
                { label: 'Lessons', value: `${course.lessons?.length || 0} lessons` },
                { label: 'Enrolled', value: `${course.enrollmentCount} students` },
                { label: 'Certificate', value: course.certificateIncluded ? 'Included' : 'Not included' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F8FAFC' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>{label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1C30' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ REVIEW FORM MODAL ══════════════════════════════════ */}
      {showReviewForm && (
        <ReviewForm
          targetType="course"
          targetId={course._id}
          onSuccess={handleReviewSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* ═══ PAYMENT MODAL ═════════════════════════════════════ */}
      {showPaymentModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, fontFamily: 'Montserrat, sans-serif',
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '20px', padding: '32px',
            width: '100%', maxWidth: '420px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, fontFamily: 'Syne, sans-serif', color: '#111' }}>
                Complete Enrollment
              </h3>
              <button onClick={() => setShowPaymentModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9CA3AF' }}>×</button>
            </div>

            {/* Course summary */}
            <div style={{ backgroundColor: '#F8F9FC', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '14px', color: '#111' }}>{course.title}</p>
              <p style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#E91E63' }}>Rs. {course.price?.toLocaleString()}</p>
            </div>

            <p style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '12px' }}>
              Choose Payment Method:
            </p>

            {/* eSewa button */}
            <button
              onClick={handleEsewaPayment}
              disabled={enrolling}
              style={{
                width: '100%', padding: '14px', marginBottom: '10px',
                backgroundColor: '#60BB46', color: 'white',
                border: 'none', borderRadius: '12px', fontWeight: 800,
                fontSize: '15px', cursor: enrolling ? 'not-allowed' : 'pointer',
                fontFamily: 'Montserrat, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              }}
            >
              <span style={{ fontSize: '20px' }}>💚</span>
              Pay with eSewa
            </button>

            {/* Mock payment for testing */}
            <button
              onClick={handleMockPayment}
              disabled={enrolling}
              style={{
                width: '100%', padding: '12px',
                backgroundColor: 'white', color: '#5B62B3',
                border: '1.5px solid #5B62B3', borderRadius: '12px', fontWeight: 700,
                fontSize: '13px', cursor: enrolling ? 'not-allowed' : 'pointer',
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              {enrolling ? 'Processing...' : '🧪 Test Enrollment (Mock Payment)'}
            </button>

            <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', marginTop: '12px' }}>
              🔒 Secure payment · 30-day money back guarantee
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
