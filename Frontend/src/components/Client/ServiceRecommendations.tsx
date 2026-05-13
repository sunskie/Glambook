import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Star } from 'lucide-react';
import api from '../../utils/api';

interface ServiceRecommendationsProps {
  currentServiceId: string;
  category: string;
  currentServiceTitle: string;
}

const ServiceRecommendations: React.FC<ServiceRecommendationsProps> = ({
  currentServiceId,
  category,
}) => {
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [currentServiceId, category]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/recommendations/services?serviceId=${currentServiceId}&category=${category}&limit=4`);
      const items = res.data?.services || res.data?.data?.services || res.data || [];
      setServices(Array.isArray(items) ? items : []);
    } catch (err: any) {
      console.error('Failed to fetch recommendations:', err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading || services.length === 0) return null;

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Montserrat, sans-serif' }}>
        <Sparkles size={20} style={{ color: '#5B62B3' }} />
        You Might Also Like
      </h2>
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'thin' }}>
        {services.map((service) => (
          <div
            key={service._id}
            onClick={() => navigate(`/client/book/${service._id}`)}
            style={{
              minWidth: '200px',
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '14px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <img
              src={service.imageUrl || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&q=80'}
              alt={service.title}
              style={{ width: '100%', height: '120px', objectFit: 'cover' }}
            />
            <div style={{ padding: '12px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#111', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Montserrat, sans-serif' }}>
                {service.title}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <Star size={11} fill="#F59E0B" stroke="#F59E0B" />
                <span style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'Montserrat, sans-serif' }}>
                  {service.rating?.toFixed(1) || '4.5'} ({service.reviewCount || 0})
                </span>
              </div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#5B62B3', margin: 0, fontFamily: 'Montserrat, sans-serif' }}>
                Rs. {service.price?.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceRecommendations;
