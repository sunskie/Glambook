import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VendorDashboard from './pages/Vendor/VendorDashboard';
import CreateService from './pages/Vendor/CreateService';
import EditService from './pages/Vendor/EditService';

function App() {
  return (
    <AuthProvider>
      <ToastProvider />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/client/dashboard" element={
            <div className="p-8">
              <h1 className="text-2xl">Client Dashboard (Coming Soon)</h1>
            </div>
          } />
          
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/create-service" element={<CreateService />} />
          <Route path="/vendor/edit-service/:id" element={<EditService />} />
          
          <Route path="/admin/dashboard" element={
            <div className="p-8">
              <h1 className="text-2xl">Admin Dashboard (Coming Soon)</h1>
            </div>
          } />
          
          <Route path="*" element={
            <div className="p-8">
              <h1 className="text-2xl">404 - Page Not Found</h1>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;