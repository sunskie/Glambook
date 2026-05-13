import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminMessages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FC' }}>
      <div style={{
        maxWidth: '900px', margin: '40px auto', padding: '0 24px',
        fontFamily: 'Montserrat, sans-serif',
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111', fontFamily: 'Syne, sans-serif', marginBottom: '8px' }}>
          Messages
        </h1>
        <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '32px' }}>
          Admin communication center
        </p>

        <div style={{
          backgroundColor: 'white', borderRadius: '16px',
          border: '1px solid #E5E7EB', padding: '60px',
          textAlign: 'center' as const,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          <p style={{ fontSize: '40px', marginBottom: '16px' }}>💬</p>
          <p style={{ fontWeight: 700, fontSize: '16px', color: '#111', marginBottom: '8px' }}>
            Admin Messaging
          </p>
          <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '24px' }}>
            Use the StreamChat panel below to communicate with clients and vendors.
          </p>
          {/* StreamChat component — same one used elsewhere, just rendered here */}
          <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
            Open the Messages panel using the floating button, or navigate to specific user conversations from the Users or Vendors pages.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
