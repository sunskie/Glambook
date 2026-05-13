import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const font = { fontFamily: 'Montserrat, sans-serif' };

  const handleReset = async () => {
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password: form.password });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid or expired link. Please request a new reset link.');
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
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#5B62B3', fontFamily: 'Syne, sans-serif' }}>GlamBook</h1>
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: 800, color: '#111', fontFamily: 'Syne, sans-serif' }}>
              Password Reset!
            </h2>
            <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '24px' }}>
              Your password has been changed successfully. You can now log in with your new password.
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{ width: '100%', padding: '13px', backgroundColor: '#5B62B3', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', ...font }}
            >
              Go to Login
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 800, color: '#111', fontFamily: 'Syne, sans-serif' }}>
              Set New Password
            </h2>
            <p style={{ margin: '0 0 28px', fontSize: '13px', color: '#6B7280' }}>
              Choose a strong password for your GlamBook account.
            </p>

            {/* New password */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '6px' }}>
                New Password
              </label>
              <div style={{ position: 'relative' as const }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setError(''); }}
                  placeholder="Min 6 characters"
                  style={{ width: '100%', padding: '12px 44px 12px 16px', borderRadius: '12px', border: '1.5px solid #E5E7EB', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'Montserrat, sans-serif' }}
                />
                <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#6B7280' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {/* Password strength bar */}
              {form.password && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ height: '4px', borderRadius: '99px', backgroundColor: '#E5E7EB', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '99px', transition: 'width 0.3s',
                      width: form.password.length < 6 ? '33%' : form.password.length < 10 ? '66%' : '100%',
                      backgroundColor: form.password.length < 6 ? '#DC2626' : form.password.length < 10 ? '#F59E0B' : '#16a34a',
                    }} />
                  </div>
                  <p style={{ fontSize: '10px', margin: '3px 0 0', color: form.password.length < 6 ? '#DC2626' : form.password.length < 10 ? '#F59E0B' : '#16a34a' }}>
                    {form.password.length < 6 ? 'Too short' : form.password.length < 10 ? 'Good' : 'Strong'}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '6px' }}>
                Confirm Password
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                value={form.confirm}
                onChange={e => { setForm(p => ({ ...p, confirm: e.target.value })); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleReset()}
                placeholder="Re-enter your password"
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '12px',
                  border: `1.5px solid ${form.confirm && form.confirm !== form.password ? '#DC2626' : '#E5E7EB'}`,
                  fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const,
                  fontFamily: 'Montserrat, sans-serif',
                }}
              />
              {form.confirm && form.confirm !== form.password && (
                <p style={{ fontSize: '12px', color: '#DC2626', margin: '4px 0 0' }}>Passwords do not match</p>
              )}
            </div>

            {error && (
              <div style={{ backgroundColor: '#FEE2E2', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', border: '1px solid #FCA5A5' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#DC2626', fontWeight: 600 }}>{error}</p>
              </div>
            )}

            <button
              onClick={handleReset}
              disabled={loading}
              style={{ width: '100%', padding: '13px', backgroundColor: loading ? '#9CA3AF' : '#5B62B3', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', ...font }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
