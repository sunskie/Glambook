// Frontend/src/pages/Vendor/VendorServices.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VendorSidebar from '../../components/Vendor/VendorSidebar';
import api from '../../utils/api';
import serviceService from '../../services/api/serviceService';

const VendorServices: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await serviceService.getMyServices();
      const data =
        (res as any)?.services ||
        (res as any)?.data?.services ||
        (res as any)?.data?.data?.services ||
        (Array.isArray((res as any)?.data) ? (res as any).data : null) ||
        [];
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.delete(`/services/${serviceId}`);
      setServices(prev => prev.filter((s: any) => s._id !== serviceId));
    } catch (err) {
      alert('Failed to delete service');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8F9FC', fontFamily: 'Montserrat, sans-serif' }}>
      <VendorSidebar />
      <div style={{ marginLeft: '260px', flex: 1, padding: '40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 800, color: '#111', fontFamily: 'Syne, sans-serif' }}>My Services</h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>Manage your beauty services and offerings</p>
          </div>
          <button
            onClick={() => navigate('/vendor/create-service')}
            style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #5B62B3 0%, #747BCF 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', boxShadow: '0 4px 12px rgba(91,98,179,0.3)' }}
          >
            + Add Service
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Services', value: services.length, icon: '🛍' },
            { label: 'Active', value: services.filter((s: any) => s.status === 'active').length, icon: '✅' },
            { label: 'Inactive', value: services.filter((s: any) => s.status !== 'active').length, icon: '⏸' },
          ].map((stat, i) => (
            <div key={i} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>{stat.label}</p>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#111', fontFamily: 'Syne, sans-serif' }}>{stat.value}</p>
              </div>
              <span style={{ fontSize: '28px' }}>{stat.icon}</span>
            </div>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center' as const, padding: '60px', color: '#9CA3AF' }}>Loading services...</div>
        )}

        {/* Empty state */}
        {!loading && services.length === 0 && (
          <div style={{ textAlign: 'center' as const, padding: '60px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '48px', margin: '0 0 16px' }}>🛍</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#111', margin: '0 0 8px', fontFamily: 'Syne, sans-serif' }}>No services yet</p>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 24px' }}>Create your first service to start accepting bookings</p>
            <button
              onClick={() => navigate('/vendor/create-service')}
              style={{ padding: '12px 28px', backgroundColor: '#5B62B3', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}
            >
              Create Service
            </button>
          </div>
        )}

        {/* Services list */}
        {!loading && services.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>
            {services.map((service: any) => {
              const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
              const rawSrc = service.images?.[0] || service.image || service.imageUrl || '';
              const imgSrc = rawSrc.startsWith('http') ? rawSrc : rawSrc ? `${BASE_URL}${rawSrc}` : '';

              return (
                <div key={service._id} style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', minHeight: '140px' }}>
                  {/* Image */}
                  <div style={{ width: '160px', flexShrink: 0, position: 'relative' as const, backgroundColor: '#EEF2FF', overflow: 'hidden' }}>
                    <div style={{
  position: 'absolute' as const, inset: 0, zIndex: 0,
  background: service.category?.toLowerCase().includes('nail') ? 'linear-gradient(135deg, #F9A8D4, #EC4899)' :
               service.category?.toLowerCase().includes('hair') ? 'linear-gradient(135deg, #A5B4FC, #6366F1)' :
               service.category?.toLowerCase().includes('makeup') ? 'linear-gradient(135deg, #FCA5A5, #EF4444)' :
               service.category?.toLowerCase().includes('massage') ? 'linear-gradient(135deg, #6EE7B7, #10B981)' :
               service.category?.toLowerCase().includes('skincare') ? 'linear-gradient(135deg, #FDE68A, #F59E0B)' :
               'linear-gradient(135deg, #C4B5FD, #8B5CF6)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}}>
  <span style={{
    fontSize: '32px', fontWeight: 900, color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Syne, sans-serif', letterSpacing: '-1px',
    textShadow: '0 2px 8px rgba(0,0,0,0.15)',
  }}>
    {service.title?.charAt(0)?.toUpperCase() || 'S'}
  </span>
</div>
                    {imgSrc && (
                      <img src={imgSrc} alt={service.title}
                        style={{ position: 'absolute' as const, inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      {/* Category + status badges */}
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#5B62B3', backgroundColor: '#EEF2FF', padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
                          {service.category}
                        </span>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: service.status === 'active' ? '#10B981' : '#9CA3AF', backgroundColor: service.status === 'active' ? '#ECFDF5' : '#F3F4F6', padding: '3px 10px', borderRadius: '20px' }}>
                          {service.status === 'active' ? '● Active' : '● Inactive'}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800, color: '#111', fontFamily: 'Syne, sans-serif' }}>
                        {service.title}
                      </h3>

                      {/* Description */}
                      <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6B7280', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                        {service.description}
                      </p>

                      {/* Meta row */}
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: '#5B62B3' }}>Rs. {service.price}</span>
                        <span style={{ fontSize: '12px', color: '#9CA3AF' }}>⏱ {service.duration} min</span>
                        {service.rating > 0 && <span style={{ fontSize: '12px', color: '#F59E0B' }}>⭐ {service.rating?.toFixed(1)}</span>}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px', marginLeft: '24px', flexShrink: 0 }}>
                      <button
                        onClick={() => navigate(`/vendor/edit-service/${service._id}`)}
                        style={{ padding: '8px 20px', backgroundColor: '#EEF2FF', color: '#5B62B3', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}
                      >
                        ✏ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(service._id)}
                        style={{ padding: '8px 20px', backgroundColor: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorServices;
