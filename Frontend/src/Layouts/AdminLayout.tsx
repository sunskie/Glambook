import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from '../pages/admin/adminHeader';
 
const AdminLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
      <AdminHeader />
      <main style={{ 
        flex: 1, 
        minWidth: 0,
        marginLeft: '220px',
        overflow: 'auto' 
      }}>
        <Outlet />
      </main>
    </div>
  );
};
 
export default AdminLayout;