import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Search, Sparkles, MessageCircle } from 'lucide-react';
import serviceService from '../../services/api/serviceService';
import { Service } from '../../types';
import showToast from '../../components/common/Toast';
import axios from 'axios';
import api from '../../utils/api';
import RecommendationRow from '../../components/Client/RecommendationRow';

const BrowsePage: React.FC = () => {
  const navigate = useNavigate();

  // Create chat channel with vendor
  const createChatChannel = async (vendorId: string, serviceName: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast.error('Please login first');
        return;
      }

      // Create deterministic channel ID
      const currentUserId = localStorage.getItem('userId');
      const channelId = [currentUserId, vendorId].sort().join('_');
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/chat/channels/create`,
        { vendorId, serviceName, channelId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        showToast.success('Chat channel created successfully');
        // Navigate to chat
        navigate('/client/chat');
      } else {
        showToast.error(response.data.message || 'Failed to create chat channel');
      }
    } catch (error: any) {
      console.error('Failed to create chat channel:', error);
      showToast.error('Failed to create chat channel');
    }
  };

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalServices, setTotalServices] = useState(0);
  const [compareList, setCompareList] = useState<any[]>([]);
  const [showCompareBar, setShowCompareBar] = useState(false);
  const [hoveredService, setHoveredService] = useState<any>(null);
  const [browseRecommendations, setBrowseRecommendations] = useState<any[]>([]);
  const [browseRecLoaded, setBrowseRecLoaded] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [maxDuration, setMaxDuration] = useState<number>(9999);

  const categories = ['all', 'Hair', 'Makeup', 'Spa', 'Nails', 'Skincare', 'Massage', 'Other'];

  const toggleCompare = (service: any) => {
    setCompareList(prev => {
      const exists = prev.find(s => s._id === service._id);
      if (exists) return prev.filter(s => s._id !== service._id);
      if (prev.length >= 3) {
        showToast.error('You can compare up to 3 services only');
        return prev;
      }
      return [...prev, service];
    });
  };

  useEffect(() => {
    fetchServices(currentPage);
  }, [currentPage, filterCategory, appliedSearch]);

useEffect(() => {
  if (browseRecLoaded) return;
  api.get('/recommendations/services?limit=6')
    .then((res: any) => {
      const items = res.data?.services || res.services || [];
      setBrowseRecommendations(items);
      setBrowseRecLoaded(true);
    })
    .catch(() => {});
}, []);

const fetchServices = async (page: number = 1) => {
    try {
      setLoading(true);
      setError('');

      const filters: { status: string; category?: string; search?: string } = {
        status: 'active',
      };

      if (filterCategory !== 'all') {
        filters.category = filterCategory;
      }

      if (appliedSearch.trim()) {
        filters.search = appliedSearch.trim();
      }

      const response = await serviceService.getAllServices(filters, page);
      const nextServices = Array.isArray(response.data) ? response.data : [];

      setServices(nextServices);
      setCurrentPage(response.page || 1);
      setTotalPages(response.totalPages || 1);
      setTotalServices(response.total || nextServices.length);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to load services';
      setError(msg);
      setServices([]);
      setTotalServices(0);
      setTotalPages(1);
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setAppliedSearch(searchInput.trim());
  };

  const getImageUrl = (imageUrl?: string | null) => {
    if (!imageUrl) {
      return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80';
    }

    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    return `http://localhost:5000${imageUrl}`;
  };

  const getVendorName = (vendorId: Service['vendorId']) => {
    if (typeof vendorId === 'string') {
      return 'Beauty Professional';
    }

    if (typeof vendorId === 'object' && vendorId.name) {
      return vendorId.name;
    }

    return 'Unknown Vendor';
  };

  const vendorList = useMemo(() => {
    const seen = new Map<string, { id: string; name: string }>();
    (services || []).forEach((s: any) => {
      const v = s.vendorId;
      if (!v) return;
      const id = typeof v === 'object' ? v._id : v;
      const name = typeof v === 'object' ? (v.name || 'Unknown') : 'Unknown';
      if (id && !seen.has(id)) seen.set(id, { id, name });
    });
    return Array.from(seen.values());
  }, [services]);

  const filteredServices = services.filter(s => {
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
    if (selectedVendor !== 'all') {
      const vendorId = typeof s.vendorId === 'object' ? s.vendorId._id : s.vendorId;
      if (vendorId !== selectedVendor) return false;
    }
    if (appliedSearch.trim()) {
      const search = appliedSearch.toLowerCase();
      return s.title.toLowerCase().includes(search) || s.description.toLowerCase().includes(search);
    }
    if (s.price < priceRange[0] || s.price > priceRange[1]) return false;
    if (minRating > 0 && (s.rating || 0) < minRating) return false;
    if (s.duration && s.duration > maxDuration) return false;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          borderBottom: '1px solid #E2E4F0',
          backgroundColor: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('/client/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#64748B',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              <ArrowLeft size={18} />
              Dashboard
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '14px',
                  backgroundColor: '#5B62B3',
                  color: 'white',
                }}
              >
                <Sparkles size={22} />
              </div>
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#111111',
                    fontFamily: 'Syne, sans-serif',
                  }}
                >
                  Browse Services
                </h1>
                <p
                  style={{
                    margin: '4px 0 0 0',
                    color: '#64748B',
                    fontSize: '13px',
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  Find beauty appointments and book in a few clicks
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/client/bookings')}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              border: '1px solid #D8DCEF',
              backgroundColor: 'white',
              color: '#111111',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            My Bookings
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px 48px' }}>
        <section
          style={{
            marginBottom: '24px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #5B62B3 0%, #747BCF 50%, #8C92E6 100%)',
            padding: '32px',
            color: 'white',
            boxShadow: '0 20px 60px rgba(91, 98, 179, 0.18)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '24px',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ maxWidth: '720px' }}>
              <p
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.72)',
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                Client Marketplace
              </p>
              <h2
                style={{
                  margin: 0,
                  fontSize: '34px',
                  fontWeight: 700,
                  lineHeight: 1.15,
                  fontFamily: 'Syne, sans-serif',
                }}
              >
                Discover trusted beauty services tailored to your next appointment.
              </h2>
            </div>

            <div
              style={{
                minWidth: '220px',
                borderRadius: '18px',
                backgroundColor: 'rgba(255,255,255,0.16)',
                padding: '18px 20px',
                backdropFilter: 'blur(8px)',
              }}
            >
              <p
                style={{
                  margin: '0 0 6px 0',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.75)',
                  fontWeight: 600,
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                Available right now
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '32px',
                  fontWeight: 700,
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                {loading ? '--' : totalServices}
              </p>
            </div>
          </div>
        </section>

      {/* ── Search + Filter bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', fontFamily: 'Montserrat, sans-serif' }}>
        {/* Search input */}
        <div style={{ flex: 1, position: 'relative' as const }}>
          <span style={{ position: 'absolute' as const, left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: '16px' }}>🔍</span>
          <input
            type="text"
            placeholder="Search by service name or description..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { setAppliedSearch(searchInput.trim()); setCurrentPage(1); } }}
            style={{
              width: '100%', padding: '12px 16px 12px 42px',
              border: '1.5px solid #E5E7EB', borderRadius: '12px',
              fontSize: '14px', fontFamily: 'Montserrat, sans-serif',
              outline: 'none', backgroundColor: 'white',
              boxSizing: 'border-box' as const,
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}
          />
        </div>

        {/* Category dropdown */}
        <select
          value={selectedCategory}
          onChange={e => { setSelectedCategory(e.target.value); setSelectedVendor('all'); }}
          style={{
            padding: '12px 16px', border: '1.5px solid #E5E7EB',
            borderRadius: '12px', fontSize: '14px',
            fontFamily: 'Montserrat, sans-serif', backgroundColor: 'white',
            color: '#374151', cursor: 'pointer', outline: 'none',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)', minWidth: '160px',
          }}
        >
          <option value="all">All Categories</option>
          <option value="Hair Care">Hair Care</option>
          <option value="Nail Care">Nail Care</option>
          <option value="Makeup">Makeup</option>
          <option value="Massage">Massage</option>
          <option value="Skincare">Skincare</option>
          <option value="Other">Other</option>
        </select>

        {/* Filter button */}
        <button
          onClick={() => setFilterOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 20px', backgroundColor: 'white',
            border: '1.5px solid #E5E7EB', borderRadius: '12px',
            fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            fontFamily: 'Montserrat, sans-serif', color: '#374151',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            whiteSpace: 'nowrap' as const,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          Filters
          {(minRating > 0 || priceRange[0] > 0 || priceRange[1] < 10000) && (
            <span style={{ backgroundColor: '#5B62B3', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>!</span>
          )}
        </button>
      </div>

      {/* Vendor filter pills — below search bar */}
      {vendorList.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' as const, fontFamily: 'Montserrat, sans-serif' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>Vendor:</span>
          {[{ id: 'all', name: 'All Vendors' }, ...vendorList].map(vendor => (
            <button key={vendor.id} onClick={() => setSelectedVendor(vendor.id)}
              style={{ padding: '5px 14px', backgroundColor: selectedVendor === vendor.id ? '#5B62B3' : 'white', color: selectedVendor === vendor.id ? 'white' : '#374151', border: `1.5px solid ${selectedVendor === vendor.id ? '#5B62B3' : '#E5E7EB'}`, borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', transition: 'all 0.15s' }}>
              {vendor.name}
            </button>
          ))}
        </div>
      )}

      <section style={{ marginBottom: '20px' }}>
          <p
            style={{
              margin: 0,
              color: '#64748B',
              fontSize: '14px',
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            {loading
              ? 'Loading services...'
              : `Showing ${services.length} of ${totalServices} service${totalServices === 1 ? '' : 's'}`}
          </p>
          {(filterCategory !== 'all' || appliedSearch) && !loading && (
            <p
              style={{
                margin: '8px 0 0 0',
                color: '#94A3B8',
                fontSize: '13px',
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              {filterCategory !== 'all' ? `Category: ${filterCategory}` : 'All categories'}
              {appliedSearch ? ` • Search: "${appliedSearch}"` : ''}
            </p>
          )}
        </section>

        {error && (
          <div
            style={{
              marginBottom: '20px',
              padding: '14px 16px',
              borderRadius: '14px',
              backgroundColor: '#FEF2F2',
              color: '#B91C1C',
              fontSize: '14px',
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            {error}
          </div>
        )}

        {/* ===== YOU MIGHT ALSO LIKE ===== */}
        {browseRecommendations.length > 0 && (
          <div style={{ marginBottom: '36px', fontFamily: 'Montserrat, sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#111', fontFamily: 'Syne, sans-serif' }}>
                You Might Also Like
              </h2>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#6B7280' }}>
              Based on category, ratings, and popularity.
            </p>

            <div style={{ display: 'flex', gap: '18px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
              {browseRecommendations.map((service: any) => {
                return (
                  <div
                    key={service._id}
                    onClick={() => navigate(`/client/book/${service._id}`)}
                    style={{
                      minWidth: '240px', maxWidth: '240px', flexShrink: 0,
                      backgroundColor: 'white', borderRadius: '18px',
                      overflow: 'hidden', cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      border: '1px solid #F3F4F6',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(91,98,179,0.2)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                    }}
                  >
                    {(() => {
                    const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
                    const rawSrc = service.imageUrl || service.images?.[0] || '';
                    const imgSrc = rawSrc.startsWith('http') ? rawSrc : rawSrc ? `${BASE_URL}${rawSrc}` : '';
                    return (
                      <div style={{ position: 'relative' as const, height: '160px', backgroundColor: '#EEF2FF', overflow: 'hidden' }}>
                        {/* Compare tick overlay — top right of image */}
                        <div
                          onClick={e => { e.stopPropagation(); toggleCompare(service); }}
                          style={{
                            position: 'absolute' as const,
                            top: '8px', right: '8px',
                            width: '22px', height: '22px',
                            borderRadius: '50%',
                            backgroundColor: compareList.find((s: any) => s._id === service._id) ? '#5B62B3' : 'rgba(255,255,255,0.85)',
                            border: compareList.find((s: any) => s._id === service._id) ? '2px solid #5B62B3' : '2px solid #D1D5DB',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 3,
                            transition: 'all 0.15s',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                          }}
                        >
                          {compareList.find((s: any) => s._id === service._id) && (
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                              <path d="M2 5.5L4.5 8L9 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <div style={{
                          position: 'absolute' as const, inset: 0,
                          background: 'linear-gradient(135deg, #EEF2FF, #C7D2FE)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '40px', zIndex: 0,
                        }}>
                          {service.category?.toLowerCase().includes('nail') ? '💅' :
                           service.category?.toLowerCase().includes('hair') ? '💇' :
                           service.category?.toLowerCase().includes('makeup') ? '💄' :
                           service.category?.toLowerCase().includes('massage') ? '🧖' : '✨'}
                        </div>
                        {imgSrc && (
                          <img src={imgSrc} alt={service.title}
                            style={{ position: 'absolute' as const, inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        <span style={{
                          position: 'absolute' as const, top: '12px', left: '12px', zIndex: 2,
                          backgroundColor: 'rgba(0,0,0,0.5)', color: 'white',
                          fontSize: '9px', fontWeight: 700, padding: '4px 10px',
                          borderRadius: '20px', letterSpacing: '0.8px',
                        }}>
                          {service.category?.toUpperCase()}
                        </span>
                      </div>
                    );
                    })()}

                    <div style={{ padding: '14px 16px' }}>
                      <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '14px', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {service.title}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        {service.duration && (
                          <span style={{ fontSize: '11px', color: '#6B7280' }}>⏱ {service.duration} min</span>
                        )}
                        {service.rating > 0 && (
                          <span style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 600 }}>⭐ {service.rating?.toFixed(1)}</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: '10px', color: '#9CA3AF' }}>STARTING FROM</p>
                          <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#5B62B3' }}>Rs. {service.price}</p>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/client/book/${service._id}`); }}
                          style={{
                            padding: '7px 18px', backgroundColor: '#5B62B3', color: 'white',
                            border: 'none', borderRadius: '10px', fontWeight: 700,
                            fontSize: '12px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif'
                          }}
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                style={{
                  height: '380px',
                  borderRadius: '20px',
                  background:
                    'linear-gradient(90deg, rgba(226,232,240,0.8) 0%, rgba(241,245,249,1) 50%, rgba(226,232,240,0.8) 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'browseShimmer 1.4s infinite linear',
                }}
              />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '56px 24px',
              textAlign: 'center',
              boxShadow: '0 2px 10px rgba(15, 23, 42, 0.06)',
            }}
          >
            <h3
              style={{
                margin: '0 0 8px 0',
                fontSize: '24px',
                fontWeight: 700,
                color: '#111111',
                fontFamily: 'Syne, sans-serif',
              }}
            >
              No services found
            </h3>
            <p
              style={{
                margin: '0 0 20px 0',
                color: '#64748B',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              Try a different category or simplify the search terms to explore more options.
            </p>
            <button
              onClick={() => {
                setSearchInput('');
                setAppliedSearch('');
                setFilterCategory('all');
                setCurrentPage(1);
              }}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#5B62B3',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {/* Section header */}
            <h2 style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: 800, color: '#111', fontFamily: 'Syne, sans-serif' }}>
              All Services
            </h2>

            {/* Services grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {filteredServices.map((service: any) => (
                <div
                  key={service._id}
                  style={{
                    backgroundColor: 'white', borderRadius: '16px',
                    border: '1px solid #F3F4F6', overflow: 'hidden',
                    display: 'flex', alignItems: 'stretch',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    cursor: 'pointer', transition: 'box-shadow 0.2s',
                    position: 'relative' as const,
                  }}
                  onClick={() => navigate(`/client/book/${service._id}`)}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(91,98,179,0.13)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)')}
                >
                  <div style={{ width: '110px', minWidth: '110px', backgroundColor: '#EEF2FF', overflow: 'hidden', position: 'relative' as const, minHeight: '110px' }}>
                    {/* Compare tick overlay — top right of image */}
                    <div
                      onClick={e => { e.stopPropagation(); toggleCompare(service); }}
                      style={{
                        position: 'absolute' as const,
                        top: '8px', right: '8px',
                        width: '22px', height: '22px',
                        borderRadius: '50%',
                        backgroundColor: compareList.find((s: any) => s._id === service._id) ? '#5B62B3' : 'rgba(255,255,255,0.85)',
                        border: compareList.find((s: any) => s._id === service._id) ? '2px solid #5B62B3' : '2px solid #D1D5DB',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 3,
                        transition: 'all 0.15s',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                      }}
                    >
                      {compareList.find((s: any) => s._id === service._id) && (
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                          <path d="M2 5.5L4.5 8L9 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    {(() => {
                      const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
                      const rawSrc = service.imageUrl || service.images?.[0] || '';
                      const imgSrc = rawSrc.startsWith('http') ? rawSrc : rawSrc ? `${BASE_URL}${rawSrc}` : '';
                      return imgSrc ? (
                        <img src={imgSrc} alt={service.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', minHeight: '110px', background: 'linear-gradient(135deg, #EEF2FF, #C7D2FE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                          {service.category?.toLowerCase().includes('nail') ? '💅' : service.category?.toLowerCase().includes('hair') ? '💇' : service.category?.toLowerCase().includes('makeup') ? '💄' : '✨'}
                        </div>
                      );
                    })()}
                  </div>

                  <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column' as const, justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '14px', color: '#111' }}>
                        {service.title}
                      </p>
                      <p style={{ margin: '0 0 8px', fontSize: '11px', color: '#6B7280',
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                      }}>
                        {service.description}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '10px', color: '#9CA3AF' }}>STARTING FROM</p>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#5B62B3' }}>Rs. {service.price}</p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/client/book/${service._id}`); }}
                        style={{
                          padding: '7px 16px', backgroundColor: '#5B62B3', color: 'white',
                          border: 'none', borderRadius: '9px', fontWeight: 700,
                          fontSize: '12px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif'
                        }}
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div
            style={{
              marginTop: '32px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                border: '1px solid #D8DCEF',
                backgroundColor: currentPage === 1 ? '#F8FAFC' : 'white',
                color: currentPage === 1 ? '#94A3B8' : '#111111',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              Previous
            </button>

            <div
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                backgroundColor: '#EEF2FF',
                color: '#5B62B3',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                border: '1px solid #D8DCEF',
                backgroundColor: currentPage === totalPages ? '#F8FAFC' : 'white',
                color: currentPage === totalPages ? '#94A3B8' : '#111111',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              Next
            </button>
          </div>
        )}
      </main>

      {compareList.length >= 2 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '16px 24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          zIndex: 9998,
          fontFamily: 'Montserrat, sans-serif',
          border: '2px solid #5B62B3',
        }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            backgroundColor: '#5B62B3', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '13px',
          }}>
            {compareList.length}
          </div>
          {compareList.map(s => (
            <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#EEF2FF', padding: '6px 12px', borderRadius: '8px' }}>
              <span style={{ fontSize: '13px', color: '#5B62B3', fontWeight: 600 }}>{s.title}</span>
              <button onClick={() => toggleCompare(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5B62B3', fontWeight: 700, fontSize: '16px', lineHeight: 1 }}>×</button>
            </div>
          ))}
          <button
            onClick={() => navigate('/client/compare', { state: { services: compareList } })}
            style={{ padding: '10px 24px', backgroundColor: '#5B62B3', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}
          >
            Compare Now →
          </button>
          <button
            onClick={() => setCompareList([])}
            style={{ padding: '10px 16px', backgroundColor: 'white', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
          >
            Clear
          </button>
        </div>
      )}

      {/* ── Filter slide-out panel ── */}
      {/* Backdrop */}
      {filterOpen && (
        <div
          onClick={() => setFilterOpen(false)}
          style={{ position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 1100 }}
        />
      )}

      {/* Panel */}
      <div style={{
        position: 'fixed' as const, top: 0, right: 0, bottom: 0,
        width: '340px', backgroundColor: 'white',
        boxShadow: '-4px 0 32px rgba(0,0,0,0.12)',
        zIndex: 1200, transform: filterOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column' as const,
        fontFamily: 'Montserrat, sans-serif',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid #F3F4F6' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#111' }}>Filters</h3>
          <button onClick={() => setFilterOpen(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#6B7280', lineHeight: 1 }}>×</button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column' as const, gap: '28px' }}>

          {/* Price Range */}
          <div>
            <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '14px', color: '#111' }}>Price Range</p>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>Min (Rs.)</label>
                <input type="number" min={0} max={priceRange[1]} value={priceRange[0]}
                  onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                  style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontFamily: 'Montserrat, sans-serif', boxSizing: 'border-box' as const, outline: 'none' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>Max (Rs.)</label>
                <input type="number" min={priceRange[0]} value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                  style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontFamily: 'Montserrat, sans-serif', boxSizing: 'border-box' as const, outline: 'none' }}
                />
              </div>
            </div>
            <input type="range" min={0} max={10000} value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
              style={{ width: '100%', accentColor: '#5B62B3' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9CA3AF' }}>
              <span>Rs. {priceRange[0]}</span><span>Rs. {priceRange[1]}</span>
            </div>
          </div>

          {/* Minimum Rating */}
          <div>
            <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '14px', color: '#111' }}>Minimum Rating</p>
            {[{ label: 'Any Rating', value: 0 }, { label: '4+ Stars', value: 4 }, { label: '4.5+ Stars', value: 4.5 }].map(opt => (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', cursor: 'pointer', fontSize: '14px', color: '#374151' }}>
                <input type="radio" name="rating" checked={minRating === opt.value} onChange={() => setMinRating(opt.value)}
                  style={{ accentColor: '#5B62B3', width: '16px', height: '16px' }} />
                {opt.label}
              </label>
            ))}
          </div>

          {/* Duration filter */}
          <div>
            <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '14px', color: '#111' }}>Max Duration</p>
            <select value={maxDuration} onChange={e => setMaxDuration(Number(e.target.value))}
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontFamily: 'Montserrat, sans-serif', outline: 'none' }}>
              <option value={9999}>Any Duration</option>
              <option value={30}>Up to 30 min</option>
              <option value={60}>Up to 1 hour</option>
              <option value={120}>Up to 2 hours</option>
              <option value={180}>Up to 3 hours</option>
            </select>
          </div>

        </div>

        {/* Footer actions */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #F3F4F6', display: 'flex', gap: '12px' }}>
          <button
            onClick={() => { setPriceRange([0, 10000]); setMinRating(0); setMaxDuration(9999); }}
            style={{ flex: 1, padding: '12px', backgroundColor: 'white', color: '#374151', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}
          >
            Reset Filters
          </button>
          <button
            onClick={() => setFilterOpen(false)}
            style={{ flex: 1, padding: '12px', backgroundColor: '#5B62B3', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}
          >
            Done ✓
          </button>
        </div>
      </div>

      <style>{`
        @keyframes browseShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 960px) {
          .browse-filters {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default BrowsePage;
