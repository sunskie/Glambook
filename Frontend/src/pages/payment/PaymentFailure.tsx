import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const PaymentFailure: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get('type');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, sans-serif', padding: '24px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '48px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.1)' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <XCircle size={48} color="#dc2626" />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111', marginBottom: '12px' }}>Payment Cancelled</h2>
        <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '8px' }}>Your payment was not completed.</p>
        <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '32px' }}>You have not been charged. Please try again when ready.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ padding: '14px', backgroundColor: '#5B62B3', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/client/dashboard')}
            style={{ padding: '14px', backgroundColor: 'white', color: '#6B7280', border: '2px solid #E5E7EB', borderRadius: '12px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
