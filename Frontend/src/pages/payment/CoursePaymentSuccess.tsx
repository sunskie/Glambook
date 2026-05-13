import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';

const CoursePaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const font = { fontFamily: 'Montserrat, sans-serif' };

  useEffect(() => {
    const completeEnrollment = async () => {
      try {
        const pending = sessionStorage.getItem('pendingCourseEnrollment');
        if (!pending) {
          setStatus('error');
          return;
        }

        const { courseId, selectedBatchId } = JSON.parse(pending);
        const transactionId = searchParams.get('transaction_uuid') || `ESEWA-${Date.now()}`;

        await api.post('/enrollments', {
          courseId,
          selectedBatchId,
          paymentMethod: 'esewa',
          transactionId,
        });

        sessionStorage.removeItem('pendingCourseEnrollment');
        setStatus('success');

        setTimeout(() => navigate(`/client/learn/${courseId}`), 3000);
      } catch (err) {
        setStatus('error');
      }
    };

    completeEnrollment();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FC', display: 'flex', alignItems: 'center', justifyContent: 'center', ...font }}>
      <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '48px', textAlign: 'center', maxWidth: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        {status === 'processing' && (
          <>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', color: '#111', marginBottom: '8px' }}>Processing Payment...</h2>
            <p style={{ color: '#6B7280', fontSize: '13px' }}>Please wait while we confirm your enrollment.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', color: '#16a34a', marginBottom: '8px' }}>Enrolled Successfully!</h2>
            <p style={{ color: '#6B7280', fontSize: '13px' }}>Redirecting to your course...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>❌</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', color: '#DC2626', marginBottom: '8px' }}>Enrollment Failed</h2>
            <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '20px' }}>Payment was received but enrollment failed. Please contact support.</p>
            <button onClick={() => navigate('/client/courses')} style={{ padding: '10px 24px', backgroundColor: '#5B62B3', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', ...font }}>
              Back to Courses
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CoursePaymentSuccess;
