// Frontend/src/pages/auth/RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'client',
    agreeToTerms: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  const validatePassword = (password: string): string => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Must contain uppercase letter';
    if (!/[a-z]/.test(password)) return 'Must contain lowercase letter';
    if (!/[0-9]/.test(password)) return 'Must contain a number';
    return '';
  };

  const validatePhone = (phone: string): string => {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length !== 10) return 'Phone must be 10 digits';
    return '';
  };

  const validateEmail = (email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Invalid email format';
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = (target as HTMLInputElement).checked;
    
    let newValue = value;
    if (name === 'phone') {
      newValue = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : newValue,
    });

    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const errors: {[key: string]: string} = {};

    if (!formData.firstName.trim()) errors.firstName = 'Required';
    if (!formData.lastName.trim()) errors.lastName = 'Required';
    
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    if (formData.phone) {
      const phoneError = validatePhone(formData.phone);
      if (phoneError) errors.phone = phoneError;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to Terms and Conditions');
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const registrationData: any = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      };

      if (formData.phone) {
        registrationData.phone = formData.phone;
      }

      await register(registrationData);
      
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      padding: '2vh 2vw',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      
      {/* Main Container */}
      <div style={{
        width: '100%',
        height: '100%',
        maxWidth: 'min(95vw, 1100px)',
        maxHeight: 'min(95vh, 680px)',
        display: 'flex',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: 'white'
      }}>
      
        {/* ================= LEFT IMAGE SECTION (45%) ================= */}
        <div style={{ 
          width: '45%',
          height: '100%',
          position: 'relative', 
          backgroundImage: 'url(https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(28, 28, 28, 0.6)' 
          }}></div>
          
          <div style={{ 
            position: 'relative', 
            zIndex: 10,
            padding: '0 clamp(30px, 4vw, 50px)',
            maxWidth: '450px'
          }}>
            <h1 style={{ 
              color: 'white', 
              fontSize: 'clamp(28px, 3vw, 36px)', 
              fontWeight: 600, 
              lineHeight: '1.3', 
              letterSpacing: '-0.02em',
              marginBottom: '10px',
              fontFamily: 'Syne, sans-serif'
            }}>
              Get the service?<br />
              or Get enrolled in a course?
            </h1>
            <p style={{ 
              color: '#89A8E0', 
              fontSize: 'clamp(16px, 1.8vw, 20px)', 
              fontWeight: 600,
              lineHeight: '1.3',
              fontFamily: 'Inter, sans-serif'
            }}>
              Join thousands of beauty professionals and clients
            </p>
          </div>
        </div>

        {/* ================= RIGHT FORM SECTION (55%) ================= */}
        <div style={{ 
          width: '55%',
          height: '100%',
          backgroundColor: '#FAFAFA', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          overflowY: 'auto',
          overflowX: 'hidden',
          flexShrink: 0
        }}>
          <div style={{ 
            width: '100%', 
            maxWidth: '420px',
            padding: '20px clamp(25px, 3vw, 35px)'
          }}>
            
            {/* Header */}
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ 
                color: '#111111', 
                fontSize: 'clamp(26px, 2.5vw, 32px)', 
                fontWeight: 600, 
                lineHeight: '1.2', 
                letterSpacing: '-0.02em',
                marginBottom: '4px',
                fontFamily: 'Syne, sans-serif'
              }}>
                Register
              </h2>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{ 
                width: '100%', 
                padding: '8px 12px', 
                backgroundColor: '#FEF2F2', 
                border: '1px solid #FECACA', 
                borderRadius: '4px', 
                color: '#DC2626', 
                fontSize: '11px', 
                marginBottom: '10px' 
              }}>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              
              {/* Name Fields - Side by Side */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    width: '100%', 
                    height: '40px', 
                    border: fieldErrors.firstName ? '1px solid #DC2626' : '1px solid #111111',
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0 10px', 
                    gap: '6px',
                    backgroundColor: 'white'
                  }}>
                    <User size={14} style={{ color: '#111111', flexShrink: 0 }} />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First Name"
                      required
                      style={{ 
                        flex: 1,
                        backgroundColor: 'transparent',
                        color: '#111111',
                        fontSize: '12px',
                        fontWeight: 500,
                        border: 'none',
                        outline: 'none',
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                    />
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ 
                    width: '100%', 
                    height: '40px', 
                    border: fieldErrors.lastName ? '1px solid #DC2626' : '1px solid #111111',
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0 10px', 
                    gap: '6px',
                    backgroundColor: 'white'
                  }}>
                    <User size={14} style={{ color: '#111111', flexShrink: 0 }} />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last Name"
                      required
                      style={{ 
                        flex: 1,
                        backgroundColor: 'transparent',
                        color: '#111111',
                        fontSize: '12px',
                        fontWeight: 500,
                        border: 'none',
                        outline: 'none',
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Phone & Email - Side by Side */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    width: '100%', 
                    height: '40px', 
                    border: fieldErrors.phone ? '1px solid #DC2626' : '1px solid #111111',
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0 10px', 
                    gap: '6px',
                    backgroundColor: 'white'
                  }}>
                    <Phone size={14} style={{ color: '#111111', flexShrink: 0 }} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Mobile Number"
                      style={{ 
                        flex: 1,
                        backgroundColor: 'transparent',
                        color: '#111111',
                        fontSize: '12px',
                        fontWeight: 500,
                        border: 'none',
                        outline: 'none',
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                    />
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ 
                    width: '100%', 
                    height: '40px', 
                    border: fieldErrors.email ? '1px solid #DC2626' : '1px solid #111111',
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0 10px', 
                    gap: '6px',
                    backgroundColor: 'white'
                  }}>
                    <Mail size={14} style={{ color: '#111111', flexShrink: 0 }} />
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
                        fontSize: '12px',
                        fontWeight: 500,
                        border: 'none',
                        outline: 'none',
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ 
                  width: '100%', 
                  height: '40px', 
                  border: fieldErrors.password ? '1px solid #DC2626' : '1px solid #111111',
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '0 10px', 
                  gap: '6px',
                  backgroundColor: 'white'
                }}>
                  <Lock size={14} style={{ color: '#111111', flexShrink: 0 }} />
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
                      fontSize: '12px',
                      fontWeight: 500,
                      border: 'none',
                      outline: 'none',
                      fontFamily: 'Montserrat, sans-serif'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ 
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex'
                    }}
                  >
                    {showPassword ? <Eye size={14} style={{ color: '#111111' }} /> : <EyeOff size={14} style={{ color: '#111111' }} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ 
                  width: '100%', 
                  height: '40px', 
                  border: fieldErrors.confirmPassword ? '1px solid #DC2626' : '1px solid #111111',
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '0 10px', 
                  gap: '6px',
                  backgroundColor: 'white'
                }}>
                  <Lock size={14} style={{ color: '#111111', flexShrink: 0 }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Your Password"
                    required
                    style={{ 
                      flex: 1,
                      backgroundColor: 'transparent',
                      color: '#111111',
                      fontSize: '12px',
                      fontWeight: 500,
                      border: 'none',
                      outline: 'none',
                      fontFamily: 'Montserrat, sans-serif'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ 
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex'
                    }}
                  >
                    {showConfirmPassword ? <Eye size={14} style={{ color: '#111111' }} /> : <EyeOff size={14} style={{ color: '#111111' }} />}
                  </button>
                </div>
              </div>

              {/* Role Selection Dropdown */}
              <div style={{ marginBottom: '12px' }}>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    height: '40px',
                    border: '1px solid #111111',
                    padding: '0 10px',
                    backgroundColor: 'white',
                    color: '#111111',
                    fontSize: '12px',
                    fontWeight: 500,
                    outline: 'none',
                    fontFamily: 'Montserrat, sans-serif',
                    cursor: 'pointer',
                    borderRadius: '0'
                  }}
                >
                  <option value="client">Client (Book Services)</option>
                  <option value="vendor">Vendor (Provide Services)</option>
                </select>
              </div>

              {/* Terms Checkbox */}
              <div style={{ display: 'flex', alignItems: 'start', gap: '6px', marginBottom: '14px' }}>
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  style={{
                    width: '14px',
                    height: '14px',
                    marginTop: '1px',
                    cursor: 'pointer',
                    accentColor: '#3B82F6',
                    flexShrink: 0
                  }}
                />
                <label style={{ 
                  fontSize: '10px', 
                  color: '#3B82F6', 
                  lineHeight: '1.3',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  I agree to all the <a href="/terms" style={{ color: '#3B82F6', textDecoration: 'underline' }}>Terms and Privacy Policies</a>
                </label>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                style={{ 
                  width: '100%', 
                  height: '40px', 
                  backgroundColor: '#111111', 
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  marginBottom: '12px'
                }}
              >
                <span style={{ 
                  color: '#89A8E0', 
                  fontSize: '13px', 
                  fontWeight: 600,
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {loading ? 'Creating account...' : 'Register'}
                </span>
              </button>

              {/* Login Link */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ 
                  color: '#111111', 
                  fontSize: '12px', 
                  fontWeight: 400,
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Already have an account?{' '}
                </span>
                <Link 
                  to="/login" 
                  style={{ 
                    color: '#3B82F6', 
                    fontSize: '12px', 
                    fontWeight: 600,
                    textDecoration: 'underline',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                >
                  Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;