// Frontend/src/pages/Admin/VendorManagement.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Briefcase, Search, CheckCircle, XCircle, Eye,
  Ban, AlertCircle, BookOpen, Scissors, Mail, Phone
} from 'lucide-react';
import adminService from '../../services/api/adminService';
import showToast from '../../components/common/Toast';
import ConfirmModal from '../../components/common/ConfirmModal';

interface Vendor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
  servicesCount?: number;
  coursesCount?: number;
}

const VendorManagement: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [approvedFilter, setApprovedFilter] = useState(searchParams.get('approved') || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean; type: 'approve' | 'reject'; vendorId: string; vendorName: string;
  }>({ open: false, type: 'approve', vendorId: '', vendorName: '' });

  useEffect(() => { fetchVendors(); }, [search, approvedFilter, page]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      // ✅ FIXED: response.vendors (not response.data.vendors)
      const response: any = await adminService.getAllVendors({
        search: search || undefined,
        approved: approvedFilter || undefined,
        page,
        limit: 10,
      });
      setVendors(response.vendors || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotal(response.pagination?.total || 0);
    } catch {
      showToast.error('Failed to load vendors');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await adminService.approveVendor(confirmModal.vendorId);
      showToast.success(`${confirmModal.vendorName} approved successfully`);
      setConfirmModal({ open: false, type: 'approve', vendorId: '', vendorName: '' });
      fetchVendors();
    } catch {
      showToast.error('Failed to approve vendor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setActionLoading(true);
      await adminService.rejectVendor(confirmModal.vendorId);
      showToast.success(`${confirmModal.vendorName} rejected`);
      setConfirmModal({ open: false, type: 'approve', vendorId: '', vendorName: '' });
      fetchVendors();
    } catch {
      showToast.error('Failed to reject vendor');
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCount = vendors.filter(v => !v.isApproved).length;

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Montserrat, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111', margin: 0 }}>Vendor Management</h1>
          <p style={{ color: '#666', marginTop: '6px' }}>{total} total vendor{total !== 1 ? 's' : ''}</p>
        </div>
        {pendingCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFF7ED', border: '1px solid #FED7AA', padding: '10px 16px', borderRadius: '8px' }}>
            <AlertCircle size={16} style={{ color: '#F59E0B' }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#92400E' }}>
              {pendingCount} pending approval
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search vendors..."
            style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <select
          value={approvedFilter}
          onChange={e => { setApprovedFilter(e.target.value); setPage(1); }}
          style={{ padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', minWidth: '160px' }}
        >
          <option value="">All Vendors</option>
          <option value="false">Pending Approval</option>
          <option value="true">Approved</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>Loading vendors...</div>
        ) : vendors.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Briefcase size={48} style={{ color: '#D1D5DB', marginBottom: '12px' }} />
            <p style={{ color: '#666', fontWeight: 600 }}>No vendors found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Vendor', 'Contact', 'Services', 'Courses', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor, i) => (
                  <tr key={vendor._id} style={{ borderBottom: i < vendors.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#5B62B3,#8C92E6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '14px', flexShrink: 0 }}>
                          {vendor.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#111', fontSize: '14px' }}>{vendor.name}</div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                            Joined {new Date(vendor.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '13px', color: '#374151', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Mail size={12} style={{ color: '#9CA3AF' }} />{vendor.email}</div>
                        {vendor.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Phone size={12} style={{ color: '#9CA3AF' }} />{vendor.phone}</div>}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Scissors size={14} style={{ color: '#9CA3AF' }} />
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>{vendor.servicesCount ?? 0}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BookOpen size={14} style={{ color: '#9CA3AF' }} />
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>{vendor.coursesCount ?? 0}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                        backgroundColor: vendor.isApproved ? '#DCFCE7' : '#FFF7ED',
                        color: vendor.isApproved ? '#166534' : '#92400E',
                      }}>
                        {vendor.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {!vendor.isApproved ? (
                          <>
                            <button
                              onClick={() => setConfirmModal({ open: true, type: 'approve', vendorId: vendor._id, vendorName: vendor.name })}
                              style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#DCFCE7', color: '#166534', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <CheckCircle size={13} /> Approve
                            </button>
                            <button
                              onClick={() => setConfirmModal({ open: true, type: 'reject', vendorId: vendor._id, vendorName: vendor.name })}
                              style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#FEE2E2', color: '#991B1B', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <XCircle size={13} /> Reject
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setConfirmModal({ open: true, type: 'reject', vendorId: vendor._id, vendorName: vendor.name })}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#FEE2E2', color: '#991B1B', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Ban size={13} /> Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: page === 1 ? '#F9FAFB' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
            Previous
          </button>
          <span style={{ padding: '8px 16px', fontSize: '14px', color: '#374151' }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: page === totalPages ? '#F9FAFB' : 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
            Next
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, type: 'approve', vendorId: '', vendorName: '' })}
        onConfirm={confirmModal.type === 'approve' ? handleApprove : handleReject}
        loading={actionLoading}
        title={confirmModal.type === 'approve' ? 'Approve Vendor' : 'Reject / Revoke Vendor'}
        message={confirmModal.type === 'approve'
          ? `Approve "${confirmModal.vendorName}"? They will be able to create services and courses.`
          : `Reject/revoke access for "${confirmModal.vendorName}"?`
        }
        confirmText={confirmModal.type === 'approve' ? 'Approve' : 'Reject'}
      />
    </div>
  );
};

export default VendorManagement;