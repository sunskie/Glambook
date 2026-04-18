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

  useEffect(() => { if (id) fetchCourse(); }, [id]);

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

  const handleEnroll = async () => {
    if (!course) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (!user.phone?.trim()) {
      showToast.error('Please add a phone number to your profile before enrolling.');
      return;
    }
    if (course.courseFormat?.physicalClasses && course.batches?.length > 0 && !selectedBatch) {
      showToast.error('Please select a batch');
      return;
    }
    try {
      setEnrolling(true);
      const response: any = await enrollmentService.createEnrollment({
        courseId: course._id,
        selectedBatchId: selectedBatch?._id,
        clientName: user.name,
        clientPhone: user.phone.trim(),
        clientEmail: user.email,
      });
      const enrollmentId = response?.data?._id;
      if (!enrollmentId) {
        showToast.error('Enrollment succeeded but no enrollment id was returned.');
        return;
      }
      navigate(`/client/enrollment-success/${enrollmentId}`);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Enrollment failed';
      showToast.error(msg);
    } finally {
      setEnrolling(false);
    }
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
      <div style={{ backgroundColor: '#1A1C30', color: 'white', padding: '48px 32px' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '48px', alignItems: 'start' }}>

            {/* ── Left: course info ── */}
            <div style={{ animation: 'fadeUp 0.4s ease both' }}>
              <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, color: '#E91E63', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '14px' }}>
                {course.category}
              </span>

              <h1 style={{ margin: '0 0 16px', fontSize: '42px', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                {course.title}
              </h1>

              <p style={{ margin: '0 0 28px', fontSize: '17px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, fontWeight: 300, maxWidth: '680px' }}>
                {course.description}
              </p>

              {/* Stats row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Stars n={Math.round(course.rating)} />
                  <span style={{ fontWeight: 700, fontSize: '15px' }}>{course.rating.toFixed(1)}</span>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>({course.reviewCount} reviews)</span>
                </div>
                <span style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.15)', display: 'inline-block' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                  <Users size={16} /> {course.enrollmentCount} students
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                  <Clock size={16} /> {course.duration} hours
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                  <BookOpen size={16} /> {course.level}
                </div>
              </div>

              <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                Created by <strong style={{ color: 'white' }}>{course.instructorName}</strong>
              </p>
            </div>

            {/* ── Right: pricing card ── */}
            <div style={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.3)', animation: 'fadeUp 0.4s ease 0.06s both' }}>
              {/* Preview image */}
              <div style={{ position: 'relative', height: '200px' }}>
                <img src={resolveImage(course.imageUrl)} alt={course.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80'; }} />
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '58px', height: '58px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                    <PlayCircle size={30} style={{ color: '#E91E63' }} />
                  </div>
                </div>
              </div>

              <div style={{ padding: '24px' }}>
                {/* Price */}
                <div style={{ marginBottom: '20px' }}>
                  {course.discountPrice ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '34px', fontWeight: 800, color: '#E91E63', letterSpacing: '-0.02em' }}>Rs. {course.discountPrice.toLocaleString()}</span>
                      <span style={{ fontSize: '18px', color: '#94A3B8', textDecoration: 'line-through' }}>Rs. {course.price.toLocaleString()}</span>
                      <span style={{ padding: '3px 10px', borderRadius: '6px', backgroundColor: '#E91E63', color: 'white', fontSize: '12px', fontWeight: 700 }}>
                        {calcDiscount(course.price, course.discountPrice)}% OFF
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '34px', fontWeight: 800, color: '#1A1C30', letterSpacing: '-0.02em' }}>Rs. {course.price.toLocaleString()}</span>
                  )}
                </div>

                {/* Enroll button */}
                <button className="cd-enroll" onClick={handleEnroll} disabled={enrolling}
                  style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', backgroundColor: enrolling ? '#F9A8C9' : '#E91E63', color: 'white', fontSize: '15px', fontWeight: 800, cursor: enrolling ? 'wait' : 'pointer', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.04em', boxShadow: '0 6px 20px rgba(233,30,99,0.3)', marginBottom: '12px' }}>
                  {enrolling ? 'Enrolling…' : 'Enroll Now'}
                </button>

                {/* Chat with Vendor button */}
                <button
                  onClick={() => {
                    const vendorId = course.vendorId?._id || course.vendorId;
                    if (vendorId) {
                      navigate(`/client/messages?vendorId=${vendorId}`);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '14px',
                    border: '1px solid #5B62B3',
                    backgroundColor: 'white',
                    color: '#5B62B3',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'Montserrat, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#5B62B3';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = '#5B62B3';
                  }}
                >
                  <MessageCircle size={16} />
                  Chat with Vendor
                </button>

                <p style={{ margin: '0 0 20px', textAlign: 'center', fontSize: '12px', color: '#94A3B8' }}>30-Day Money-Back Guarantee</p>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '18px' }}>
                  <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#1A1C30' }}>This course includes:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                    {[
                      course.courseFormat?.onlineContent && `${course.courseFormat.theoryHours}h online content`,
                      course.courseFormat?.physicalClasses && `${course.courseFormat.practicalHours}h hands-on practice`,
                      'Lifetime access',
                      course.certificateIncluded && 'Certificate of completion',
                    ].filter(Boolean).map(item => (
                      <div key={item as string} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CheckCircle size={15} style={{ color: '#10B981', flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', color: '#475569' }}>{item as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
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
                <h2 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', color: '#1A1C30' }}>Course Curriculum</h2>
                <p style={{ margin: '0 0 28px', color: '#64748B', fontSize: '14px' }}>
                  {course.lessons.length} lessons across {modules.length} modules
                </p>

                {modules.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '16px', border: '1.5px dashed #E2E8F0' }}>
                    <p style={{ color: '#94A3B8', fontSize: '15px' }}>No lessons added yet.</p>
                  </div>
                ) : modules.map((mod, mi) => (
                  <div key={mi} className="cd-module"
                    style={{ backgroundColor: 'white', borderRadius: '16px', marginBottom: '14px', border: '1.5px solid #EDF0F7', overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>

                    {/* Module header */}
                    <div onClick={() => toggleModule(mi)} style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 700, color: '#1A1C30' }}>{mod.title}</h3>
                        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>{mod.lessons.length} lessons</span>
                      </div>
                      <div style={{ color: '#5B62B3' }}>
                        {expanded.includes(mi) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>

                    {/* Lessons */}
                    {expanded.includes(mi) && (
                      <div style={{ paddingBottom: '8px' }}>
                        {mod.lessons.map((lesson, li) => (
                          <div key={li} className="cd-lesson-row"
                            style={{ padding: '14px 24px', borderTop: '1px solid #F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.18s' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                              {lesson.contentType === 'video'
                                ? <PlayCircle size={17} style={{ color: '#5B62B3', flexShrink: 0 }} />
                                : <FileText size={17} style={{ color: '#64748B', flexShrink: 0 }} />}
                              <span style={{ fontSize: '14px', color: '#1A1C30' }}>{lesson.title}</span>
                              {lesson.isPreview && (
                                <span style={{ fontSize: '10px', backgroundColor: '#EEF2FF', color: '#5B62B3', padding: '2px 8px', borderRadius: '999px', fontWeight: 700, letterSpacing: '0.06em' }}>Preview</span>
                              )}
                            </div>
                            {lesson.duration > 0 && (
                              <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500, flexShrink: 0, marginLeft: '12px' }}>{lesson.duration} min</span>
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
              <button className="cd-enroll" onClick={handleEnroll} disabled={enrolling}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: enrolling ? '#F9A8C9' : '#E91E63', color: 'white', fontSize: '14px', fontWeight: 700, cursor: enrolling ? 'wait' : 'pointer', fontFamily: 'Montserrat, sans-serif', boxShadow: '0 6px 20px rgba(233,30,99,0.35)' }}>
                {enrolling ? 'Enrolling…' : `Enroll Now · Rs. ${(course.discountPrice || course.price).toLocaleString()}`}
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
    </div>
  );
};

export default CourseDetail;
