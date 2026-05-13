// Frontend/src/pages/Client/CourseBrowse.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import courseService from '../../services/api/courseService';
import api from '../../utils/api';

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

const CourseBrowse: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseRecs, setCourseRecs] = useState<any[]>([]);
  const [compareList, setCompareList] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [maxDuration, setMaxDuration] = useState<number>(9999);
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [certOnly, setCertOnly] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);

  const categories = [
    'All',
    'Hair Styling',
    'Makeup',
    'Skincare',
    'Nails',
    'Spa & Wellness',
    'Business & Marketing',
    'Other',
  ];

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const toggleCompare = (course: any) => {
    setCompareList(prev => {
      const exists = prev.find((c: any) => c._id === course._id);
      if (exists) return prev.filter((c: any) => c._id !== course._id);
      if (prev.length >= 3) { alert('You can compare up to 3 courses at a time.'); return prev; }
      return [...prev, course];
    });
  };

  useEffect(() => {
    fetchCourses();
  }, []);

useEffect(() => {
  api.get('/recommendations/courses?limit=4')
    .then((res: any) => {
      setCourseRecs(res.data?.courses || res.courses || []);
    })
    .catch(() => {});
}, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getAllCourses();
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA' }}>

      {/* ===== HERO BANNER ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #5B62B3 0%, #E91E63 100%)',
        padding: '48px 24px',
        textAlign: 'center' as const,
        fontFamily: 'Montserrat, sans-serif',
      }}>
        <h1 style={{
          fontSize: '42px',
          fontWeight: 800,
          margin: '0 0 12px',
          fontFamily: 'Syne, sans-serif',
          color: 'white',
          letterSpacing: '-0.5px',
        }}>
          Discover Professional Beauty Courses
        </h1>
        <p style={{
          fontSize: '18px',
          margin: 0,
          color: 'rgba(255,255,255,0.9)',
          fontWeight: 500,
        }}>
          Learn from certified experts and advance your career
        </p>
      </div>

      {/* ===== CATEGORY PILLS ===== */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap' as const,
        fontFamily: 'Montserrat, sans-serif',
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat === 'All' ? '' : cat)}
            style={{
              padding: '10px 20px',
              backgroundColor: selectedCategory === (cat === 'All' ? '' : cat) ? '#5B62B3' : 'white',
              color: selectedCategory === (cat === 'All' ? '' : cat) ? 'white' : '#374151',
              border: `1.5px solid ${selectedCategory === (cat === 'All' ? '' : cat) ? '#5B62B3' : '#E5E7EB'}`,
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ===== MAIN TWO-COLUMN LAYOUT ===== */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 48px', display: 'flex', gap: '32px', fontFamily: 'Montserrat, sans-serif' }}>

        {/* ===== LEFT FILTER PANEL ===== */}
        <div style={{ width: '280px', flexShrink: 0 }}>
          {/* Search */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', fontSize: '14px', color: '#111' }}>Search</label>
            <input
              type="text"
              placeholder="Course name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1.5px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box' as const,
              }}
            />
          </div>

          {/* Price Range */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', fontSize: '14px', color: '#111' }}>Price Range</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="number"
                placeholder="Min"
                value={priceRange[0]}
                onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box' as const,
                }}
              />
              <input
                type="number"
                placeholder="Max"
                value={priceRange[1]}
                onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box' as const,
                }}
              />
            </div>
          </div>

          {/* Duration */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', fontSize: '14px', color: '#111' }}>Max Duration</label>
            <select
              value={maxDuration}
              onChange={e => setMaxDuration(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1.5px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
              }}
            >
              <option value={9999}>Any Duration</option>
              <option value={30}>Up to 30 min</option>
              <option value={60}>Up to 1 hour</option>
              <option value={120}>Up to 2 hours</option>
              <option value={180}>Up to 3 hours</option>
            </select>
          </div>

          {/* Difficulty */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', fontSize: '14px', color: '#111' }}>Difficulty</label>
            {['Beginner', 'Intermediate', 'Advanced'].map(level => (
              <label key={level} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer', fontSize: '14px' }}>
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

          {/* Certificate Toggle */}
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ fontWeight: 700, fontSize: '14px', color: '#111' }}>Certificate Included</label>
            <div
              onClick={() => setCertOnly(p => !p)}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '12px',
                backgroundColor: certOnly ? '#5B62B3' : '#D1D5DB',
                cursor: 'pointer',
                position: 'relative' as const,
                transition: 'background 0.2s',
              }}
            >
              <div style={{
                position: 'absolute' as const,
                top: '3px',
                left: certOnly ? '22px' : '3px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: 'white',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>
          </div>

          {/* Rating */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', fontSize: '14px', color: '#111' }}>Minimum Rating</label>
            {[
              { label: 'Any Rating', value: 0 },
              { label: '4+ Stars', value: 4 },
              { label: '4.5+ Stars', value: 4.5 },
            ].map(opt => (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer', fontSize: '14px' }}>
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

          {/* Vendor Filter */}
          {vendorList.length > 1 && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', fontSize: '14px', color: '#111' }}>Instructor</label>
              <select
                value={selectedVendor}
                onChange={e => setSelectedVendor(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              >
                <option value="all">All Instructors</option>
                {vendorList.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Reset */}
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
              setPriceRange([0, 10000]);
              setMaxDuration(9999);
              setDifficulty([]);
              setCertOnly(false);
              setMinRating(0);
              setSelectedVendor('all');
            }}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'white',
              color: '#374151',
              border: '1.5px solid #E5E7EB',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Reset All Filters
          </button>
        </div>

        {/* ===== RIGHT COURSES GRID ===== */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
              Showing {filteredCourses.length} courses
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
              Loading courses...
            </div>
          ) : filteredCourses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
              No courses found
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
            }}>
              {filteredCourses.map(course => (
                <div
                  key={course._id}
                  onClick={() => navigate(`/client/courses/${course._id}`)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                  }}
                >
                  {/* Image */}
                  <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
                    <img
                      src={getImageUrl(course.imageUrl)}
                      alt={course.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {course.discountPrice && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: '#E91E63',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '15px',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}>
                        {calculateDiscount(course.price, course.discountPrice)}% OFF
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ padding: '16px' }}>
                    <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#E91E63', fontWeight: 600, textTransform: 'uppercase' }}>
                      {course.category}
                    </p>
                    <h3 style={{
                      margin: '0 0 8px',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#111',
                      fontFamily: 'Syne, sans-serif',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {course.title}
                    </h3>
                    <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#666', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {course.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                      <Star size={12} style={{ color: '#FFC107', fill: '#FFC107' }} />
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>{course.rating.toFixed(1)}</span>
                      <span style={{ fontSize: '11px', color: '#999' }}>({course.reviewCount})</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        {course.discountPrice ? (
                          <>
                            <span style={{ fontSize: '18px', fontWeight: 700, color: '#E91E63' }}>
                              ${course.discountPrice}
                            </span>
                            <span style={{ fontSize: '12px', color: '#999', textDecoration: 'line-through', marginLeft: '6px' }}>
                              ${course.price}
                            </span>
                          </>
                        ) : (
                          <span style={{ fontSize: '18px', fontWeight: 700, color: '#111' }}>
                            ${course.price}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); toggleCompare(course); }}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: compareList.find((c: any) => c._id === course._id) ? '#5B62B3' : 'white',
                          border: `2px solid ${compareList.find((c: any) => c._id === course._id) ? '#5B62B3' : '#E5E7EB'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        {compareList.find((c: any) => c._id === course._id) && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6L4.5 8.5L9 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== AI RECOMMENDATIONS SECTION ===== */}
      {courseRecs.length > 0 && (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 48px', fontFamily: 'Montserrat, sans-serif' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 800, color: '#111', fontFamily: 'Syne, sans-serif' }}>
            Recommended Courses ✨
          </h2>
          <div style={{ display: 'flex', gap: '18px', overflowX: 'auto', paddingBottom: '8px' }}>
            {courseRecs.map((course: any) => {
              const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
              const rawSrc = course.thumbnail || course.images?.[0] || '';
              const imgSrc = rawSrc.startsWith('http') ? rawSrc : rawSrc ? `${BASE_URL}${rawSrc}` : '';
              return (
                <div
                  key={course._id}
                  onClick={() => navigate(`/client/courses/${course._id}`)}
                  style={{ minWidth: '240px', maxWidth: '240px', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                >
                  <div style={{ height: '140px', backgroundColor: '#FFF0F5', position: 'relative' as const }}>
                    {imgSrc && <img src={imgSrc} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ padding: '12px' }}>
                    <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{course.title}</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#E91E63' }}>Rs. {course.price}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== FLOATING COMPARE BAR ===== */}
      {compareList.length >= 2 && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: '#1e1b4b',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.18)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: 'white', fontSize: '13px', fontWeight: 700 }}>Comparing {compareList.length} courses:</span>
            {compareList.map((c: any) => (
              <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '6px 12px' }}>
                <span style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>{c.title}</span>
                <button onClick={() => toggleCompare(c)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: 0 }}>×</button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setCompareList([])} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: '#9CA3AF', border: '1px solid #4B5563', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Clear All</button>
            <button onClick={() => navigate(`/client/compare-courses?ids=${compareList.map((c: any) => c._id).join(',')}`)} style={{ padding: '10px 24px', backgroundColor: '#E91E63', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Compare Now →</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseBrowse;
