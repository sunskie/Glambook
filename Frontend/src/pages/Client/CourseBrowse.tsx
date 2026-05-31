// Frontend/src/pages/Client/CourseBrowse.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, SlidersHorizontal, X, ChevronDown, BookOpen, Clock, Award, Users } from 'lucide-react';
import courseService from '../../services/api/courseService';
import api from '../../utils/api';
import Breadcrumbs from '../../components/common/Breadcrumbs';

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
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  certificateIncluded: boolean;
  batches: any[];
}

const CATEGORIES = [
  'All',
  'Hair Styling',
  'Makeup',
  'Skincare',
  'Nails',
  'Spa & Wellness',
  'Other',
];

const CourseBrowse: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseRecs, setCourseRecs] = useState<any[]>([]);
  const [compareList, setCompareList] = useState<any[]>([]);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [maxDuration, setMaxDuration] = useState<number>(9999);
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [certOnly, setCertOnly] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCourses();
    api.get('/recommendations/courses?limit=4')
      .then((res: any) => setCourseRecs(res.data?.courses || res.courses || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response: any = await courseService.getAllCourses();
      const data =
        response?.data?.courses ||
        response?.data?.data?.courses ||
        (Array.isArray(response?.data) ? response.data : null) ||
        response?.courses ||
        [];
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:5000${imageUrl}`;
  };

  const calculateDiscount = (price: number, discountPrice: number | null) => {
    if (!discountPrice) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  const vendorList = useMemo(() => {
    const seen = new Map<string, { id: string; name: string }>();
    (courses || []).forEach((c: any) => {
      const v = c.vendorId || c.instructor;
      if (!v) return;
      const id = typeof v === 'object' ? v._id : v;
      const name = typeof v === 'object' ? (v.name || 'Unknown') : 'Unknown';
      if (id && !seen.has(id)) seen.set(id, { id, name });
    });
    return Array.from(seen.values());
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return (courses || []).filter((c: any) => {
      if (selectedVendor !== 'all') {
        const vendorId = typeof (c.vendorId || c.instructor) === 'object'
          ? (c.vendorId || c.instructor)?._id
          : (c.vendorId || c.instructor);
        if (vendorId !== selectedVendor) return false;
      }
      if (selectedCategory && selectedCategory !== 'all' && c.category !== selectedCategory) return false;
      if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (c.price < priceRange[0] || c.price > priceRange[1]) return false;
      if (c.duration > maxDuration) return false;
      if (minRating > 0 && (c.rating || 0) < minRating) return false;
      if (certOnly && !c.certificateIncluded) return false;
      if (difficulty.length > 0 && !difficulty.includes(c.level)) return false;
      return true;
    });
  }, [courses, selectedVendor, selectedCategory, searchQuery, priceRange, maxDuration, minRating, certOnly, difficulty]);

  const toggleCompare = (course: any) => {
    setCompareList(prev => {
      const exists = prev.find((c: any) => c._id === course._id);
      if (exists) return prev.filter((c: any) => c._id !== course._id);
      if (prev.length >= 3) { alert('You can compare up to 3 courses at a time.'); return prev; }
      return [...prev, course];
    });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setPriceRange([0, 10000]);
    setMaxDuration(9999);
    setDifficulty([]);
    setCertOnly(false);
    setMinRating(0);
    setSelectedVendor('all');
  };

  const hasActiveFilters = selectedCategory || searchQuery || priceRange[0] > 0 || priceRange[1] < 10000
    || maxDuration < 9999 || difficulty.length > 0 || certOnly || minRating > 0 || selectedVendor !== 'all';

  const displayCategory = selectedCategory || 'All Categories';

  const styles = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#F5F5F7',
      fontFamily: "'Plus Jakarta Sans', 'Montserrat', sans-serif",
    } as React.CSSProperties,

    // Hero
    hero: {
      background: '#5B62B3',
      padding: '32px 24px',
      margin: '0 0 0 0',
    } as React.CSSProperties,
    heroInner: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '24px',
      flexWrap: 'wrap' as const,
    },
    heroLeft: {
      flex: 1,
    } as React.CSSProperties,
    heroLabel: {
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '0.15em',
      textTransform: 'uppercase' as const,
      color: 'rgba(255,255,255,0.7)',
      marginBottom: '8px',
    },
    heroTitle: {
      fontSize: '28px',
      fontWeight: 800,
      color: '#fff',
      margin: '0 0 8px',
      lineHeight: 1.25,
    } as React.CSSProperties,
    heroSubtitle: {
      fontSize: '14px',
      color: 'rgba(255,255,255,0.8)',
      margin: 0,
      fontWeight: 400,
    } as React.CSSProperties,
    heroBadge: {
      background: 'rgba(255,255,255,0.15)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.25)',
      borderRadius: '16px',
      padding: '16px 24px',
      textAlign: 'center' as const,
      minWidth: '140px',
    },
    heroBadgeLabel: {
      fontSize: '10px',
      fontWeight: 600,
      color: 'rgba(255,255,255,0.7)',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.1em',
      margin: '0 0 4px',
    },
    heroBadgeValue: {
      fontSize: '32px',
      fontWeight: 800,
      color: '#fff',
      margin: 0,
      lineHeight: 1,
    },

    // Search bar row
    searchRow: {
      maxWidth: '1200px',
      margin: '20px auto',
      padding: '0 24px',
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
    } as React.CSSProperties,
    searchWrap: {
      flex: 1,
      position: 'relative' as const,
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px 12px 42px',
      border: '1.5px solid #E5E7EB',
      borderRadius: '12px',
      fontSize: '14px',
      backgroundColor: '#fff',
      outline: 'none',
      boxSizing: 'border-box' as const,
      fontFamily: 'inherit',
    },
    searchIcon: {
      position: 'absolute' as const,
      left: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9CA3AF',
      pointerEvents: 'none' as const,
    },
    categoryBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 16px',
      border: '1.5px solid #E5E7EB',
      borderRadius: '12px',
      backgroundColor: '#fff',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      color: '#374151',
      whiteSpace: 'nowrap' as const,
      fontFamily: 'inherit',
    },
    filtersBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 18px',
      border: '1.5px solid #E5E7EB',
      borderRadius: '12px',
      backgroundColor: '#fff',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      color: '#374151',
      whiteSpace: 'nowrap' as const,
      fontFamily: 'inherit',
    },
    filtersBtnActive: {
      backgroundColor: '#5B62B3',
      borderColor: '#5B62B3',
      color: '#fff',
    },

    // Count row
    countRow: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 24px 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    } as React.CSSProperties,
    countText: {
      fontSize: '13px',
      color: '#6B7280',
      fontWeight: 500,
    },

    // Recommendations
    recsSection: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 24px 24px',
    } as React.CSSProperties,
    recsSectionTitle: {
      fontSize: '15px',
      fontWeight: 700,
      color: '#111827',
      margin: '0 0 4px',
    },
    recsSectionSub: {
      fontSize: '12px',
      color: '#9CA3AF',
      margin: '0 0 12px',
    },
    recsScroll: {
      display: 'flex',
      gap: '14px',
      overflowX: 'auto' as const,
      paddingBottom: '8px',
      scrollbarWidth: 'none' as const,
    },
    recCard: {
      minWidth: '200px',
      maxWidth: '200px',
      backgroundColor: '#EEF2FF',
      borderRadius: '14px',
      overflow: 'hidden' as const,
      cursor: 'pointer',
      flexShrink: 0,
      border: '1.5px solid rgba(99,102,241,0.15)',
      transition: 'transform 0.2s',
    },
    recCardImg: {
      height: '100px',
      width: '100%',
      objectFit: 'cover' as const,
    },
    recCardBody: {
      padding: '10px 12px',
    },
    recCardTitle: {
      fontSize: '12px',
      fontWeight: 700,
      color: '#1E1B4B',
      margin: '0 0 4px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
    },
    recCardPrice: {
      fontSize: '13px',
      fontWeight: 800,
      color: '#5B62B3',
      margin: 0,
    },

    // All courses
    allSection: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 24px',
    } as React.CSSProperties,
    allTitle: {
      fontSize: '16px',
      fontWeight: 700,
      color: '#111827',
      margin: '0 0 14px',
    },

    // Course cards grid
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '16px',
      paddingBottom: '40px',
    } as React.CSSProperties,

    card: {
      backgroundColor: '#fff',
      borderRadius: '16px',
      overflow: 'hidden' as const,
      cursor: 'pointer',
      border: '1.5px solid #F3F4F6',
      transition: 'box-shadow 0.2s, transform 0.2s',
    },
    cardImg: {
      width: '100%',
      height: '160px',
      objectFit: 'cover' as const,
      display: 'block',
    },
    cardBadgeRow: {
      position: 'absolute' as const,
      top: '10px',
      left: '10px',
      display: 'flex',
      gap: '6px',
    },
    badge: {
      fontSize: '10px',
      fontWeight: 700,
      padding: '3px 10px',
      borderRadius: '20px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    },
    discountBadge: {
      backgroundColor: '#E91E63',
      color: '#fff',
    },
    levelBadge: {
      backgroundColor: 'rgba(0,0,0,0.55)',
      color: '#fff',
      backdropFilter: 'blur(4px)',
    },
    compareBtn: {
      position: 'absolute' as const,
      top: '10px',
      right: '10px',
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255,255,255,0.9)',
      border: '2px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      backdropFilter: 'blur(4px)',
      transition: 'all 0.15s',
    },
    compareBtnActive: {
      backgroundColor: '#5B62B3',
      borderColor: '#5B62B3',
    },
    cardBody: {
      padding: '14px 16px',
    },
    cardCategory: {
      fontSize: '10px',
      fontWeight: 700,
      color: '#5B62B3',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.1em',
      margin: '0 0 6px',
    },
    cardTitle: {
      fontSize: '15px',
      fontWeight: 700,
      color: '#111827',
      margin: '0 0 6px',
      lineHeight: 1.4,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden',
    } as React.CSSProperties,
    cardDesc: {
      fontSize: '12px',
      color: '#9CA3AF',
      margin: '0 0 10px',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden',
      lineHeight: 1.5,
    } as React.CSSProperties,
    cardMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      marginBottom: '12px',
      flexWrap: 'wrap' as const,
    },
    cardMetaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '11px',
      color: '#6B7280',
    },
    cardFooter: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: '10px',
      borderTop: '1px solid #F3F4F6',
    },
    priceWrap: {
      display: 'flex',
      flexDirection: 'column' as const,
    },
    priceOld: {
      fontSize: '11px',
      color: '#9CA3AF',
      textDecoration: 'line-through',
    },
    priceMain: {
      fontSize: '18px',
      fontWeight: 800,
      color: '#111827',
    },
    priceDiscount: {
      fontSize: '18px',
      fontWeight: 800,
      color: '#E91E63',
    },
    enrollBtn: {
      padding: '8px 18px',
      backgroundColor: '#5B62B3',
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      fontSize: '13px',
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'background 0.15s',
    },

    // Filter modal overlay
    overlay: {
      position: 'fixed' as const,
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      zIndex: 50,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    filterModal: {
      backgroundColor: '#fff',
      borderRadius: '24px 24px 0 0',
      width: '100%',
      maxWidth: '480px',
      maxHeight: '85vh',
      overflowY: 'auto' as const,
      padding: '24px',
      boxSizing: 'border-box' as const,
    },
    filterModalHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '20px',
    },
    filterModalTitle: {
      fontSize: '18px',
      fontWeight: 700,
      color: '#111827',
      margin: 0,
    },
    filterCloseBtn: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#6B7280',
      padding: '4px',
      borderRadius: '8px',
      display: 'flex',
    },
    filterSection: {
      marginBottom: '20px',
    },
    filterLabel: {
      fontSize: '13px',
      fontWeight: 700,
      color: '#374151',
      display: 'block',
      marginBottom: '10px',
    },
    filterInputRow: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      marginBottom: '8px',
    },
    filterInput: {
      flex: 1,
      padding: '9px 12px',
      border: '1.5px solid #E5E7EB',
      borderRadius: '10px',
      fontSize: '13px',
      outline: 'none',
      fontFamily: 'inherit',
    },
    filterSelect: {
      width: '100%',
      padding: '10px 12px',
      border: '1.5px solid #E5E7EB',
      borderRadius: '10px',
      fontSize: '13px',
      outline: 'none',
      backgroundColor: '#fff',
      fontFamily: 'inherit',
    },
    filterDivider: {
      height: '1px',
      backgroundColor: '#F3F4F6',
      margin: '4px 0 20px',
    },
    checkRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#374151',
    },
    radioRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#374151',
    },
    toggleRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    toggleTrack: (on: boolean): React.CSSProperties => ({
      width: '44px',
      height: '24px',
      borderRadius: '12px',
      backgroundColor: on ? '#5B62B3' : '#D1D5DB',
      cursor: 'pointer',
      position: 'relative',
      transition: 'background 0.2s',
      flexShrink: 0,
    }),
    toggleKnob: (on: boolean): React.CSSProperties => ({
      position: 'absolute',
      top: '3px',
      left: on ? '22px' : '3px',
      width: '18px',
      height: '18px',
      borderRadius: '50%',
      backgroundColor: '#fff',
      transition: 'left 0.2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    }),
    filterFooter: {
      display: 'flex',
      gap: '12px',
      marginTop: '24px',
    },
    resetBtn: {
      flex: 1,
      padding: '14px',
      backgroundColor: '#F9FAFB',
      border: '1.5px solid #E5E7EB',
      borderRadius: '12px',
      fontSize: '13px',
      fontWeight: 700,
      cursor: 'pointer',
      color: '#374151',
      fontFamily: 'inherit',
    },
    doneBtn: {
      flex: 1,
      padding: '14px',
      backgroundColor: '#5B62B3',
      border: 'none',
      borderRadius: '12px',
      fontSize: '13px',
      fontWeight: 700,
      cursor: 'pointer',
      color: '#fff',
      fontFamily: 'inherit',
    },

    // Floating compare bar
    compareBar: {
      position: 'fixed' as const,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 40,
      backgroundColor: '#1E1B4B',
      padding: '14px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      flexWrap: 'wrap' as const,
    },
  };

  return (
    <div style={styles.page}>
      <Breadcrumbs items={[
        { label: 'Home', path: '/client/dashboard' },
        { label: 'Browse Courses' },
      ]} />

      {/* ── HERO ── */}
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.heroLeft}>
            <p style={styles.heroLabel}>GlamBook Academy</p>
            <h1 style={styles.heroTitle}>
              Discover Professional<br />Beauty Courses
            </h1>
            <p style={styles.heroSubtitle}>
              Learn from certified experts and advance your career
            </p>
          </div>
          <div style={styles.heroBadge}>
            <p style={styles.heroBadgeLabel}>Available now</p>
            <p style={styles.heroBadgeValue}>{courses.length}</p>
          </div>
        </div>
      </div>

      {/* ── SEARCH ROW ── */}
      <div style={styles.searchRow}>
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by course name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Category dropdown */}
        <div ref={categoryRef} style={{ position: 'relative' }}>
          <button
            style={styles.categoryBtn}
            onClick={() => setShowCategoryDropdown(p => !p)}
          >
            {displayCategory}
            <ChevronDown size={14} />
          </button>
          {showCategoryDropdown && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0,
              backgroundColor: '#fff', border: '1.5px solid #E5E7EB',
              borderRadius: '12px', padding: '8px', zIndex: 30,
              minWidth: '180px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat === 'All' ? '' : cat); setShowCategoryDropdown(false); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '9px 12px', background: 'none', border: 'none',
                    borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                    fontFamily: 'inherit', fontWeight: 500,
                    color: selectedCategory === (cat === 'All' ? '' : cat) ? '#5B62B3' : '#374151',
                    backgroundColor: selectedCategory === (cat === 'All' ? '' : cat) ? '#EEF2FF' : 'transparent',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filters button */}
        <button
          style={{ ...styles.filtersBtn, ...(hasActiveFilters ? styles.filtersBtnActive : {}) }}
          onClick={() => setShowFilters(true)}
        >
          <SlidersHorizontal size={15} />
          Filters
          {hasActiveFilters && (
            <span style={{
              backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '50%',
              width: '18px', height: '18px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '10px', fontWeight: 700,
            }}>
              {[selectedCategory, priceRange[0] > 0, priceRange[1] < 10000, maxDuration < 9999,
                ...difficulty, certOnly, minRating > 0, selectedVendor !== 'all'].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* ── COUNT ── */}
      <div style={styles.countRow}>
        <p style={styles.countText}>
          Showing {filteredCourses.length} of {courses.length} courses
        </p>
      </div>

      {/* ── AI RECOMMENDATIONS ── */}
      {courseRecs.length > 0 && (
        <div style={styles.recsSection}>
          <p style={styles.recsSectionTitle}>✨ Recommended for You</p>
          <p style={styles.recsSectionSub}>Based on your activity and preferences</p>
          <div style={styles.recsScroll}>
            {courseRecs.map((course: any) => {
              const BASE_URL = (import.meta as any).env?.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
              const rawSrc = course.thumbnail || course.images?.[0] || course.imageUrl || '';
              const imgSrc = rawSrc.startsWith('http') ? rawSrc : rawSrc ? `${BASE_URL}${rawSrc}` : '';
              return (
                <div
                  key={course._id}
                  style={styles.recCard}
                  onClick={() => navigate(`/client/courses/${course._id}`)}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {imgSrc
                    ? <img src={imgSrc} alt={course.title} style={styles.recCardImg} />
                    : <div style={{ ...styles.recCardImg, backgroundColor: '#C7D2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={28} color="#5B62B3" />
                      </div>
                  }
                  <div style={styles.recCardBody}>
                    <p style={styles.recCardTitle}>{course.title}</p>
                    <p style={styles.recCardPrice}>Rs. {course.price?.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ALL COURSES ── */}
      <div style={styles.allSection}>
        <p style={styles.allTitle}>All Courses</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF', fontSize: '14px' }}>
            Loading courses...
          </div>
        ) : filteredCourses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF', fontSize: '14px' }}>
            No courses found matching your filters.
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredCourses.map(course => {
              const inCompare = compareList.find((c: any) => c._id === course._id);
              const discount = calculateDiscount(course.price, course.discountPrice);
              return (
                <div
                  key={course._id}
                  style={styles.card}
                  onClick={() => navigate(`/client/courses/${course._id}`)}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(79,70,229,0.12)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Image */}
                  <div style={{ position: 'relative' }}>
                    <img
                      src={getImageUrl(course.imageUrl)}
                      alt={course.title}
                      style={styles.cardImg}
                    />
                    <div style={styles.cardBadgeRow}>
                      {discount > 0 && (
                        <span style={{ ...styles.badge, ...styles.discountBadge }}>
                          {discount}% OFF
                        </span>
                      )}
                      {course.level && (
                        <span style={{ ...styles.badge, ...styles.levelBadge }}>
                          {course.level}
                        </span>
                      )}
                    </div>
                    <button
                      style={{ ...styles.compareBtn, ...(inCompare ? styles.compareBtnActive : {}) }}
                      onClick={e => { e.stopPropagation(); toggleCompare(course); }}
                      title="Compare"
                    >
                      {inCompare
                        ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L4.5 8.5L9 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        : <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2v8" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/></svg>
                      }
                    </button>
                  </div>

                  {/* Body */}
                  <div style={styles.cardBody}>
                    <p style={styles.cardCategory}>{course.category}</p>
                    <h3 style={styles.cardTitle}>{course.title}</h3>
                    <p style={styles.cardDesc}>{course.description}</p>

                    <div style={styles.cardMeta}>
                      <span style={styles.cardMetaItem}>
                        <Clock size={11} />
                        {course.duration} min
                      </span>
                      <span style={styles.cardMetaItem}>
                        <Star size={11} style={{ color: '#FFC107', fill: '#FFC107' }} />
                        <strong>{course.rating.toFixed(1)}</strong>
                        <span style={{ color: '#D1D5DB' }}>({course.reviewCount})</span>
                      </span>
                      {course.enrollmentCount > 0 && (
                        <span style={styles.cardMetaItem}>
                          <Users size={11} />
                          {course.enrollmentCount}
                        </span>
                      )}
                      {course.certificateIncluded && (
                        <span style={{ ...styles.cardMetaItem, color: '#5B62B3' }}>
                          <Award size={11} />
                          Certificate
                        </span>
                      )}
                    </div>

                    <div style={styles.cardFooter}>
                      <div style={styles.priceWrap}>
                        {course.discountPrice ? (
                          <>
                            <span style={styles.priceOld}>Rs. {course.price.toLocaleString()}</span>
                            <span style={styles.priceDiscount}>Rs. {course.discountPrice.toLocaleString()}</span>
                          </>
                        ) : (
                          <span style={styles.priceMain}>Rs. {course.price.toLocaleString()}</span>
                        )}
                      </div>
                      <button
                        style={styles.enrollBtn}
                        onClick={e => { e.stopPropagation(); navigate(`/client/courses/${course._id}`); }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#4338CA')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#5B62B3')}
                      >
                        Enroll Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FILTER MODAL ── */}
      {showFilters && (
        <div style={styles.overlay} onClick={e => { if (e.target === e.currentTarget) setShowFilters(false); }}>
          <div style={styles.filterModal}>
            <div style={styles.filterModalHeader}>
              <h2 style={styles.filterModalTitle}>Filters</h2>
              <button style={styles.filterCloseBtn} onClick={() => setShowFilters(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Price Range */}
            <div style={styles.filterSection}>
              <label style={styles.filterLabel}>Price Range</label>
              <div style={styles.filterInputRow}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>Min (Rs.)</div>
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                    style={styles.filterInput}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>Max (Rs.)</div>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                    style={styles.filterInput}
                  />
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={10000}
                step={100}
                value={priceRange[1]}
                onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                style={{ width: '100%', accentColor: '#5B62B3' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
                <span>Rs. 0</span>
                <span>Rs. {priceRange[1].toLocaleString()}</span>
              </div>
            </div>

            <div style={styles.filterDivider} />

            {/* Minimum Rating */}
            <div style={styles.filterSection}>
              <label style={styles.filterLabel}>Minimum Rating</label>
              {[{ label: 'Any Rating', value: 0 }, { label: '4+ Stars', value: 4 }, { label: '4.5+ Stars', value: 4.5 }].map(opt => (
                <label key={opt.value} style={styles.radioRow}>
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === opt.value}
                    onChange={() => setMinRating(opt.value)}
                    style={{ accentColor: '#5B62B3', width: '16px', height: '16px' }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>

            <div style={styles.filterDivider} />

            {/* Max Duration */}
            <div style={styles.filterSection}>
              <label style={styles.filterLabel}>Max Duration</label>
              <select value={maxDuration} onChange={e => setMaxDuration(Number(e.target.value))} style={styles.filterSelect}>
                <option value={9999}>Any Duration</option>
                <option value={30}>Up to 30 min</option>
                <option value={60}>Up to 1 hour</option>
                <option value={120}>Up to 2 hours</option>
                <option value={180}>Up to 3 hours</option>
              </select>
            </div>

            <div style={styles.filterDivider} />

            {/* Difficulty */}
            <div style={styles.filterSection}>
              <label style={styles.filterLabel}>Difficulty</label>
              {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                <label key={level} style={styles.checkRow}>
                  <input
                    type="checkbox"
                    checked={difficulty.includes(level)}
                    onChange={e => setDifficulty(prev => e.target.checked ? [...prev, level] : prev.filter(d => d !== level))}
                    style={{ accentColor: '#5B62B3', width: '16px', height: '16px' }}
                  />
                  {level}
                </label>
              ))}
            </div>

            <div style={styles.filterDivider} />

            {/* Certificate */}
            <div style={styles.filterSection}>
              <div style={styles.toggleRow}>
                <label style={{ ...styles.filterLabel, margin: 0 }}>Certificate Included</label>
                <div style={styles.toggleTrack(certOnly)} onClick={() => setCertOnly(p => !p)}>
                  <div style={styles.toggleKnob(certOnly)} />
                </div>
              </div>
            </div>

            {/* Instructor */}
            {vendorList.length > 1 && (
              <>
                <div style={styles.filterDivider} />
                <div style={styles.filterSection}>
                  <label style={styles.filterLabel}>Instructor</label>
                  <select value={selectedVendor} onChange={e => setSelectedVendor(e.target.value)} style={styles.filterSelect}>
                    <option value="all">All Instructors</option>
                    {vendorList.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
              </>
            )}

            <div style={styles.filterFooter}>
              <button style={styles.resetBtn} onClick={resetFilters}>Reset Filters</button>
              <button style={styles.doneBtn} onClick={() => setShowFilters(false)}>Done ✓</button>
            </div>
          </div>
        </div>
      )}

      {/* ── COMPARE BAR ── */}
      {compareList.length >= 2 && (
        <div style={styles.compareBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>
              Comparing {compareList.length} courses:
            </span>
            {compareList.map((c: any) => (
              <div key={c._id} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '5px 10px',
              }}>
                <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>{c.title}</span>
                <button onClick={() => toggleCompare(c)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: 0 }}>×</button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setCompareList([])} style={{ padding: '9px 18px', backgroundColor: 'transparent', color: '#9CA3AF', border: '1px solid #4B5563', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
              Clear All
            </button>
            <button onClick={() => navigate('/client/courses/compare', { state: { courses: compareList } })} style={{ padding: '9px 20px', backgroundColor: '#5B62B3', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
              Compare Now →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseBrowse;