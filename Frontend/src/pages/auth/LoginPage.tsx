import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import InputField from '../../components/auth/InputField';
import AuthButton from '../../components/auth/AuthButton';
import authService from '../../services/api/authService';
import { useAuth } from '../../context/AuthContext';

const loginBg = '/images/login-bg.jpeg';

/**
 * LoginPage Component
 * 
 * LAYOUT:
 * - Desktop: 50% image (left) | 50% form (right)
 * - Mobile: Form only (image hidden)
 * 
 * FEATURES:
 * - Email/Password login
 * - Remember me checkbox
 * - Role-based navigation after login
 * - Error handling with user-friendly messages
 */

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ========================================
  // EVENT HANDLERS
  // ========================================
  
  /**
   * Handle input field changes
   * Supports both text inputs and checkboxes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  /**
   * Handle form submission
   * Makes API call and navigates based on user role
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call your authentication service
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      console.log('Login successful:', response);

      // Navigate based on user role
      if (response.user?.role === 'client') {
        navigate('/client/dashboard');
      } else if (response.user?.role === 'vendor') {
        navigate('/vendor/dashboard');
      } else if (response.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // UI RENDER
  // ========================================
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      
      {/* ============================================
          LEFT SIDE: IMAGE WITH TEXT OVERLAY
          ============================================
          This section is hidden on mobile (hidden)
          Visible on large screens (lg:flex)
          Takes 50% width on desktop (lg:w-1/2)
      */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${loginBg})` }}
        />
        
        {/* Dark Overlay - Makes text readable */}
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        
        {/* Text Content - Positioned OVER the image */}
        <div className="relative z-10 flex flex-col justify-center items-start px-16 text-white">
          <h1 className="text-6xl font-bold mb-4 leading-tight">
            Browse, Book, Grow
          </h1>
          <p className="text-2xl text-blue-200 font-light">
            Your All-in-One Beauty<br />
            Booking & Learning Platform
          </p>
        </div>
      </div>

      {/* ============================================
          RIGHT SIDE: LOGIN FORM
          ============================================
          Full width on mobile (w-full)
          50% width on desktop (lg:w-1/2)
          White background with centered content
      */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-md">
          
          {/* ======================================
              FORM HEADER
              ====================================== */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Login</h2>
            <p className="text-gray-600 text-base leading-relaxed">
              Welcome back! Please login to your account.
            </p>
          </div>

          {/* ======================================
              ERROR MESSAGE DISPLAY
              ======================================
              Only shows when there's an error
          */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* ======================================
              LOGIN FORM
              ======================================
              Uses your existing InputField and AuthButton components
          */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Input Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <InputField
                type="email"
                name="email"
                placeholder="Enter your email"
                icon={<Mail size={20} />}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password Input Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <InputField
                type="password"
                name="password"
                placeholder="Enter your password"
                icon={<Lock size={20} />}
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Remember Me Checkbox & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              
              <Link 
                to="/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <div className="pt-2">
              <AuthButton 
                type="submit" 
                loading={loading} 
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </AuthButton>
            </div>
          </form>

          {/* ======================================
              REGISTER LINK
              ======================================
              Directs users without an account to register
          */}
          <p className="text-center text-gray-600 text-sm mt-8">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;