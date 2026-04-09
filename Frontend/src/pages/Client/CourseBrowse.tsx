// Frontend/src/pages/Client/CourseBrowse.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, BookOpen, Clock, Users, Star, Award } from 'lucide-react';
import courseService from '../../services/api/courseService';

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
  const [filters, setFilters] = useState({
    category: 'all',
    level: 'all',
    search: '',
    minPrice: '',
    maxPrice: '',
  });

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

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const filterParams: any = {};
      
      if (filters.category !== 'all') filterParams.category = filters.category;
      if (filters.level !== 'all') filterParams.level = filters.level;
      if (filters.search) filterParams.search = filters.search;
      if (filters.minPrice) filterParams.minPrice = filters.minPrice;
      if (filters.maxPrice) filterParams.maxPrice = filters.maxPrice;

      const response = await courseService.getAllCourses(filterParams);
      setCourses(response.courses || response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchCourses();
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA', padding: '24px' }}>
      {/* Header */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 600, 
          marginBottom: '8px',
          fontFamily: 'Syne, sans-serif',
          color: '#111111'
        }}>
          Course Catalog and Enrollment
        </h1>
        <p style={{ color: '#666', fontSize: '16px', fontFamily: 'Montserrat, sans-serif' }}>
          Learn professional beauty skills with certified academies
        </p>
      </div>

      {/* Filters */}
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '16px'
        }}>
          {/* Search */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#666'
              }} />
              <input
                type="text"
                placeholder="Search courses..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Montserrat, sans-serif',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Category */}
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            style={{
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'Montserrat, sans-serif',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat === 'All' ? 'all' : cat}>{cat}</option>
            ))}
          </select>

          {/* Level */}
          <select
            value={filters.level}
            onChange={(e) => handleFilterChange('level', e.target.value)}
            style={{
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'Montserrat, sans-serif',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {levels.map(lvl => (
              <option key={lvl} value={lvl === 'All' ? 'all' : lvl.toLowerCase()}>{lvl}</option>
            ))}
          </select>

          {/* Price Range */}
          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            style={{
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'Montserrat, sans-serif',
              outline: 'none'
            }}
          />
          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            style={{
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'Montserrat, sans-serif',
              outline: 'none'
            }}
          />
        </div>

        <button
          onClick={applyFilters}
          style={{
            padding: '12px 24px',
            backgroundColor: '#E91E63',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'Montserrat, sans-serif'
          }}
        >
          Apply Filters
        </button>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px',
          fontFamily: 'Montserrat, sans-serif',
          color: '#666'
        }}>
          Loading courses...
        </div>
      ) : courses.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px',
          fontFamily: 'Montserrat, sans-serif',
          color: '#666'
        }}>
          No courses found
        </div>
      ) : (
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {courses.map(course => (
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
              <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                <img
                  src={getImageUrl(course.imageUrl)}
                  alt={course.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {course.discountPrice && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: '#E91E63',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {calculateDiscount(course.price, course.discountPrice)}% OFF
                  </div>
                )}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 600,
                  fontFamily: 'Montserrat, sans-serif',
                  textTransform: 'uppercase',
                  color: '#666'
                }}>
                  {course.level}
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '20px' }}>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#E91E63',
                  fontWeight: 600,
                  marginBottom: '8px',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {course.category}
                </div>

                <h3 style={{ 
                  fontSize: '18px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: '#111',
                  fontFamily: 'Syne, sans-serif',
                  lineHeight: '1.4',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {course.title}
                </h3>

                <p style={{
                  fontSize: '13px',
                  color: '#666',
                  marginBottom: '16px',
                  fontFamily: 'Montserrat, sans-serif',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {course.description}
                </p>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  marginBottom: '12px'
                }}>
                  <BookOpen size={16} style={{ color: '#666' }} />
                  <span style={{ 
                    fontSize: '13px', 
                    color: '#666',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    by {course.instructorName}
                  </span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  gap: '16px',
                  marginBottom: '16px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid #eee'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={14} style={{ color: '#FFC107', fill: '#FFC107' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
                      {course.rating.toFixed(1)}
                    </span>
                    <span style={{ fontSize: '12px', color: '#999', fontFamily: 'Montserrat, sans-serif' }}>
                      ({course.reviewCount})
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={14} style={{ color: '#666' }} />
                    <span style={{ fontSize: '13px', color: '#666', fontFamily: 'Montserrat, sans-serif' }}>
                      {course.enrollmentCount} enrolled
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} style={{ color: '#666' }} />
                    <span style={{ fontSize: '13px', color: '#666', fontFamily: 'Montserrat, sans-serif' }}>
                      {course.duration}h
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    {course.discountPrice ? (
                      <>
                        <span style={{ 
                          fontSize: '24px', 
                          fontWeight: 700,
                          color: '#E91E63',
                          fontFamily: 'Montserrat, sans-serif'
                        }}>
                          ${course.discountPrice}
                        </span>
                        <span style={{ 
                          fontSize: '16px',
                          color: '#999',
                          textDecoration: 'line-through',
                          marginLeft: '8px',
                          fontFamily: 'Montserrat, sans-serif'
                        }}>
                          ${course.price}
                        </span>
                      </>
                    ) : (
                      <span style={{ 
                        fontSize: '24px', 
                        fontWeight: 700,
                        color: '#111',
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        ${course.price}
                      </span>
                    )}
                  </div>

                  {course.certificateIncluded && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Award size={16} style={{ color: '#E91E63' }} />
                      <span style={{ 
                        fontSize: '11px',
                        color: '#E91E63',
                        fontWeight: 600,
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        Certificate
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseBrowse;
