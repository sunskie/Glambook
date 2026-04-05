// Frontend/src/pages/Admin/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users, Search, Filter, Eye, Ban, Trash2,
  CheckCircle, XCircle, Calendar, Mail, Phone
} from 'lucide-react';
import adminService from '../../services/api/adminService';
import showToast from '../../components/common/Toast';
import ConfirmModal from '../../components/common/ConfirmModal';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: 'delete' | 'toggle';
    userId: string;
    userName: string;
    currentStatus?: boolean;
  }>({ open: false, type: 'delete', userId: '', userName: '' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // adminService uses api.ts which auto-unwraps → response = { users, pagination }
      const response: any = await adminService.getAllUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit: 10,
      });
      // ✅ FIXED: response.users (not response.data.users)
      setUsers(response.users || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotal(response.pagination?.total || 0);
    } catch (error: any) {
      showToast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!confirmModal.userId) return;
    try {
      setActionLoading(true);
      await adminService.updateUserStatus(confirmModal.userId, !confirmModal.currentStatus);
      showToast.success(`User ${confirmModal.currentStatus ? 'deactivated' : 'activated'} successfully`);
      setConfirmModal({ open: false, type: 'delete', userId: '', userName: '' });
      fetchUsers();
    } catch {
      showToast.error('Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmModal.userId) return;
    try {
      setActionLoading(true);
      await adminService.deleteUser(confirmModal.userId);
      showToast.success('User deleted successfully');
      setConfirmModal({ open: false, type: 'delete', userId: '', userName: '' });
      fetchUsers();
    } catch {
      showToast.error('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const openToggleModal = (user: User) => {
    setConfirmModal({
      open: true,
      type: 'toggle',
      userId: user._id,
      userName: user.name,
      currentStatus: user.isActive,
    });
  };

  const openDeleteModal = (user: User) => {
    setConfirmModal({
      open: true,
      type: 'delete',
      userId: user._id,
      userName: user.name,
    });
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      admin: { bg: '#FEE2E2', text: '#991B1B' },
      vendor: { bg: '#E0E7FF', text: '#3730A3' },
      client: { bg: '#DCFCE7', text: '#166534' },
    };
    const c = colors[role] || { bg: '#F3F4F6', text: '#374151' };
    return (
      <span style={{
        padding: '3px 10px', borderRadius: '999px', fontSize: '12px',
        fontWeight: 600, backgroundColor: c.bg, color: c.text,
      }}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Montserrat, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111', margin: 0 }}>User Management</h1>
        <p style={{ color: '#666', marginTop: '6px' }}>
          {total} total user{total !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          style={{ padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', minWidth: '140px' }}
        >
          <option value="">All Roles</option>
          <option value="client">Client</option>
          <option value="vendor">Vendor</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', minWidth: '140px' }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>Loading users...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Users size={48} style={{ color: '#D1D5DB', marginBottom: '12px' }} />
            <p style={{ color: '#666', fontWeight: 600 }}>No users found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Name', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr key={user._id} style={{ borderBottom: i < users.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#4F46E5', fontSize: '14px', flexShrink: 0 }}>
                          {user.name[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: '#111', fontSize: '14px' }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={13} style={{ color: '#9CA3AF' }} />
                        {user.email}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151' }}>
                      {user.phone ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={13} style={{ color: '#9CA3AF' }} />
                          {user.phone}
                        </div>
                      ) : <span style={{ color: '#D1D5DB' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>{getRoleBadge(user.role)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                        backgroundColor: user.isActive ? '#DCFCE7' : '#FEE2E2',
                        color: user.isActive ? '#166534' : '#991B1B',
                      }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6B7280' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Calendar size={13} />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => openToggleModal(user)}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                          style={{ padding: '6px', borderRadius: '6px', border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', color: user.isActive ? '#F59E0B' : '#10B981' }}
                        >
                          {user.isActive ? <Ban size={15} /> : <CheckCircle size={15} />}
                        </button>
                        <button
                          onClick={() => openDeleteModal(user)}
                          title="Delete"
                          style={{ padding: '6px', borderRadius: '6px', border: '1px solid #FEE2E2', background: '#FFF5F5', cursor: 'pointer', color: '#DC2626' }}
                        >
                          <Trash2 size={15} />
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: page === 1 ? '#F9FAFB' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
            Previous
          </button>
          <span style={{ padding: '8px 16px', fontSize: '14px', color: '#374151' }}>
            Page {page} of {totalPages}
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: page === totalPages ? '#F9FAFB' : 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
            Next
          </button>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, type: 'delete', userId: '', userName: '' })}
        onConfirm={confirmModal.type === 'delete' ? handleDelete : handleToggleStatus}
        loading={actionLoading}
        title={confirmModal.type === 'delete' ? 'Delete User' : confirmModal.currentStatus ? 'Deactivate User' : 'Activate User'}
        message={
          confirmModal.type === 'delete'
            ? `Permanently delete "${confirmModal.userName}"? This cannot be undone.`
            : `${confirmModal.currentStatus ? 'Deactivate' : 'Activate'} user "${confirmModal.userName}"?`
        }
        confirmText={confirmModal.type === 'delete' ? 'Delete' : confirmModal.currentStatus ? 'Deactivate' : 'Activate'}
      />
    </div>
  );
};

export default UserManagement;