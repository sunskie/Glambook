import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from '../pages/admin/adminHeader';
 
const AdminLayout: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
      <AdminHeader />
      <main>
        <Outlet />
      </main>
    </div>
  );
};
 
export default AdminLayout;