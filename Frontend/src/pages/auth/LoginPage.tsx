// Frontend/src/pages/auth/LoginPage.tsx
import React, { useState } from 'react';
import { Mail, Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
    } catch (error: any) {
      setError(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw', 
      display: 'flex',
      overflow: 'hidden'
    }}>
      
      {/* ================= LEFT IMAGE SECTION (50%) ================= */}
      <div style={{ 
        width: '50%',
        height: '100vh',
        position: 'relative', 
        backgroundImage: 'url(https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Dark Overlay */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(28, 28, 28, 0.6)' 
        }}></div>
        
        {/* Text Content - Centered */}
        <div style={{ 
          position: 'relative', 
          zIndex: 10,
          padding: '0 80px',
          maxWidth: '600px'
        }}>
          <h1 style={{ 
            color: 'white', 
            fontSize: '48px', 
            fontWeight: 600, 
            lineHeight: '60px', 
            letterSpacing: '-0.02em',
            marginBottom: '14px',
            fontFamily: 'Syne, sans-serif'
          }}>
            Browse, Book, Grow
          </h1>
          <p style={{ 
            color: '#89A8E0', 
            fontSize: '30px', 
            fontWeight: 600,
            lineHeight: '1.3',
            fontFamily: 'Inter, sans-serif'
          }}>
            Your All-in-One Beauty Booking & Learning Platform
          </p>
        </div>
      </div>

      {/* ================= RIGHT FORM SECTION (50%) ================= */}
      <div style={{ 
        width: '50%',
        height: '100vh',
        backgroundColor: '#FAFAFA', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        overflowY: 'auto'
      }}>
        <div style={{ 
          width: '100%', 
          maxWidth: '500px',
          padding: '0 60px'
        }}>
          
          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              color: '#111111', 
              fontSize: '40px', 
              fontWeight: 600, 
              lineHeight: '54px', 
              letterSpacing: '-0.02em',
              marginBottom: '10px',
              fontFamily: 'Syne, sans-serif'
            }}>
              Login
            </h2>
            <p style={{ 
              color: '#89A8E0', 
              fontSize: '16px', 
              fontWeight: 400,
              lineHeight: '24px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Welcome back, we are glad you're feeling beautiful today. Login to continue
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ 
              width: '100%', 
              padding: '12px 16px', 
              backgroundColor: '#FEF2F2', 
              border: '1px solid #FECACA', 
              borderRadius: '4px', 
              color: '#DC2626', 
              fontSize: '14px', 
              marginBottom: '20px' 
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            
            {/* Email Input */}
            <div style={{ 
              width: '100%', 
              height: '56px', 
              border: '1px solid #111111', 
              display: 'flex', 
              alignItems: 'center', 
              padding: '0 28px', 
              gap: '10px', 
              marginBottom: '20px',
              backgroundColor: 'transparent'
            }}>
              <Mail size={24} style={{ color: '#111111', flexShrink: 0 }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                style={{ 
                  flex: 1,
                  backgroundColor: 'transparent',
                  color: '#111111',
                  fontSize: '18px',
                  fontWeight: 500,
                  lineHeight: '24px',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'Montserrat, sans-serif'
                }}
              />
            </div>

            {/* Password Input */}
            <div style={{ 
              width: '100%', 
              height: '56px', 
              border: '1px solid #111111', 
              display: 'flex', 
              alignItems: 'center', 
              padding: '0 28px', 
              gap: '10px', 
              marginBottom: '20px',
              backgroundColor: 'transparent'
            }}>
              <Lock size={24} style={{ color: '#111111', flexShrink: 0 }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                style={{ 
                  flex: 1,
                  backgroundColor: 'transparent',
                  color: '#111111',
                  fontSize: '18px',
                  fontWeight: 500,
                  lineHeight: '24px',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'Montserrat, sans-serif'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  color: '#111111', 
                  flexShrink: 0,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <Eye size={24} /> : <EyeOff size={24} />}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: '40px' 
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                cursor: 'pointer' 
              }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    style={{ 
                      width: '20px',
                      height: '20px',
                      borderRadius: '2px',
                      border: '1.5px solid #111111',
                      cursor: 'pointer',
                      appearance: 'none',
                      backgroundColor: formData.rememberMe ? '#111111' : 'transparent'
                    }}
                  />
                  {formData.rememberMe && (
                    <svg 
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '12px',
                        height: '12px',
                        color: 'white',
                        pointerEvents: 'none'
                      }}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span style={{ 
                  color: '#111111', 
                  opacity: 0.7, 
                  fontSize: '16px', 
                  fontWeight: 400,
                  lineHeight: '24px',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Remember me
                </span>
              </label>
              <a 
                href="#" 
                style={{ 
                  color: '#89A8E0', 
                  fontSize: '12px', 
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontFamily: 'Nunito Sans, sans-serif'
                }}
              >
                Forgot Password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              style={{ 
                width: '100%', 
                height: '56px', 
                backgroundColor: '#111111', 
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                marginBottom: '32px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#000000'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#111111'}
            >
              <span style={{ 
                color: '#89A8E0', 
                fontSize: '18px', 
                fontWeight: 600,
                lineHeight: '28px',
                letterSpacing: '-0.01em',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                {loading ? 'Logging in...' : 'Login'}
              </span>
            </button>

            {/* Register Link */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ 
                color: '#111111', 
                fontSize: '18px', 
                fontWeight: 400,
                lineHeight: '28px',
                letterSpacing: '-0.01em',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Don't have an account?{' '}
              </span>
              <a 
                href="/register" 
                style={{ 
                  color: '#89A8E0', 
                  fontSize: '18px', 
                  fontWeight: 600,
                  lineHeight: '28px',
                  letterSpacing: '-0.01em',
                  textDecoration: 'underline',
                  fontFamily: 'Montserrat, sans-serif'
                }}
              >
                Register
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;