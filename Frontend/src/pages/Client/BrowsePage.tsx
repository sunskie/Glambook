import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Search, Sparkles } from 'lucide-react';
import serviceService from '../../services/api/serviceService';
import { Service } from '../../types';
import showToast from '../../components/common/Toast';

const BrowsePage: React.FC = () => {
  const navigate = useNavigate();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalServices, setTotalServices] = useState(0);

  const categories = ['all', 'Hair', 'Makeup', 'Spa', 'Nails', 'Skincare', 'Massage', 'Other'];

  useEffect(() => {
    fetchServices(currentPage);
  }, [currentPage, filterCategory, appliedSearch]);

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

    return vendorId.name;
  };

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

        <section
          style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.06)',
            marginBottom: '24px',
          }}
        >
          <div
            className="browse-filters"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 2fr) minmax(220px, 1fr) auto',
              gap: '16px',
              alignItems: 'center',
            }}
          >
            <div style={{ position: 'relative' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '14px',
                  transform: 'translateY(-50%)',
                  color: '#94A3B8',
                }}
              />
              <input
                type="text"
                placeholder="Search by service name or description"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '14px',
                  border: '1px solid #D8DCEF',
                  padding: '0 16px 0 42px',
                  outline: 'none',
                  fontSize: '14px',
                  fontFamily: 'Montserrat, sans-serif',
                }}
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                height: '48px',
                borderRadius: '14px',
                border: '1px solid #D8DCEF',
                padding: '0 14px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif',
                outline: 'none',
              }}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>

            <button
              onClick={handleSearch}
              style={{
                height: '48px',
                padding: '0 22px',
                borderRadius: '14px',
                border: 'none',
                backgroundColor: '#5B62B3',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              Search
            </button>
          </div>
        </section>

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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {services.map((service) => (
              <div
                key={service._id}
                onClick={() => navigate(`/client/book/${service._id}`)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.06)',
                  border: '1px solid #EDF1F7',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 18px 40px rgba(15, 23, 42, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(15, 23, 42, 0.06)';
                }}
              >
                <div style={{ position: 'relative', height: '220px' }}>
                  <img
                    src={getImageUrl(service.imageUrl)}
                    alt={service.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80';
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '14px',
                      left: '14px',
                      padding: '6px 12px',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(255,255,255,0.92)',
                      color: '#5B62B3',
                      fontSize: '12px',
                      fontWeight: 700,
                      fontFamily: 'Montserrat, sans-serif',
                    }}
                  >
                    {service.category}
                  </div>
                </div>

                <div style={{ padding: '22px' }}>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#64748B',
                      marginBottom: '10px',
                      fontFamily: 'Montserrat, sans-serif',
                    }}
                  >
                    by {getVendorName(service.vendorId)}
                  </div>

                  <h3
                    style={{
                      margin: '0 0 10px 0',
                      color: '#111111',
                      fontSize: '20px',
                      fontWeight: 700,
                      lineHeight: 1.25,
                      fontFamily: 'Syne, sans-serif',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {service.title}
                  </h3>

                  <p
                    style={{
                      margin: '0 0 18px 0',
                      color: '#64748B',
                      fontSize: '14px',
                      lineHeight: 1.6,
                      minHeight: '66px',
                      fontFamily: 'Montserrat, sans-serif',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {service.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      paddingTop: '16px',
                      borderTop: '1px solid #EEF2F7',
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: '0 0 4px 0',
                          fontSize: '12px',
                          color: '#94A3B8',
                          fontFamily: 'Montserrat, sans-serif',
                        }}
                      >
                        Starting from
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '24px',
                          fontWeight: 700,
                          color: '#111111',
                          fontFamily: 'Montserrat, sans-serif',
                        }}
                      >
                        Rs. {service.price.toLocaleString()}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: '6px',
                          marginBottom: '10px',
                          color: '#64748B',
                          fontSize: '13px',
                          fontFamily: 'Montserrat, sans-serif',
                        }}
                      >
                        <Clock size={14} />
                        {service.duration} mins
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/client/book/${service._id}`);
                        }}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '12px',
                          border: 'none',
                          backgroundColor: '#5B62B3',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 700,
                          fontFamily: 'Montserrat, sans-serif',
                        }}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
