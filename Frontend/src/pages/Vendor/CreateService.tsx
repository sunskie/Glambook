import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins, Clock, Tag, FileText } from 'lucide-react';
import serviceService from '../../services/api/serviceService';
import showToast from '../../components/common/Toast';
import ImageUpload from '../../components/common/ImageUpload';

/**
 * CreateService Component
 * 
 * Form to create a new service
 * Validates all inputs before submission
 */

const CreateService: React.FC = () => {
  const navigate = useNavigate();

  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    category: 'Hair',
    status: 'active' as 'active' | 'inactive',
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  // Category options
  const categories = ['Hair', 'Makeup', 'Spa', 'Nails', 'Skincare', 'Massage', 'Other'];

  // ========================================
  // VALIDATION FUNCTIONS
  // ========================================
  const validatePrice = (price: string): string => {
    const num = parseFloat(price);
    if (isNaN(num) || num <= 0) {
      return 'Price must be a positive number';
    }
    if (!/^\d+(\.\d{1,2})?$/.test(price)) {
      return 'Price can have maximum 2 decimal places';
    }
    return '';
  };

  const validateDuration = (duration: string): string => {
    const num = parseInt(duration);
    if (isNaN(num) || num <= 0) {
      return 'Duration must be a positive number';
    }
    if (!Number.isInteger(num)) {
      return 'Duration must be a whole number';
    }
    return '';
  };

  // ========================================
  // EVENT HANDLERS
  // ========================================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
    if (error) setError('');
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let errorMessage = '';

    if (name === 'price' && value) {
      errorMessage = validatePrice(value);
    } else if (name === 'duration' && value) {
      errorMessage = validateDuration(value);
    }

    if (errorMessage) {
      setFieldErrors({ ...fieldErrors, [name]: errorMessage });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Validate all fields
    const errors: {[key: string]: string} = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    if (!formData.price) {
      errors.price = 'Price is required';
    } else {
      const priceError = validatePrice(formData.price);
      if (priceError) errors.price = priceError;
    }

    if (!formData.duration) {
      errors.duration = 'Duration is required';
    } else {
      const durationError = validateDuration(formData.duration);
      if (durationError) errors.duration = durationError;
    }

    // If there are errors, display them
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix the errors above');
      return;
    }

    setLoading(true);

    try {
      await serviceService.createService({
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        category: formData.category,
        status: formData.status,
        image: selectedImage,
      });

      showToast.success('Service created successfully!');
      setTimeout(() => navigate('/vendor/dashboard'), 500);
    } catch (err: any) {
      console.error('Error creating service:', err);
      setError(err.message || 'Failed to create service. Please try again.');
      showToast.error(err.message || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RENDER UI
  // ========================================
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/vendor/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          
          {/* Form Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Service</h1>
            <p className="text-gray-600">Fill in the details below to add a new service to your offerings</p>
          </div>

          {/* Error Message */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Upload */}
            <ImageUpload
              currentImage={null}
              onImageSelect={setSelectedImage}
              error={fieldErrors.image}
            />

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Professional Haircut"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none ${
                    fieldErrors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={100}
                />
              </div>
              {fieldErrors.title && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.title}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">{formData.title.length}/100 characters</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your service in detail..."
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none ${
                  fieldErrors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={1000}
              />
              {fieldErrors.description && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">{formData.description.length}/1000 characters</p>
            </div>

            {/* Price and Duration - 2 Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (NPR) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none ${
                      fieldErrors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {fieldErrors.price && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.price}</p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="60"
                    min="1"
                    step="1"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none ${
                      fieldErrors.duration ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {fieldErrors.duration && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.duration}</p>
                )}
              </div>
            </div>

            {/* Category and Status - 2 Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none appearance-none bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none appearance-none bg-white"
                >
                  <option value="active">Active (Visible to clients)</option>
                  <option value="inactive">Inactive (Hidden from clients)</option>
                </select>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/vendor/dashboard')}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Service'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateService;