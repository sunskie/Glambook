// Frontend/src/pages/Vendor/EditCourse.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Upload, Plus, X, Calendar, MapPin, 
  Video, FileText, Trash2, Save 
} from 'lucide-react';
import courseService from '../../services/api/courseService';

interface Lesson {
  _id?: string;
  title: string;
  description: string;
  duration: number;
  contentType: 'video' | 'pdf' | 'article';
  contentUrl: string;
  isPreview: boolean;
  orderIndex: number;
}

interface Batch {
  _id?: string;
  startDate: string;
  endDate: string;
  location: string;
  seatsTotal: number;
  seatsRemaining: number;
  schedule: string;
  status: string;
}

const EditCourse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [level, setLevel] = useState('beginner');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  
  // Course Details
  const [instructorName, setInstructorName] = useState('');
  const [instructorBio, setInstructorBio] = useState('');
  const [whatYouWillLearn, setWhatYouWillLearn] = useState<string[]>(['']);
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [certificateIncluded, setCertificateIncluded] = useState(true);
  
  // Course Format
  const [theoryHours, setTheoryHours] = useState('');
  const [practicalHours, setPracticalHours] = useState('');
  const [onlineContent, setOnlineContent] = useState(true);
  const [physicalClasses, setPhysicalClasses] = useState(true);
  
  // Lessons & Batches
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  const categories = [
    'Hair Styling',
    'Makeup',
    'Skincare',
    'Nails',
    'Spa & Wellness',
    'Business & Marketing',
    'Other'
  ];

  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourseById(id!);
      const course = response.data;

      // Populate form
      setTitle(course.title);
      setDescription(course.description);
      setCategory(course.category);
      setPrice(course.price.toString());
      setDiscountPrice(course.discountPrice?.toString() || '');
      setDuration(course.duration.toString());
      setLevel(course.level);
      setInstructorName(course.instructorName);
      setInstructorBio(course.instructorBio || '');
      setWhatYouWillLearn(course.whatYouWillLearn.length > 0 ? course.whatYouWillLearn : ['']);
      setRequirements(course.requirements.length > 0 ? course.requirements : ['']);
      setCertificateIncluded(course.certificateIncluded);
      
      if (course.courseFormat) {
        setTheoryHours(course.courseFormat.theoryHours?.toString() || '');
        setPracticalHours(course.courseFormat.practicalHours?.toString() || '');
        setOnlineContent(course.courseFormat.onlineContent ?? true);
        setPhysicalClasses(course.courseFormat.physicalClasses ?? true);
      }

      setLessons(course.lessons || []);
      setBatches(course.batches || []);
      
      if (course.imageUrl) {
        setExistingImageUrl(course.imageUrl);
        const fullUrl = course.imageUrl.startsWith('http') 
          ? course.imageUrl 
          : `http://localhost:5000${course.imageUrl}`;
        setImagePreview(fullUrl);
      }

    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addLearningPoint = () => {
    setWhatYouWillLearn([...whatYouWillLearn, '']);
  };

  const updateLearningPoint = (index: number, value: string) => {
    const updated = [...whatYouWillLearn];
    updated[index] = value;
    setWhatYouWillLearn(updated);
  };

  const removeLearningPoint = (index: number) => {
    setWhatYouWillLearn(whatYouWillLearn.filter((_, i) => i !== index));
  };

  const addRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const updateRequirement = (index: number, value: string) => {
    const updated = [...requirements];
    updated[index] = value;
    setRequirements(updated);
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError('');

      if (!title || !description || !category || !price || !duration || !instructorName) {
        setError('Please fill in all required fields');
        setSaving(false);
        return;
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('price', price);
      if (discountPrice) formData.append('discountPrice', discountPrice);
      formData.append('duration', duration);
      formData.append('level', level);
      formData.append('instructorName', instructorName);
      formData.append('instructorBio', instructorBio);
      formData.append('certificateIncluded', certificateIncluded.toString());
      
      formData.append('courseFormat', JSON.stringify({
        theoryHours: parseInt(theoryHours) || 0,
        practicalHours: parseInt(practicalHours) || 0,
        onlineContent,
        physicalClasses
      }));
      
      formData.append('whatYouWillLearn', JSON.stringify(whatYouWillLearn.filter(p => p.trim())));
      formData.append('requirements', JSON.stringify(requirements.filter(r => r.trim())));
      formData.append('lessons', JSON.stringify(lessons));
      formData.append('batches', JSON.stringify(batches));
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await courseService.updateCourse(id!, formData);
      
      alert('Course updated successfully!');
      navigate('/vendor/courses');
      
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'Montserrat, sans-serif'
      }}>
        Loading course...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA', padding: '24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          marginBottom: '8px',
          fontFamily: 'Syne, sans-serif'
        }}>
          Edit Course
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666',
          marginBottom: '32px',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          Update your course information and content
        </p>

        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#FFEBEE',
            border: '1px solid #FFCDD2',
            borderRadius: '8px',
            color: '#C62828',
            fontSize: '14px',
            marginBottom: '24px',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: '24px'
        }}>
          {/* Image Upload */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '8px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Course Image
            </label>
            
            {imagePreview ? (
              <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                />
                <button
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview('');
                    setExistingImageUrl('');
                  }}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    padding: '8px',
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  <X size={20} style={{ color: '#F44336' }} />
                </button>
              </div>
            ) : (
              <label style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '200px',
                border: '2px dashed #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: '#FAFAFA'
              }}>
                <Upload size={40} style={{ color: '#999', marginBottom: '12px' }} />
                <span style={{ fontSize: '14px', color: '#666', fontFamily: 'Montserrat, sans-serif' }}>
                  Click to upload new image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

          {/* Basic Info - Same as Create Course */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '8px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Course Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '8px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Montserrat, sans-serif',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Level *
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Montserrat, sans-serif',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Price ($) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Montserrat, sans-serif',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Discount Price ($)
              </label>
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                min="0"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Montserrat, sans-serif',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Duration (hours) *
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Montserrat, sans-serif',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '8px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Instructor Name *
            </label>
            <input
              type="text"
              value={instructorName}
              onChange={(e) => setInstructorName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '8px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Instructor Bio
            </label>
            <textarea
              value={instructorBio}
              onChange={(e) => setInstructorBio(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* What You'll Learn */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '12px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              What Students Will Learn
            </label>
            
            {whatYouWillLearn.map((point, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="text"
                  value={point}
                  onChange={(e) => updateLearningPoint(index, e.target.value)}
                  placeholder="e.g., Master professional makeup techniques"
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'Montserrat, sans-serif',
                    outline: 'none'
                  }}
                />
                {whatYouWillLearn.length > 1 && (
                  <button
                    onClick={() => removeLearningPoint(index)}
                    style={{
                      padding: '12px',
                      backgroundColor: '#FFEBEE',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={20} style={{ color: '#F44336' }} />
                  </button>
                )}
              </div>
            ))}
            
            <button
              onClick={addLearningPoint}
              style={{
                padding: '10px 16px',
                backgroundColor: '#E3F2FD',
                color: '#2196F3',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              <Plus size={16} />
              Add Learning Point
            </button>
          </div>

          {/* Requirements */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '12px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Requirements
            </label>
            
            {requirements.map((req, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="text"
                  value={req}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  placeholder="e.g., Basic knowledge of makeup tools"
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'Montserrat, sans-serif',
                    outline: 'none'
                  }}
                />
                {requirements.length > 1 && (
                  <button
                    onClick={() => removeRequirement(index)}
                    style={{
                      padding: '12px',
                      backgroundColor: '#FFEBEE',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={20} style={{ color: '#F44336' }} />
                  </button>
                )}
              </div>
            ))}
            
            <button
              onClick={addRequirement}
              style={{
                padding: '10px 16px',
                backgroundColor: '#E3F2FD',
                color: '#2196F3',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              <Plus size={16} />
              Add Requirement
            </button>
          </div>

          {/* Certificate */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={certificateIncluded}
                onChange={(e) => setCertificateIncluded(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{
                fontSize: '14px',
                fontWeight: 500,
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Include Certificate of Completion
              </span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={() => navigate('/vendor/courses')}
            style={{
              padding: '14px 28px',
              backgroundColor: 'white',
              color: '#666',
              border: '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              padding: '14px 28px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCourse;
