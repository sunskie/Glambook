import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone } from 'lucide-react';
import InputField from '../../components/auth/InputField';
import AuthButton from '../../components/auth/AuthButton';
import authService from '../../services/api/authService';
import { useAuth } from '../../context/AuthContext';

const registerBg = '/images/register-bg.jpeg';

/**
 * RegisterPage Component with Full Validation
 * 
 * VALIDATIONS:
 * - Password: Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number
 * - Phone: Exactly 10 digits
 * - Email: Valid email format
 * - Password Match: Confirm password must match
 * - Terms: Must agree to terms
 */

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  
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
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  // ========================================
  // VALIDATION FUNCTIONS
  // ========================================
  
  /**
   * Validate password strength
   * Requirements: 8+ chars, 1 uppercase, 1 lowercase, 1 number
   */
  const validatePassword = (password: string): string => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  /**
   * Validate phone number
   * Must be exactly 10 digits
   */
  const validatePhone = (phone: string): string => {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      return 'Phone number must be exactly 10 digits';
    }
    return '';
  };

  /**
   * Validate email format
   */
  const validateEmail = (email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  // ========================================
  // EVENT HANDLERS
  // ========================================
  
  /**
   * Handle input changes with real-time validation
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = (target as HTMLInputElement).checked;
    
    let newValue = value;

    // Phone number validation - only allow digits and limit to 10
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '');
      newValue = digitsOnly.slice(0, 10); // Limit to 10 digits
    }

    // Password length limit (optional - set max to 128 chars for security)
    if ((name === 'password' || name === 'confirmPassword') && value.length > 128) {
      return; // Don't update if exceeds max length
    }

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : newValue,
    });

    // Clear field-specific error when user types
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
    if (error) setError('');
  };

  /**
   * Validate individual field on blur
   */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let errorMessage = '';

    switch (name) {
      case 'email':
        errorMessage = validateEmail(value);
        break;
      case 'phone':
        if (value) { // Only validate if not empty
          errorMessage = validatePhone(value);
        }
        break;
      case 'password':
        errorMessage = validatePassword(value);
        break;
      case 'confirmPassword':
        if (value && value !== formData.password) {
          errorMessage = 'Passwords do not match';
        }
        break;
    }

    if (errorMessage) {
      setFieldErrors({ ...fieldErrors, [name]: errorMessage });
    }
  };

  /**
   * Handle form submission with full validation
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Validate all fields
    const errors: {[key: string]: string} = {};

    // First Name
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    // Last Name
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    // Email
    const emailError = validateEmail(formData.email);
    if (emailError) {
      errors.email = emailError;
    }

    // Phone (optional but must be valid if provided)
    if (formData.phone) {
      const phoneError = validatePhone(formData.phone);
      if (phoneError) {
        errors.phone = phoneError;
      }
    }

    // Password
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      errors.password = passwordError;
    }

    // Confirm Password
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Terms Agreement
    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms and Conditions to continue');
      return;
    }

    // If there are validation errors, display them
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix the errors above before submitting');
      return;
    }

    setLoading(true);

    try {
      // Prepare registration data
      const registrationData: any = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      };

      // Add phone only if provided
      if (formData.phone) {
        registrationData.phone = formData.phone;
      }

      const response = await authService.register(registrationData);
      
      console.log('Registration successful:', response);

      // Navigate to login with success message
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please login with your credentials.' 
        } 
      });
      
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get password strength indicator
   */
  const getPasswordStrength = (password: string): { strength: string; color: string } => {
    if (!password) return { strength: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { strength: 'Weak', color: 'text-red-600' };
    if (score <= 4) return { strength: 'Medium', color: 'text-yellow-600' };
    return { strength: 'Strong', color: 'text-green-600' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // ========================================
  // UI RENDER
  // ========================================
  return (
    <div className="min-h-screen w-full flex flex-row">
      
      {/* ============================================
          LEFT SIDE: IMAGE WITH TEXT OVERLAY (50%)
          ============================================ */}
      <div className="hidden lg:flex lg:flex-col lg:justify-center lg:items-start lg:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${registerBg})` }}
        />
        <div className="absolute inset-0 w-full h-full bg-black/50" />
        
        <div className="relative z-10 px-16 w-full">
          <h1 className="text-white text-5xl font-bold mb-4 leading-tight">
            Get the service?<br />
            or Get enrolled in a course?
          </h1>
          <p className="text-pink-200 text-xl font-light">
            Join thousands of beauty professionals and clients
          </p>
        </div>
      </div>

      {/* ============================================
          RIGHT SIDE: REGISTER FORM (50%)
          ============================================ */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-white px-8 py-12 lg:px-16 overflow-y-auto">
        <div className="w-full max-w-xl">
          
          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Register</h2>
            <p className="text-gray-600 text-base">
              Create your account to get started with GlamBook
            </p>
          </div>

          {/* General Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* NAME FIELDS - 2 COLUMN GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <InputField
                  type="text"
                  name="firstName"
                  placeholder="John"
                  icon={<User size={20} />}
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  error={fieldErrors.firstName}
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <InputField
                  type="text"
                  name="lastName"
                  placeholder="Doe"
                  icon={<User size={20} />}
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  error={fieldErrors.lastName}
                />
              </div>
            </div>

            {/* EMAIL & PHONE - 2 COLUMN GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <InputField
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  icon={<Mail size={20} />}
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  error={fieldErrors.email}
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <InputField
                  type="tel"
                  name="phone"
                  placeholder="9800000000"
                  icon={<Phone size={20} />}
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={fieldErrors.phone}
                />
                <p className="mt-1 text-xs text-gray-500">10 digits only</p>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <InputField
                type="password"
                name="password"
                placeholder="Create a strong password"
                icon={<Lock size={20} />}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                error={fieldErrors.password}
              />
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <p className={`text-sm font-medium ${passwordStrength.color}`}>
                    Strength: {passwordStrength.strength}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Must be 8+ characters with uppercase, lowercase, and number
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <InputField
                type="password"
                name="confirmPassword"
                placeholder="Re-enter your password"
                icon={<Lock size={20} />}
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                error={fieldErrors.confirmPassword}
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to register as <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition bg-white"
              >
                <option value="client">Client (Book Services)</option>
                <option value="vendor">Vendor (Provide Services)</option>
              </select>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start pt-2">
              <input
                type="checkbox"
                name="agreeToTerms"
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="w-4 h-4 mt-1 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
              />
              <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-purple-600 hover:text-purple-800 font-medium">
                  Terms and Conditions
                </Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-purple-600 hover:text-purple-800 font-medium">
                  Privacy Policy
                </Link>
                {' '}<span className="text-red-500">*</span>
              </label>
            </div>

            {/* Register Button */}
            <div className="pt-2">
              <AuthButton 
                type="submit" 
                loading={loading} 
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Register'}
              </AuthButton>
            </div>
          </form>

          {/* Login Link */}
          <p className="text-center text-gray-600 text-sm mt-8">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-purple-600 hover:text-purple-800 font-semibold"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;