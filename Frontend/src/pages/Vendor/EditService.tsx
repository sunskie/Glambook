import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import serviceService from '../../services/api/serviceService';
import showToast from '../../components/common/Toast';
import VendorSidebar from '../../components/Vendor/VendorSidebar';

const EditService: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    category: 'Hair',
    status: 'active' as 'active' | 'inactive',
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingService, setLoadingService] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const categories = ['Hair', 'Makeup', 'Spa', 'Nails', 'Skincare', 'Massage', 'Other'];

  useEffect(() => {
    if (id) fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      setLoadingService(true);
      const response = await serviceService.getServiceById(id!);
      const service = response.data;

      setFormData({
        title: service.title,
        description: service.description,
        price: service.price.toString(),
        duration: service.duration.toString(),
        category: service.category,
        status: service.status,
      });

      const src = (service as any).images?.[0] || (service as any).image || service.imageUrl || '';
      if (src) {
        const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        const fullUrl = src.startsWith('http') ? src : `${BASE_URL}${src}`;
        setImagePreview(fullUrl);
      }
    } catch (err: any) {
      console.error('Error fetching service:', err);
      setError('Failed to load service. Redirecting...');
      showToast.error('Failed to load service');
      setTimeout(() => navigate('/vendor/dashboard'), 2000);
    } finally {
      setLoadingService(false);
    }
  };

  const validatePrice = (price: string): string => {
    const num = parseFloat(price);
    if (isNaN(num) || num <= 0) return 'Price must be a positive number';
    if (!/^\d+(\.\d{1,2})?$/.test(price)) return 'Price can have maximum 2 decimal places';
    return '';
  };

  const validateDuration = (duration: string): string => {
    const num = parseInt(duration);
    if (isNaN(num) || num <= 0) return 'Duration must be a positive number';
    if (!Number.isInteger(parseFloat(duration))) return 'Duration must be a whole number';
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name]) setFieldErrors({ ...fieldErrors, [name]: '' });
    if (error) setError('');
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let errorMessage = '';
    if (name === 'price' && value) errorMessage = validatePrice(value);
    else if (name === 'duration' && value) errorMessage = validateDuration(value);
    if (errorMessage) setFieldErrors({ ...fieldErrors, [name]: errorMessage });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const errors: { [key: string]: string } = {};

    if (!formData.title.trim()) errors.title = 'Title is required';
    else if (formData.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';

    if (!formData.description.trim()) errors.description = 'Description is required';
    else if (formData.description.trim().length < 10) errors.description = 'Description must be at least 10 characters';

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

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix the errors above');
      return;
    }

    setLoading(true);
    try {
      await serviceService.updateService(id!, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        category: formData.category,
        status: formData.status,
        image: selectedImage,
      });
      showToast.success('Service updated successfully!');
      setTimeout(() => navigate('/vendor/services'), 500);
    } catch (err: any) {
      console.error('Error updating service:', err);
      setError(err.message || 'Failed to update service. Please try again.');
      showToast.error(err.message || 'Failed to update service');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    border: '1.5px solid #E2E8F0',
    borderRadius: '10px',
    fontSize: '14px',
    fontFamily: 'Montserrat, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#0F172A',
    transition: 'border-color 0.2s',
    backgroundColor: 'white',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 700,
    color: '#0F172A',
    marginBottom: '8px',
    fontFamily: 'Montserrat, sans-serif',
  };

  const errorTextStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#DC2626',
    marginTop: '4px',
    fontFamily: 'Montserrat, sans-serif',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8F9FA', fontFamily: 'Montserrat, sans-serif' }}>
      <VendorSidebar />

      <main style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Top bar */}
        <header style={{ position: 'sticky', top: 0, zIndex: 40, backgroundColor: 'white', borderBottom: '1px solid #F1F5F9', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A', fontFamily: 'Syne, sans-serif' }}>
              Edit Service
            </h1>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              {['Dashboard', 'Services', 'Edit Service'].map((crumb, i, arr) => (
                <span key={crumb} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    onClick={() => {
                      if (i === 0) navigate('/vendor/dashboard');
                      else if (i === 1) navigate('/vendor/services');
                    }}
                    style={{ fontSize: '11px', fontWeight: i === arr.length - 1 ? 700 : 500, color: i === arr.length - 1 ? '#5B62B3' : '#94A3B8', cursor: i < arr.length - 1 ? 'pointer' : 'default' }}
                  >
                    {crumb}
                  </span>
                  {i < arr.length - 1 && <span style={{ fontSize: '11px', color: '#CBD5E1' }}>/</span>}
                </span>
              ))}
            </nav>
          </div>
        </header>

        {/* Scrollable content */}
        <div style={{ flex: 1, maxWidth: '860px', width: '100%', margin: '0 auto', padding: '32px 32px 120px', boxSizing: 'border-box' }}>

          {/* Loading state */}
          {loadingService && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>
              Loading service...
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px', color: '#DC2626', fontSize: '13px', fontWeight: 600 }}>
              {error}
            </div>
          )}

          {!loadingService && (
            <form onSubmit={handleSubmit}>
              <div style={{ backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9', padding: '40px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

                {/* Section header */}
                <div>
                  <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 800, color: '#0F172A', fontFamily: 'Syne, sans-serif' }}>Service Details</h2>
                  <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>Update the details for this service.</p>
                </div>

                {/* Image Upload */}
                <div>
                  <label style={labelStyle}>Service Image</label>
                  <div
                    onClick={() => document.getElementById('editServiceImageInput')?.click()}
                    style={{
                      border: `2px dashed ${imagePreview ? '#5B62B3' : '#E2E8F0'}`,
                      borderRadius: '14px',
                      backgroundColor: imagePreview ? '#F5F6FF' : '#FAFAFA',
                      padding: imagePreview ? '0' : '48px',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all 0.2s',
                      minHeight: '180px', overflow: 'hidden',
                    }}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px', display: 'block' }} />
                    ) : (
                      <>
                        <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', fontSize: '22px' }}>⬆</div>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Click to change service image</p>
                        <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#CBD5E1' }}>PNG, JPG, WEBP up to 5MB</p>
                      </>
                    )}
                  </div>
                  <input id="editServiceImageInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                </div>

                {/* Title */}
                <div>
                  <label style={labelStyle}>Service Title <span style={{ color: '#E91E63' }}>*</span></label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Signature Bridal Glow Session"
                    maxLength={100}
                    style={{ ...inputStyle, borderColor: fieldErrors.title ? '#DC2626' : '#E2E8F0' }}
                    onFocus={e => e.target.style.borderColor = '#5B62B3'}
                    onBlur={e => { e.target.style.borderColor = fieldErrors.title ? '#DC2626' : '#E2E8F0'; }}
                  />
                  {fieldErrors.title && <p style={errorTextStyle}>{fieldErrors.title}</p>}
                  <p style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '4px' }}>{formData.title.length}/100 characters</p>
                </div>

                {/* Description */}
                <div>
                  <label style={labelStyle}>Description <span style={{ color: '#E91E63' }}>*</span></label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the service..."
                    rows={4}
                    maxLength={1000}
                    style={{ ...inputStyle, resize: 'none', borderColor: fieldErrors.description ? '#DC2626' : '#E2E8F0' }}
                    onFocus={e => e.target.style.borderColor = '#5B62B3'}
                    onBlur={e => { e.target.style.borderColor = fieldErrors.description ? '#DC2626' : '#E2E8F0'; }}
                  />
                  {fieldErrors.description && <p style={errorTextStyle}>{fieldErrors.description}</p>}
                  <p style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '4px' }}>{formData.description.length}/1000 characters</p>
                </div>

                {/* Category + Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <label style={labelStyle}>Category <span style={{ color: '#E91E63' }}>*</span></label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      style={{ ...inputStyle }}
                      onFocus={e => e.target.style.borderColor = '#5B62B3'}
                      onBlur={e => { e.target.style.borderColor = '#E2E8F0'; }}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Publish Status</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '46px', paddingLeft: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: formData.status === 'active' ? '#5B62B3' : '#94A3B8' }}>Active</span>
                      <div
                        onClick={() => setFormData({ ...formData, status: formData.status === 'active' ? 'inactive' : 'active' })}
                        style={{ position: 'relative', width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer', transition: 'background 0.2s', backgroundColor: formData.status === 'active' ? '#5B62B3' : '#E2E8F0', flexShrink: 0 }}
                      >
                        <div style={{ position: 'absolute', top: '3px', left: formData.status === 'active' ? '22px' : '3px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'white', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: formData.status === 'inactive' ? '#5B62B3' : '#94A3B8' }}>Inactive</span>
                    </div>
                  </div>
                </div>

                {/* Price + Duration */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <label style={labelStyle}>Price (Rs.) <span style={{ color: '#E91E63' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: '#94A3B8', fontWeight: 600, pointerEvents: 'none' }}>Rs.</span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        style={{ ...inputStyle, paddingLeft: '44px', borderColor: fieldErrors.price ? '#DC2626' : '#E2E8F0' }}
                        onFocus={e => e.target.style.borderColor = '#5B62B3'}
                      />
                    </div>
                    {fieldErrors.price && <p style={errorTextStyle}>{fieldErrors.price}</p>}
                  </div>

                  <div>
                    <label style={labelStyle}>Duration (mins) <span style={{ color: '#E91E63' }}>*</span></label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g., 60"
                      min="1"
                      step="1"
                      style={{ ...inputStyle, borderColor: fieldErrors.duration ? '#DC2626' : '#E2E8F0' }}
                      onFocus={e => e.target.style.borderColor = '#5B62B3'}
                    />
                    {fieldErrors.duration && <p style={errorTextStyle}>{fieldErrors.duration}</p>}
                  </div>
                </div>

                {/* Buttons — inside card, same as CreateService */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #F1F5F9' }}>
                  <button
                    type="button"
                    onClick={() => navigate('/vendor/services')}
                    disabled={loading}
                    style={{ padding: '12px 28px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'transparent', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#64748B', fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ padding: '12px 32px', borderRadius: '10px', border: 'none', background: loading ? '#CBD5E1' : 'linear-gradient(135deg, #5B62B3 0%, #747BCF 100%)', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 700, fontFamily: 'Montserrat, sans-serif', boxShadow: loading ? 'none' : '0 4px 12px rgba(91,98,179,0.3)' }}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>

              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default EditService;