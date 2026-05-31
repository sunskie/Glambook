import { useNavigate } from 'react-router-dom';

const PaymentFailure = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '500px', margin: '60px auto', padding: '32px',
                  background: 'rgba(255,255,255,0.05)', borderRadius: '16px',
                  textAlign: 'center', color: 'white' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>❌</div>
      <h2 style={{ color: '#ef4444', marginBottom: '8px' }}>Payment Failed</h2>
      <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
        Your payment was not completed. Your booking has not been confirmed.
        No amount has been charged.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: '#6366f1', color: 'white', border: 'none',
                   borderRadius: '8px', padding: '12px 24px', cursor: 'pointer' }}
        >
          Try Again
        </button>
        <button
          onClick={() => navigate('/client/bookings')}
          style={{ background: 'transparent', color: '#9ca3af',
                   border: '1px solid #374151',
                   borderRadius: '8px', padding: '12px 24px', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PaymentFailure;
