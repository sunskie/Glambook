// Frontend/src/pages/Vendor/CreateCourse.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, Plus, X, Calendar, MapPin, 
  Users, Video, FileText, CheckCircle, Trash2, File
} from 'lucide-react';
import courseService from '../../services/api/courseService';
import Breadcrumb from '../../components/common/BreadCrumb';

interface Lesson {
  title: string;
  contentType: 'video' | 'pdf' | 'article';
  contentUrl: string;
  duration: number;
  isPreview: boolean;
}

interface Batch {
  startDate: string;
  endDate: string;
  location: string;
  seatsTotal: number;
  schedule: string;
}

const CreateCourse: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  // Step 1: Basic Info
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('beginner');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [instructorBio, setInstructorBio] = useState('');
  const [certificateIncluded, setCertificateIncluded] = useState(false);

  // Step 2: Course Details
  const [whatYouWillLearn, setWhatYouWillLearn] = useState<string[]>(['']);
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [theoryHours, setTheoryHours] = useState('');
  const [practicalHours, setPracticalHours] = useState('');
  const [onlineContent, setOnlineContent] = useState(false);
  const [physicalClasses, setPhysicalClasses] = useState(false);

  // Step 3: Content
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson>({
    title: '',
    contentType: 'video',
    contentUrl: '',
    duration: 0,
    isPreview: false
  });
  const [currentBatch, setCurrentBatch] = useState<Batch>({
    startDate: '',
    endDate: '',
    location: '',
    seatsTotal: 0,
    schedule: ''
  });

  const categories = [
    'Hair Styling',
    'Makeup',
    'Skincare',
    'Nails',
    'Spa & Wellness',
    'Business & Marketing',
    'Other'
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLessonFileUpload = async (file: File) => {
    try {
      setUploadingFile(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        'http://localhost:5000/api/courses/temp/lessons/upload',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
      
      const data = await response.json();
      
      setCurrentLesson({
        ...currentLesson,
        contentUrl: data.fileUrl
      });
      
      alert(`File uploaded successfully! (${(data.fileSize / 1024 / 1024).toFixed(2)} MB)`);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      alert(error.message || 'Failed to upload file. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const addLesson = () => {
    if (!currentLesson.title || !currentLesson.contentUrl) {
      alert('Please fill in lesson title and content');
      return;
    }
    setLessons([...lessons, currentLesson]);
    setCurrentLesson({
      title: '',
      contentType: 'video',
      contentUrl: '',
      duration: 0,
      isPreview: false
    });
  };

  const removeLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const addBatch = () => {
    if (!currentBatch.startDate || !currentBatch.endDate || !currentBatch.location) {
      alert('Please fill in batch details');
      return;
    }
    setBatches([...batches, currentBatch]);
    setCurrentBatch({
      startDate: '',
      endDate: '',
      location: '',
      seatsTotal: 0,
      schedule: ''
    });
  };

  const removeBatch = (index: number) => {
    setBatches(batches.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Validation
      if (!title || !description || !category || !price || !duration || !instructorName) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Create FormData
      const formData = new FormData();
      
      // Basic Info
      if (image) {
        formData.append('image', image);
      }
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('level', level.toLowerCase());
      formData.append('price', price);
      if (discountPrice) {
        formData.append('discountPrice', discountPrice);
      }
      formData.append('duration', duration);
      formData.append('instructorName', instructorName);
      formData.append('instructorBio', instructorBio);
      formData.append('certificateIncluded', String(certificateIncluded));

      // Course Details
      formData.append('whatYouWillLearn', JSON.stringify(whatYouWillLearn.filter(item => item.trim())));
      formData.append('requirements', JSON.stringify(requirements.filter(item => item.trim())));
      
      const courseFormat = {
        theoryHours: Number(theoryHours) || 0,
        practicalHours: Number(practicalHours) || 0,
        onlineContent,
        physicalClasses
      };
      formData.append('courseFormat', JSON.stringify(courseFormat));

      // Content (optional now)
      if (lessons.length > 0) {
        formData.append('lessons', JSON.stringify(lessons));
      }
      if (batches.length > 0) {
        formData.append('batches', JSON.stringify(batches));
      }

      await courseService.createCourse(formData);
      
      alert('Course created successfully! It will be reviewed by admin.');
      navigate('/vendor/courses');
    } catch (err: any) {
      console.error('Error creating course:', err);
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 700,
        marginBottom: '24px',
        fontFamily: 'Syne, sans-serif'
      }}>
        Basic Information
      </h2>

      {/* Image Upload */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '8px',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          Course Image
        </label>
        
        <div style={{
          border: '2px dashed #ddd',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.2s'
        }}
        onClick={() => document.getElementById('imageInput')?.click()}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#E91E63'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" style={{
              maxWidth: '100%',
              maxHeight: '300px',
              borderRadius: '8px'
            }} />
          ) : (
            <>
              <Upload size={48} style={{ margin: '0 auto 16px', color: '#999' }} />
              <p style={{ fontSize: '14px', color: '#666', fontFamily: 'Montserrat, sans-serif' }}>
                Click to upload course image
              </p>
            </>
          )}
        </div>
        <input
          id="imageInput"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '8px',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          Course Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Professional Makeup Artistry Masterclass"
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

      {/* Description */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '8px',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          Description *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what students will learn in this course..."
          rows={5}
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

      {/* Category and Level */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
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
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
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

      {/* Price and Duration */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '8px',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            Price ($) *
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="299"
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
            fontWeight: 600,
            marginBottom: '8px',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            Discount Price ($)
          </label>
          <input
            type="number"
            value={discountPrice}
            onChange={(e) => setDiscountPrice(e.target.value)}
            placeholder="249"
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
            fontWeight: 600,
            marginBottom: '8px',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            Duration (hours) *
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="40"
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

      {/* Instructor */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '8px',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            Instructor Name *
          </label>
          <input
            type="text"
            value={instructorName}
            onChange={(e) => setInstructorName(e.target.value)}
            placeholder="John Doe"
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
            fontWeight: 600,
            marginBottom: '8px',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            Instructor Bio
          </label>
          <input
            type="text"
            value={instructorBio}
            onChange={(e) => setInstructorBio(e.target.value)}
            placeholder="Professional makeup artist with 10+ years experience"
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

      {/* Certificate */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          <input
            type="checkbox"
            checked={certificateIncluded}
            onChange={(e) => setCertificateIncluded(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          Certificate Included
        </label>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 700,
        marginBottom: '24px',
        fontFamily: 'Syne, sans-serif'
      }}>
        Course Details
      </h2>

      {/* What You Will Learn */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '8px',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          What You Will Learn
        </label>
        {whatYouWillLearn.map((item, index) => (
          <div key={index} style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const updated = [...whatYouWillLearn];
                updated[index] = e.target.value;
                setWhatYouWillLearn(updated);
              }}
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
            <button
              onClick={() => setWhatYouWillLearn(whatYouWillLearn.filter((_, i) => i !== index))}
              style={{
                padding: '12px',
                backgroundColor: '#FFEBEE',
                color: '#F44336',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        ))}
        <button
          onClick={() => setWhatYouWillLearn([...whatYouWillLearn, ''])}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: '#E3F2FD',
            color: '#2196F3',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'Montserrat, sans-serif'
          }}
        >
          <Plus size={18} />
          Add Learning Point
        </button>
      </div>

      {/* Requirements */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '8px',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          Requirements
        </label>
        {requirements.map((item, index) => (
          <div key={index} style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const updated = [...requirements];
                updated[index] = e.target.value;
                setRequirements(updated);
              }}
              placeholder="e.g., Basic understanding of makeup products"
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
            <button
              onClick={() => setRequirements(requirements.filter((_, i) => i !== index))}
              style={{
                padding: '12px',
                backgroundColor: '#FFEBEE',
                color: '#F44336',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        ))}
        <button
          onClick={() => setRequirements([...requirements, ''])}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: '#E3F2FD',
            color: '#2196F3',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'Montserrat, sans-serif'
          }}
        >
          <Plus size={18} />
          Add Requirement
        </button>
      </div>

      {/* Course Format */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '12px',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          Course Format
        </label>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '16px'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              marginBottom: '6px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Theory Hours
            </label>
            <input
              type="number"
              value={theoryHours}
              onChange={(e) => setTheoryHours(e.target.value)}
              placeholder="20"
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
              fontSize: '13px',
              marginBottom: '6px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Practical Hours
            </label>
            <input
              type="number"
              value={practicalHours}
              onChange={(e) => setPracticalHours(e.target.value)}
              placeholder="20"
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

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            <input
              type="checkbox"
              checked={onlineContent}
              onChange={(e) => setOnlineContent(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            Includes Online Content
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            <input
              type="checkbox"
              checked={physicalClasses}
              onChange={(e) => setPhysicalClasses(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            Includes Physical Classes
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 700,
        marginBottom: '24px',
        fontFamily: 'Syne, sans-serif'
      }}>
        Course Content (Optional)
      </h2>

      <p style={{
        fontSize: '14px',
        color: '#666',
        marginBottom: '24px',
        fontFamily: 'Montserrat, sans-serif'
      }}>
        You can add lessons and batches now, or add them later after the course is created.
      </p>

      {/* Lessons Section */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: '16px',
          fontFamily: 'Syne, sans-serif'
        }}>
          Lessons
        </h3>

        {/* Current Lesson Form */}
        <div style={{
          backgroundColor: '#F9F9F9',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              marginBottom: '6px',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 500
            }}>
              Lesson Title
            </label>
            <input
              type="text"
              value={currentLesson.title}
              onChange={(e) => setCurrentLesson({ ...currentLesson, title: e.target.value })}
              placeholder="e.g., Introduction to Makeup Basics"
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

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                marginBottom: '6px',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 500
              }}>
                Content Type
              </label>
              <select
                value={currentLesson.contentType}
                onChange={(e) => setCurrentLesson({ 
                  ...currentLesson, 
                  contentType: e.target.value as 'video' | 'pdf' | 'article',
                  contentUrl: '' // Reset URL when changing type
                })}
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
                <option value="video">Video</option>
                <option value="pdf">PDF Document</option>
                <option value="article">Article (URL)</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                marginBottom: '6px',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 500
              }}>
                Duration (minutes)
              </label>
              <input
                type="number"
                value={currentLesson.duration}
                onChange={(e) => setCurrentLesson({ ...currentLesson, duration: Number(e.target.value) })}
                placeholder="30"
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

          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              marginBottom: '6px',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 500
            }}>
              {currentLesson.contentType === 'video' 
                ? 'Upload Video File' 
                : currentLesson.contentType === 'pdf'
                ? 'Upload PDF Document'
                : 'Article URL'}
            </label>
            
            {currentLesson.contentType === 'article' ? (
              <input
                type="url"
                value={currentLesson.contentUrl}
                onChange={(e) => setCurrentLesson({ ...currentLesson, contentUrl: e.target.value })}
                placeholder="https://example.com/article"
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
            ) : (
              <div>
                <input
                  type="file"
                  accept={currentLesson.contentType === 'video' ? 'video/*' : '.pdf'}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 200 * 1024 * 1024) {
                        alert('File is too large. Maximum size is 200MB.');
                        return;
                      }
                      handleLessonFileUpload(file);
                    }
                  }}
                  disabled={uploadingFile}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'Montserrat, sans-serif',
                    outline: 'none',
                    cursor: uploadingFile ? 'not-allowed' : 'pointer',
                    backgroundColor: uploadingFile ? '#f5f5f5' : 'white'
                  }}
                />
                
                {uploadingFile && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    backgroundColor: '#E3F2FD',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '3px solid #2196F3',
                      borderTop: '3px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    <span style={{
                      fontSize: '13px',
                      color: '#2196F3',
                      fontWeight: 600,
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      Uploading file... Please wait
                    </span>
                  </div>
                )}
                
                {currentLesson.contentUrl && !uploadingFile && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    backgroundColor: '#E8F5E9',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle size={16} style={{ color: '#4CAF50', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '13px',
                        color: '#4CAF50',
                        fontWeight: 600,
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        File uploaded successfully!
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#666',
                        fontFamily: 'Montserrat, sans-serif',
                        marginTop: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {currentLesson.contentUrl}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div style={{
              fontSize: '12px',
              color: '#999',
              marginTop: '6px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              {currentLesson.contentType === 'video' 
                ? 'Supported: MP4, MOV, AVI, MKV, WebM (Max 200MB)'
                : currentLesson.contentType === 'pdf'
                ? 'Supported: PDF (Max 200MB)'
                : 'Enter the full URL of the article'}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              <input
                type="checkbox"
                checked={currentLesson.isPreview}
                onChange={(e) => setCurrentLesson({ ...currentLesson, isPreview: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              Allow as Preview Lesson
            </label>
          </div>

          <button
            onClick={addLesson}
            disabled={uploadingFile}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              backgroundColor: uploadingFile ? '#ccc' : '#E91E63',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: uploadingFile ? 'not-allowed' : 'pointer',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            <Plus size={18} />
            Add Lesson
          </button>
        </div>

        {/* Added Lessons List */}
        {lessons.length > 0 && (
          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: 600,
              marginBottom: '12px',
              fontFamily: 'Syne, sans-serif'
            }}>
              Added Lessons ({lessons.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {lessons.map((lesson, index) => (
                <div key={index} style={{
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '4px',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      {index + 1}. {lesson.title}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#666',
                      fontFamily: 'Montserrat, sans-serif',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center'
                    }}>
                      {lesson.contentType === 'video' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Video size={14} />
                          Video
                        </span>
                      ) : lesson.contentType === 'pdf' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FileText size={14} />
                          PDF
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <File size={14} />
                          Article
                        </span>
                      )}
                      <span>{lesson.duration} min</span>
                      {lesson.isPreview && (
                        <span style={{
                          padding: '2px 8px',
                          backgroundColor: '#E3F2FD',
                          color: '#2196F3',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 600
                        }}>
                          Preview
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeLesson(index)}
                    style={{
                      padding: '8px',
                      backgroundColor: '#FFEBEE',
                      color: '#F44336',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Batches Section */}
      <div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: '16px',
          fontFamily: 'Syne, sans-serif'
        }}>
          Batches (Optional)
        </h3>

        {/* Current Batch Form */}
        <div style={{
          backgroundColor: '#F9F9F9',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                marginBottom: '6px',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 500
              }}>
                Start Date
              </label>
              <input
                type="date"
                value={currentBatch.startDate}
                onChange={(e) => setCurrentBatch({ ...currentBatch, startDate: e.target.value })}
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
                fontSize: '13px',
                marginBottom: '6px',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 500
              }}>
                End Date
              </label>
              <input
                type="date"
                value={currentBatch.endDate}
                onChange={(e) => setCurrentBatch({ ...currentBatch, endDate: e.target.value })}
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

          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                marginBottom: '6px',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 500
              }}>
                Location
              </label>
              <input
                type="text"
                value={currentBatch.location}
                onChange={(e) => setCurrentBatch({ ...currentBatch, location: e.target.value })}
                placeholder="e.g., New York Studio"
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
                fontSize: '13px',
                marginBottom: '6px',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 500
              }}>
                Total Seats
              </label>
              <input
                type="number"
                value={currentBatch.seatsTotal}
                onChange={(e) => setCurrentBatch({ ...currentBatch, seatsTotal: Number(e.target.value) })}
                placeholder="20"
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

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              marginBottom: '6px',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 500
            }}>
              Schedule
            </label>
            <input
              type="text"
              value={currentBatch.schedule}
              onChange={(e) => setCurrentBatch({ ...currentBatch, schedule: e.target.value })}
              placeholder="e.g., Mon-Fri, 10AM-2PM"
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

          <button
            onClick={addBatch}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              backgroundColor: '#E91E63',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            <Plus size={18} />
            Add Batch
          </button>
        </div>

        {/* Added Batches List */}
        {batches.length > 0 && (
          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: 600,
              marginBottom: '12px',
              fontFamily: 'Syne, sans-serif'
            }}>
              Added Batches ({batches.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {batches.map((batch, index) => (
                <div key={index} style={{
                  padding: '12px',
                  backgroundColor: 'white',
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '4px',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      Batch {index + 1}: {batch.location}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#666',
                      fontFamily: 'Montserrat, sans-serif',
                      display: 'flex',
                      gap: '12px',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} />
                        {new Date(batch.startDate).toLocaleDateString()} - {new Date(batch.endDate).toLocaleDateString()}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} />
                        {batch.location}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={14} />
                        {batch.seatsTotal} seats
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeBatch(index)}
                    style={{
                      padding: '8px',
                      backgroundColor: '#FFEBEE',
                      color: '#F44336',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA', padding: '24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Dashboard', path: '/vendor/dashboard' },
            { label: 'My Courses', path: '/vendor/courses' },
            { label: 'Create Course' }
          ]}
          homeLink="/vendor/dashboard"
        />

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 700,
              marginBottom: '8px',
              fontFamily: 'Syne, sans-serif'
            }}>
              Create New Course
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#666',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Fill in the course details to create a new learning experience
            </p>
          </div>
        </div>

        {/* Steps Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '32px',
          position: 'relative'
        }}>
          {/* Progress Line */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '0',
            right: '0',
            height: '2px',
            backgroundColor: '#E0E0E0',
            zIndex: 0
          }}>
            <div style={{
              height: '100%',
              backgroundColor: '#E91E63',
              width: `${((currentStep - 1) / 2) * 100}%`,
              transition: 'width 0.3s'
            }} />
          </div>

          {[1, 2, 3].map((step) => (
            <div
              key={step}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                zIndex: 1
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: currentStep >= step ? '#E91E63' : 'white',
                border: `2px solid ${currentStep >= step ? '#E91E63' : '#E0E0E0'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 600,
                color: currentStep >= step ? 'white' : '#999',
                marginBottom: '8px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                {step}
              </div>
              <div style={{
                fontSize: '13px',
                fontWeight: currentStep === step ? 600 : 400,
                color: currentStep >= step ? '#111' : '#999',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                {step === 1 ? 'Basic Info' : step === 2 ? 'Details' : 'Content'}
              </div>
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#FFEBEE',
            color: '#F44336',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '14px',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            {error}
          </div>
        )}

        {/* Form Content */}
        <div style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: '24px'
        }}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Navigation Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              style={{
                padding: '12px 24px',
                backgroundColor: 'white',
                color: '#666',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              Previous
            </button>
          )}

          <div style={{ flex: 1 }} />

          {currentStep < 3 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#E91E63',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: loading ? '#ccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              {loading ? 'Creating Course...' : 'Create Course'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
