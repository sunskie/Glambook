import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import showToast from '../../components/common/Toast';

const ComparePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const services = location.state?.services || [];

  if (services.length < 2) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', fontFamily: 'Montserrat, sans-serif', padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
              marginBottom: '24px',
            }}
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>No services to compare</h2>
            <p style={{ color: '#6B7280', fontSize: '16px' }}>Please select at least 2 services to compare</p>
          </div>
        </div>
      </div>
    );
  }

  const getImageUrl = (url: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80';
    return url.startsWith('http') ? url : `http://localhost:5000${url}`;
  };

  const getVendorName = (vendor: any) => {
    if (typeof vendor === 'object' && vendor?.name) return vendor.name;
    return 'Unknown Vendor';
  };

  const getRating = (service: any) => {
    return service.rating || 0;
  };

  const getReviewsCount = (service: any) => {
    return service.reviewsCount || 0;
  };

  const bestRating = Math.max(...services.map(getRating));
  const lowestPrice = Math.min(...services.map((s: any) => s.price || 0));
  const bestOverallService = services.find((s: any) => getRating(s) === bestRating && (s.price || 0) === lowestPrice);

  const handleBookNow = (serviceId: string) => {
    navigate(`/client/book/${serviceId}`);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', fontFamily: 'Montserrat, sans-serif', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px',
            marginBottom: '24px',
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Compare Services</h1>
        <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '32px' }}>Choose the best service for you</p>

        {bestOverallService && (
          <div style={{
            backgroundColor: '#FEF3C7',
            border: '1px solid #F59E0B',
            borderRadius: '12px',
            padding: '16px 24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <span style={{ fontSize: '20px' }}>🏆</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#92400E' }}>
              {bestOverallService.title} is the best overall with highest rating and lowest price
            </span>
          </div>
        )}

        <div style={{
          backgroundColor: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          {/* Header Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `160px repeat(${services.length}, 1fr)`,
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#fafafa',
          }}>
            <div style={{ padding: '16px', fontWeight: 700, fontSize: '14px', color: '#6B7280' }}></div>
            {services.map((service: any) => (
              <div key={service._id} style={{ padding: '16px', textAlign: 'center' }}>
                {bestOverallService?._id === service._id && (
                  <div style={{
                    backgroundColor: '#FEF3C7',
                    color: '#92400E',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'inline-block',
                    marginBottom: '8px',
                  }}>
                    🏆 Best Overall
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Image Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `160px repeat(${services.length}, 1fr)`,
            borderBottom: '1px solid #E5E7EB',
          }}>
            <div style={{ padding: '16px', fontWeight: 600, fontSize: '13px', color: '#6B7280' }}>Image</div>
            {services.map((service: any) => (
              <div key={`img-${service._id}`} style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
                <img
                  src={getImageUrl(service.imageUrl)}
                  alt={service.title}
                  style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px' }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80';
                  }}
                />
              </div>
            ))}
          </div>

          {/* Service Name Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `160px repeat(${services.length}, 1fr)`,
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#fafafa',
          }}>
            <div style={{ padding: '16px', fontWeight: 600, fontSize: '13px', color: '#6B7280' }}>Service Name</div>
            {services.map((service: any) => (
              <div key={`name-${service._id}`} style={{ padding: '16px', fontWeight: 700, fontSize: '14px', color: '#111' }}>
                {service.title}
              </div>
            ))}
          </div>

          {/* Category Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `160px repeat(${services.length}, 1fr)`,
            borderBottom: '1px solid #E5E7EB',
          }}>
            <div style={{ padding: '16px', fontWeight: 600, fontSize: '13px', color: '#6B7280' }}>Category</div>
            {services.map((service: any) => (
              <div key={`cat-${service._id}`} style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                {service.category}
              </div>
            ))}
          </div>

          {/* Price Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `160px repeat(${services.length}, 1fr)`,
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#fafafa',
          }}>
            <div style={{ padding: '16px', fontWeight: 600, fontSize: '13px', color: '#6B7280' }}>Price</div>
            {services.map((service: any) => {
              const isLowest = (service.price || 0) === lowestPrice;
              return (
                <div key={`price-${service._id}`} style={{
                  padding: '16px',
                  backgroundColor: isLowest ? '#DBEAFE' : 'transparent',
                  fontWeight: 700,
                  fontSize: '14px',
                  color: '#111',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}>
                  {isLowest && <span>💰</span>}
                  Rs. {(service.price || 0).toLocaleString()}
                  {isLowest && <span style={{ fontSize: '11px', color: '#1E40AF', fontWeight: 600 }}>Best Value</span>}
                </div>
              );
            })}
          </div>

          {/* Duration Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `160px repeat(${services.length}, 1fr)`,
            borderBottom: '1px solid #E5E7EB',
          }}>
            <div style={{ padding: '16px', fontWeight: 600, fontSize: '13px', color: '#6B7280' }}>Duration</div>
            {services.map((service: any) => (
              <div key={`dur-${service._id}`} style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                {service.duration || 'Not specified'}
              </div>
            ))}
          </div>

          {/* Rating Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `160px repeat(${services.length}, 1fr)`,
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#fafafa',
          }}>
            <div style={{ padding: '16px', fontWeight: 600, fontSize: '13px', color: '#6B7280' }}>Rating</div>
            {services.map((service: any) => {
              const rating = getRating(service);
              const isBest = rating === bestRating;
              return (
                <div key={`rating-${service._id}`} style={{
                  padding: '16px',
                  backgroundColor: isBest ? '#DCFCE7' : 'transparent',
                  fontWeight: 700,
                  fontSize: '14px',
                  color: '#111',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}>
                  {isBest && <span>⭐</span>}
                  {rating > 0 ? `${rating.toFixed(1)}` : 'No rating'}
                  {isBest && <span style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>Highest Rated</span>}
                </div>
              );
            })}
          </div>

          {/* Reviews Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `160px repeat(${services.length}, 1fr)`,
            borderBottom: '1px solid #E5E7EB',
          }}>
            <div style={{ padding: '16px', fontWeight: 600, fontSize: '13px', color: '#6B7280' }}>Reviews</div>
            {services.map((service: any) => (
              <div key={`reviews-${service._id}`} style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                {getReviewsCount(service)} reviews
              </div>
            ))}
          </div>

          {/* Vendor Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `160px repeat(${services.length}, 1fr)`,
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#fafafa',
          }}>
            <div style={{ padding: '16px', fontWeight: 600, fontSize: '13px', color: '#6B7280' }}>Vendor</div>
            {services.map((service: any) => (
              <div key={`vendor-${service._id}`} style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                {getVendorName(service.vendorId)}
              </div>
            ))}
          </div>

          {/* Book Now Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `160px repeat(${services.length}, 1fr)`,
          }}>
            <div style={{ padding: '16px', fontWeight: 600, fontSize: '13px', color: '#6B7280' }}></div>
            {services.map((service: any) => (
              <div key={`book-${service._id}`} style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => handleBookNow(service._id)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#5B62B3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
