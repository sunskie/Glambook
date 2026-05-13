import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { paymentService } from '../../services/api/paymentService';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const data = searchParams.get('data');
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!data || !type || !id) {
      setStatus('failed');
      setMessage('Invalid payment response received.');
      return;
    }

    verifyPayment(data, type, id);
  }, []);

  const verifyPayment = async (data: string, type: string, id: string) => {
    try {
      const res = await paymentService.verifyPayment(data, type, id);
      if (res.data?.success) {
        setStatus('success');
        setMessage('Your payment was successful and your booking has been confirmed.');
      } else {
        setStatus('failed');
        setMessage(res.data?.message || 'Payment verification failed.');
      }
    } catch (err: any) {
      setStatus('failed');
      setMessage('Could not verify payment. Please contact support.');
    }
  };

  const type = searchParams.get('type');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, sans-serif', padding: '24px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '48px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.1)' }}>

        {status === 'loading' && (
          <>
            <Loader size={64} color="#5B62B3" style={{ marginBottom: '24px', animation: 'spin 1s linear infinite' }} />
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111', marginBottom: '12px' }}>Verifying Payment...</h2>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>Please wait while we confirm your payment with eSewa.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <CheckCircle size={48} color="#16a34a" />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111', marginBottom: '12px' }}>Payment Successful! 🎉</h2>
            <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '32px' }}>{message}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => navigate(type === 'enrollment' ? '/client/my-courses' : '/client/bookings')}
                style={{ padding: '14px', backgroundColor: '#5B62B3', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}
              >
                {type === 'enrollment' ? 'Go to My Courses' : 'Go to My Bookings'}
              </button>
              <button
                onClick={() => navigate('/client/dashboard')}
                style={{ padding: '14px', backgroundColor: 'white', color: '#5B62B3', border: '2px solid #5B62B3', borderRadius: '12px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}
              >
                Back to Dashboard
              </button>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <XCircle size={48} color="#dc2626" />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111', marginBottom: '12px' }}>Payment Failed</h2>
            <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '32px' }}>{message}</p>
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
          </>
        )}

      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default PaymentSuccess;
