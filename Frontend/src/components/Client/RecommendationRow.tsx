import { useNavigate } from 'react-router-dom';

interface Props {
  items: any[];
  type: 'service' | 'course';
  title?: string;
}

const RecommendationRow = ({ items, type, title = 'You Might Also Like' }: Props) => {
  const navigate = useNavigate();

  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginTop: '32px', fontFamily: 'Montserrat, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <h3 style={{
          margin: 0, fontSize: '16px', fontWeight: 700,
          color: '#111', fontFamily: 'Syne, sans-serif',
          borderLeft: '3px solid #5B62B3',
          paddingLeft: '10px',
        }}>
          {title}
        </h3>
      </div>

      {/* Horizontal scroll row */}
      <div style={{
        display: 'flex', gap: '14px',
        overflowX: 'auto', paddingBottom: '8px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}>
        {items.map((item: any) => (
          <div
            key={item._id}
            onClick={() => navigate(type === 'service' ? `/client/book/${item._id}` : `/client/courses/${item._id}`)}
            style={{
              minWidth: '180px', maxWidth: '180px', flexShrink: 0,
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '14px', overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.18s, box-shadow 0.18s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(91,98,179,0.15)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
            }}
          >
            {/* Image */}
            {(() => {
              const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
              const rawSrc = item.imageUrl || item.images?.[0] || item.thumbnail || '';
              const imgSrc = rawSrc.startsWith('http') ? rawSrc : rawSrc ? `${BASE_URL}${rawSrc}` : '';
              return (
                <div style={{ position: 'relative' as const, height: '130px', backgroundColor: '#EEF2FF', overflow: 'hidden' }}>
                  {/* Emoji fallback — always behind */}
                  <div style={{
                    position: 'absolute' as const, inset: 0,
                    background: 'linear-gradient(135deg, #EEF2FF 0%, #C7D2FE 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '36px', zIndex: 0,
                  }}>
                    {item.category?.toLowerCase().includes('nail') ? '💅' :
                     item.category?.toLowerCase().includes('hair') ? '💇' :
                     item.category?.toLowerCase().includes('makeup') ? '💄' :
                     item.category?.toLowerCase().includes('massage') ? '🧖' : '✨'}
                  </div>
                  {/* Real image — on top, hides on error */}
                  {imgSrc && (
                    <img
                      src={imgSrc}
                      alt={item.title}
                      style={{
                        position: 'absolute' as const, inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover', zIndex: 1,
                      }}
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  {/* Category badge */}
                  <span style={{
                    position: 'absolute' as const, top: '10px', left: '10px', zIndex: 2,
                    backgroundColor: '#5B62B3', color: 'white',
                    fontSize: '9px', fontWeight: 700,
                    padding: '3px 8px', borderRadius: '20px',
                    textTransform: 'uppercase' as const, letterSpacing: '0.5px',
                  }}>
                    {item.category || 'Beauty'}
                  </span>
                </div>
              );
            })()}

            {/* Card body */}
            <div style={{ padding: '10px 12px' }}>
              <p style={{
                margin: '0 0 3px', fontSize: '12px', fontWeight: 700,
                color: '#111', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {item.title}
              </p>

              {/* Rating */}
              <p style={{ margin: '0 0 5px', fontSize: '11px', color: '#F59E0B' }}>
                ⭐ {item.rating?.toFixed(1) || 'New'}
                <span style={{ color: '#9CA3AF', marginLeft: '3px' }}>
                  ({item.reviewCount || item.enrollmentCount || 0})
                </span>
              </p>

              {/* Price */}
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#5B62B3' }}>
                Rs. {item.price}
                {type === 'course' && item.discountPrice && (
                  <span style={{ fontSize: '10px', color: '#9CA3AF', textDecoration: 'line-through', marginLeft: '5px' }}>
                    Rs. {item.discountPrice}
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationRow;
