import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const font = { fontFamily: 'Montserrat, sans-serif' };

  const handleSubmit = async () => {
    if (!email) { setError('Please enter your email address'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#F8F9FC',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', ...font,
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '24px', padding: '40px',
        width: '100%', maxWidth: '440px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#5B62B3', fontFamily: 'Syne, sans-serif' }}>
            GlamBook
          </h1>
        </div>

        {sent ? (
          // Success state
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>📧</div>
            <h2 style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: 800, color: '#111', fontFamily: 'Syne, sans-serif' }}>
              Check your inbox
            </h2>
            <p style={{ color: '#6B7280', fontSize: '13px', lineHeight: 1.6, marginBottom: '24px' }}>
              If an account with that email exists, we've sent a password reset link. Check your inbox and spam folder.
            </p>
            <p style={{ color: '#6B7280', fontSize: '12px', marginBottom: '24px' }}>
              Link expires in 30 minutes.
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{ width: '100%', padding: '13px', backgroundColor: '#5B62B3', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', ...font }}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 800, color: '#111', fontFamily: 'Syne, sans-serif' }}>
              Forgot Password?
            </h2>
            <p style={{ margin: '0 0 28px', fontSize: '13px', color: '#6B7280', lineHeight: 1.5 }}>
              Enter your registered email address and we'll send you a link to reset your password.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="you@example.com"
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '12px',
                  border: `1.5px solid ${error ? '#DC2626' : '#E5E7EB'}`,
                  fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const,
                  fontFamily: 'Montserrat, sans-serif',
                }}
              />
              {error && <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#DC2626' }}>{error}</p>}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                backgroundColor: loading ? '#9CA3AF' : '#5B62B3',
                color: 'white', border: 'none', borderRadius: '12px',
                fontWeight: 700, fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '16px', ...font,
              }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <button
              onClick={() => navigate('/login')}
              style={{ width: '100%', padding: '13px', backgroundColor: 'white', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: '12px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', ...font }}
            >
              ← Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
