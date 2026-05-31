import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const data = searchParams.get('data');
        const bookingId = searchParams.get('bookingId')
          || localStorage.getItem('pendingBookingId');
        const enrollmentId = searchParams.get('enrollmentId')
          || localStorage.getItem('pendingEnrollmentId');

        if (enrollmentId) {
          const res = await api.post('/payment/verify-course', {
            enrollmentId, data
          });
          setDetails(res.data);
          localStorage.removeItem('pendingEnrollmentId');
        } else if (bookingId) {
          const res = await api.post('/payment/verify', {
            bookingId, data
          });
          setDetails(res.data);
          localStorage.removeItem('pendingBookingId');
        }
      } catch (err) {
        setError('Payment verification failed. Please contact support.');
      } finally {
        setVerifying(false);
      }
    };
    verify();
  }, []);

  if (verifying) return (
    <div style={{ textAlign: 'center', padding: '60px', color: 'white' }}>
      <div>Verifying your payment...</div>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#ef4444' }}>
      <h2>⚠️ {error}</h2>
      <button onClick={() => navigate('/client/bookings')}>Go to My Bookings</button>
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: '60px auto', padding: '32px',
                  background: 'rgba(255,255,255,0.05)', borderRadius: '16px',
                  textAlign: 'center', color: 'white' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
      <h2 style={{ color: '#10b981', marginBottom: '8px' }}>Payment Confirmed!</h2>

      {details && (
        <div style={{ background: 'rgba(255,255,255,0.05)',
                      borderRadius: '12px', padding: '20px', margin: '20px 0',
                      textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
                        marginBottom: '12px' }}>
            <span style={{ color: '#9ca3af' }}>Advance Paid</span>
            <span style={{ color: '#10b981', fontWeight: 'bold' }}>
              Rs. {details.advanceAmount?.toLocaleString()}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between',
                        marginBottom: '12px' }}>
            <span style={{ color: '#9ca3af' }}>Remaining (Pay at Salon)</span>
            <span>Rs. {details.remainingAmount?.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#9ca3af' }}>Total Amount</span>
            <span>Rs. {details.totalAmount?.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '8px', padding: '12px', margin: '16px 0',
                    fontSize: '13px', color: '#fca5a5' }}>
        ⚠️ The advance payment is <strong>non-refundable</strong> once confirmed.
        The remaining amount will be collected at the salon.
      </div>

      <button
        onClick={() => navigate('/client/bookings')}
        style={{ background: '#10b981', color: 'white', border: 'none',
                 borderRadius: '8px', padding: '12px 32px', cursor: 'pointer',
                 fontSize: '16px', marginTop: '8px' }}
      >
        View My Bookings
      </button>
    </div>
  );
};

export default PaymentSuccess;
