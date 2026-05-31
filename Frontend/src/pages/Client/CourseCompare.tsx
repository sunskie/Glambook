import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, Star, Clock, DollarSign, BookOpen,
         Users, Award, ArrowLeft, Flame } from 'lucide-react';

const CourseCompare = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const courses: any[] = location.state?.courses || [];

  if (courses.length === 0) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <BookOpen size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>
          No courses selected for comparison.
        </p>
        <button
          onClick={() => navigate('/client/courses')}
          style={{ background: '#6366f1', color: 'white', border: 'none',
                   borderRadius: '8px', padding: '10px 24px', cursor: 'pointer' }}
        >
          Browse Courses
        </button>
      </div>
    );
  }

  // Determine best values
  const prices = courses.map(c => c.price || 0);
  const ratings = courses.map(c => c.rating || 0);
  const lowestPrice = Math.min(...prices);
  const highestRating = Math.max(...ratings);

  // Best overall = highest rating, if tie = lowest price
  const bestOverall = courses.reduce((best, course) => {
    if (!best) return course;
    if ((course.rating || 0) > (best.rating || 0)) return course;
    if ((course.rating || 0) === (best.rating || 0) &&
        (course.price || 0) < (best.price || 0)) return course;
    return best;
  }, null);

  const fields = [
    {
      label: 'Image',
      render: (c: any) => (
        <img
          src={c.thumbnail || c.image || '/placeholder-course.jpg'}
          alt={c.title}
          style={{ width: '100px', height: '70px', objectFit: 'cover',
                   borderRadius: '8px' }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-course.jpg';
          }}
        />
      ),
      isBest: () => false,
    },
    {
      label: 'Course Name',
      render: (c: any) => (
        <span style={{ fontWeight: '600', color: '#111827' }}>{c.title}</span>
      ),
      isBest: () => false,
    },
    {
      label: 'Category',
      render: (c: any) => c.category || '—',
      isBest: () => false,
    },
    {
      label: 'Price',
      render: (c: any, isBest: boolean) => (
        <span style={{ display: 'flex', alignItems: 'center',
                       justifyContent: 'center', gap: '6px' }}>
          <Flame size={14} color={isBest ? '#f59e0b' : '#6b7280'} />
          <span style={{ fontWeight: '600', color: isBest ? '#111827' : '#374151' }}>
            Rs. {(c.price || 0).toLocaleString()}
          </span>
          {isBest && (
            <span style={{ fontSize: '11px', background: '#dbeafe',
                           color: '#2563eb', padding: '2px 7px',
                           borderRadius: '20px', fontWeight: '600' }}>
              Best Value
            </span>
          )}
        </span>
      ),
      isBest: (c: any) => (c.price || 0) === lowestPrice,
      highlight: (c: any) => (c.price || 0) === lowestPrice,
    },
    {
      label: 'Duration',
      render: (c: any) => (
        <span style={{ display: 'flex', alignItems: 'center',
                       justifyContent: 'center', gap: '5px', color: '#374151' }}>
          <Clock size={14} color="#9ca3af" />
          {c.duration ? `${c.duration} hrs` : '—'}
        </span>
      ),
      isBest: () => false,
    },
    {
      label: 'Rating',
      render: (c: any, isBest: boolean) => (
        <span style={{ display: 'flex', alignItems: 'center',
                       justifyContent: 'center', gap: '6px' }}>
          <Star size={14} color="#f59e0b" fill="#f59e0b" />
          <span style={{ fontWeight: '500' }}>
            {c.rating ? `${c.rating.toFixed(1)} / 5` : 'No rating'}
          </span>
          {isBest && (
            <span style={{ fontSize: '11px', background: '#d1fae5',
                           color: '#059669', padding: '2px 7px',
                           borderRadius: '20px', fontWeight: '600' }}>
              Highest Rated
            </span>
          )}
        </span>
      ),
      isBest: (c: any) => (c.rating || 0) === highestRating && highestRating > 0,
      highlight: (c: any) =>
        (c.rating || 0) === highestRating && highestRating > 0,
    },
    {
      label: 'Reviews',
      render: (c: any) => `${c.reviewCount || c.reviews?.length || 0} reviews`,
      isBest: () => false,
    },
    {
      label: 'Students',
      render: (c: any) => (
        <span style={{ display: 'flex', alignItems: 'center',
                       justifyContent: 'center', gap: '5px' }}>
          <Users size={14} color="#9ca3af" />
          {c.enrolledCount || c.studentsCount || 0}
        </span>
      ),
      isBest: () => false,
    },
    {
      label: 'Certificate',
      render: (c: any) => (
        <span style={{ display: 'flex', alignItems: 'center',
                       justifyContent: 'center', gap: '5px',
                       color: c.hasCertificate ? '#059669' : '#9ca3af' }}>
          <Award size={14} />
          {c.hasCertificate ? 'Included' : 'Not included'}
        </span>
      ),
      isBest: () => false,
    },
    {
      label: 'Instructor',
      render: (c: any) => c.vendorName || c.instructor || '—',
      isBest: () => false,
    },
  ];

  const colWidth = `${Math.floor(75 / courses.length)}%`;

  return (
    <div style={{ padding: '28px 24px', maxWidth: '1100px', margin: '0 auto',
                  fontFamily: 'Inter, sans-serif', color: '#111827' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px',
                    marginBottom: '24px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px',
                   background: 'transparent', border: '1px solid #e5e7eb',
                   borderRadius: '8px', padding: '8px 14px',
                   cursor: 'pointer', color: '#6b7280', fontSize: '13px' }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>
            Compare Courses
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
            Choose the best course for you
          </p>
        </div>
      </div>

      {/* Best Overall Banner */}
      {bestOverall && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px',
                      background: '#fffbeb', border: '1px solid #fde68a',
                      borderRadius: '12px', padding: '14px 20px',
                      marginBottom: '24px' }}>
          <Trophy size={20} color="#f59e0b" />
          <span style={{ fontWeight: '600', color: '#92400e', fontSize: '14px' }}>
            <strong>{bestOverall.title}</strong> is the best overall with highest
            rating and lowest price
          </span>
        </div>
      )}

      {/* Compare Table */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '14px',
                    overflow: 'hidden', background: 'white' }}>

        {/* Best Overall badge row */}
        <div style={{ display: 'grid',
                      gridTemplateColumns: `200px repeat(${courses.length}, ${colWidth})` }}>
          <div style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb',
                        padding: '12px 16px' }} />
          {courses.map((course) => (
            <div key={course._id}
              style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb',
                       borderLeft: '1px solid #e5e7eb',
                       padding: '10px 16px', textAlign: 'center' }}>
              {bestOverall?._id === course._id && (
                <span style={{ display: 'inline-flex', alignItems: 'center',
                               gap: '5px', fontSize: '12px', fontWeight: '600',
                               background: '#fef3c7', color: '#92400e',
                               padding: '4px 12px', borderRadius: '20px' }}>
                  <Trophy size={12} /> Best Overall
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Field rows */}
        {fields.map((field, rowIdx) => (
          <div
            key={rowIdx}
            style={{ display: 'grid',
                     gridTemplateColumns: `200px repeat(${courses.length}, ${colWidth})`,
                     borderBottom: rowIdx < fields.length - 1
                       ? '1px solid #f3f4f6' : 'none' }}
          >
            {/* Label */}
            <div style={{ padding: '16px', display: 'flex', alignItems: 'center',
                          background: rowIdx % 2 === 0 ? 'white' : '#fafafa',
                          fontSize: '13px', fontWeight: '500', color: '#374151' }}>
              {field.label}
            </div>

            {/* Values */}
            {courses.map((course) => {
              const best = field.isBest(course);
              const highlight = (field as any).highlight?.(course) ?? false;
              return (
                <div key={course._id}
                  style={{ padding: '16px', textAlign: 'center',
                           borderLeft: '1px solid #f3f4f6',
                           display: 'flex', alignItems: 'center',
                           justifyContent: 'center',
                           background: highlight
                             ? (field.label === 'Price' ? '#eff6ff' : '#f0fdf4')
                             : rowIdx % 2 === 0 ? 'white' : '#fafafa',
                           fontSize: '13px', color: '#374151' }}>
                  {field.render(course, best)}
                </div>
              );
            })}
          </div>
        ))}

        {/* Enroll buttons row */}
        <div style={{ display: 'grid',
                      gridTemplateColumns: `200px repeat(${courses.length}, ${colWidth})`,
                      background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ padding: '20px 16px', fontSize: '13px',
                        fontWeight: '500', color: '#374151',
                        display: 'flex', alignItems: 'center' }}>
            Action
          </div>
          {courses.map((course) => (
            <div key={course._id}
              style={{ padding: '16px', textAlign: 'center',
                       borderLeft: '1px solid #e5e7eb' }}>
              <button
                onClick={() => navigate(`/client/courses/${course._id}`)}
                style={{ background: '#6366f1', color: 'white', border: 'none',
                         borderRadius: '8px', padding: '10px 24px',
                         cursor: 'pointer', fontWeight: '600',
                         fontSize: '13px', width: '100%', maxWidth: '160px' }}
              >
                Enroll Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseCompare;
