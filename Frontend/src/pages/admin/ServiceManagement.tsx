// Frontend/src/pages/Admin/ServiceManagement.tsx
import React, { useState, useEffect } from 'react';
import { Scissors, Search, Trash2, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import adminService from '../../services/api/adminService';
import showToast from '../../components/common/Toast';
import ConfirmModal from '../../components/common/ConfirmModal';

interface Service {
  _id: string;
  title: string;
  category: string;
  price: number;
  duration: number;
  status: 'active' | 'inactive';
  rating: number;
  reviewCount: number;
  vendorId?: { name: string; email: string };
  imageUrl?: string | null;
  createdAt: string;
}

const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean; type: 'delete' | 'toggle'; serviceId: string; serviceTitle: string; currentStatus?: string;
  }>({ open: false, type: 'delete', serviceId: '', serviceTitle: '' });

  const CATEGORIES = ['Hair', 'Makeup', 'Spa', 'Nails', 'Skincare', 'Massage', 'Other'];

  useEffect(() => { fetchServices(); }, [search, statusFilter, categoryFilter, page]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      // ✅ FIXED: response.services (not response.data.services)
      const response: any = await adminService.getAllServicesAdmin({
        search: search || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        page,
        limit: 10,
      });
      setServices(response.services || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotal(response.pagination?.total || 0);
    } catch {
      showToast.error('Failed to load services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    try {
      setActionLoading(true);
      if (confirmModal.type === 'delete') {
        await adminService.deleteServiceAdmin(confirmModal.serviceId);
        showToast.success('Service deleted');
      } else {
        const newStatus = confirmModal.currentStatus === 'active' ? 'inactive' : 'active';
        await adminService.updateServiceStatus(confirmModal.serviceId, newStatus);
        showToast.success(`Service ${newStatus}`);
      }
      setConfirmModal({ open: false, type: 'delete', serviceId: '', serviceTitle: '' });
      fetchServices();
    } catch {
      showToast.error('Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111', margin: 0 }}>Service Management</h1>
        <p style={{ color: '#666', marginTop: '6px' }}>{total} total service{total !== 1 ? 's' : ''}</p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search services..."
            style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
          style={{ padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', minWidth: '140px' }}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', minWidth: '130px' }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>Loading services...</div>
        ) : services.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Scissors size={48} style={{ color: '#D1D5DB', marginBottom: '12px' }} />
            <p style={{ color: '#666', fontWeight: 600 }}>No services found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Service', 'Vendor', 'Category', 'Price', 'Duration', 'Rating', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.map((svc, i) => (
                  <tr key={svc._id} style={{ borderBottom: i < services.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {svc.imageUrl ? (
                          <img src={svc.imageUrl.startsWith('http') ? svc.imageUrl : `http://localhost:5000${svc.imageUrl}`}
                            alt={svc.title} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Scissors size={16} style={{ color: '#5B62B3' }} />
                          </div>
                        )}
                        <span style={{ fontWeight: 600, fontSize: '14px', color: '#111' }}>{svc.title}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151' }}>
                      {typeof svc.vendorId === 'object' ? svc.vendorId?.name : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: '#F3F4F6', fontSize: '12px', color: '#374151' }}>
                        {svc.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, color: '#111' }}>
                      Rs. {svc.price?.toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#374151' }}>
                        <Clock size={13} style={{ color: '#9CA3AF' }} />{svc.duration} min
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151' }}>
                      ⭐ {svc.rating?.toFixed(1) || '0.0'} ({svc.reviewCount || 0})
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                        backgroundColor: svc.status === 'active' ? '#DCFCE7' : '#FEE2E2',
                        color: svc.status === 'active' ? '#166534' : '#991B1B' }}>
                        {svc.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => setConfirmModal({ open: true, type: 'toggle', serviceId: svc._id, serviceTitle: svc.title, currentStatus: svc.status })}
                          title={svc.status === 'active' ? 'Deactivate' : 'Activate'}
                          style={{ padding: '6px', borderRadius: '6px', border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', color: svc.status === 'active' ? '#F59E0B' : '#10B981' }}>
                          {svc.status === 'active' ? <XCircle size={14} /> : <CheckCircle size={14} />}
                        </button>
                        <button
                          onClick={() => setConfirmModal({ open: true, type: 'delete', serviceId: svc._id, serviceTitle: svc.title })}
                          style={{ padding: '6px', borderRadius: '6px', border: '1px solid #FEE2E2', background: '#FFF5F5', cursor: 'pointer', color: '#DC2626' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: page === 1 ? '#F9FAFB' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Previous</button>
          <span style={{ padding: '8px 16px', fontSize: '14px', color: '#374151' }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: page === totalPages ? '#F9FAFB' : 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Next</button>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, type: 'delete', serviceId: '', serviceTitle: '' })}
        onConfirm={handleAction}
        loading={actionLoading}
        title={confirmModal.type === 'delete' ? 'Delete Service' : confirmModal.currentStatus === 'active' ? 'Deactivate Service' : 'Activate Service'}
        message={confirmModal.type === 'delete'
          ? `Permanently delete "${confirmModal.serviceTitle}"?`
          : `${confirmModal.currentStatus === 'active' ? 'Deactivate' : 'Activate'} "${confirmModal.serviceTitle}"?`}
        confirmText={confirmModal.type === 'delete' ? 'Delete' : confirmModal.currentStatus === 'active' ? 'Deactivate' : 'Activate'}
      />
    </div>
  );
};

export default ServiceManagement;