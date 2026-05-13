// Frontend/src/pages/Client/CourseEnrollment.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Clock, Users, 
  CheckCircle, CreditCard, Award 
} from 'lucide-react';
import courseService from '../../services/api/courseService';
import enrollmentService from '../../services/api/enrollmentService';
import { useAuth } from '../../context/AuthContext';
import EsewaPaymentButton from '../../components/common/EsewaPaymentButton';

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPrice: number | null;
  duration: number;
  imageUrl: string | null;
  instructorName: string;
  certificateIncluded: boolean;
  courseFormat: {
    theoryHours: number;
    practicalHours: number;
    onlineContent: boolean;
    physicalClasses: boolean;
  };
  batches: Array<{
    _id: string;
    startDate: string;
    endDate: string;
    location: string;
    seatsTotal: number;
    seatsRemaining: number;
    schedule: string;
    status: string;
  }>;
}

const CourseEnrollment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [createdEnrollmentId, setCreatedEnrollmentId] = useState<string | null>(null);
  const [enrollmentStep, setEnrollmentStep] = useState<'details' | 'payment'>('details');
  const [formData, setFormData] = useState({
    clientName: user?.name || '',
    clientEmail: user?.email || '',
    clientPhone: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchCourseDetail();
    }
  }, [id]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourseById(id!);
      setCourse(response.data);
    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:5000${imageUrl}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleContinue = () => {
    if (currentStep === 1) {
      if (course?.courseFormat.physicalClasses && !selectedBatchId) {
        setError('Please select a batch');
        return;
      }
      setError('');
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.clientName || !formData.clientEmail) {
        setError('Please fill all required fields');
        return;
      }
      setError('');
      setCurrentStep(3);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      setError('');

      const enrollmentData = {
        courseId: id!,
        selectedBatchId: selectedBatchId || undefined,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
      };

      const response = await enrollmentService.createEnrollment(enrollmentData);
      const enrollmentId = response.data?._id;
      setCreatedEnrollmentId(enrollmentId);
      setEnrollmentStep('payment');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create enrollment');
    } finally {
      setEnrolling(false);
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
        Loading...
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'Montserrat, sans-serif'
      }}>
        Course not found
      </div>
    );
  }

  if (enrollmentStep === 'payment' && createdEnrollmentId && course) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, sans-serif', padding: '24px' }}>
        <div style={{ maxWidth: '480px', margin: '40px auto', padding: '32px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontFamily: 'Montserrat, sans-serif' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111', marginBottom: '8px' }}>Complete Payment</h2>
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px' }}>Your enrollment is ready. Pay to activate access to the course.</p>

          <div style={{ backgroundColor: '#fafafa', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#6B7280', fontSize: '14px' }}>Course</span>
              <span style={{ fontWeight: 600, color: '#111', fontSize: '14px' }}>{course.title}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#6B7280', fontSize: '14px' }}>Instructor</span>
              <span style={{ fontWeight: 600, color: '#111', fontSize: '14px' }}>{course.instructorName}</span>
            </div>
            <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, color: '#111', fontSize: '16px' }}>Total</span>
              <span style={{ fontWeight: 700, color: '#5B62B3', fontSize: '16px' }}>Rs. {(course.discountPrice || course.price)?.toLocaleString()}</span>
            </div>
          </div>

          <div style={{
            backgroundColor: '#FFF9C4',
            border: '1px solid #F59E0B',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '16px',
            fontFamily: 'Montserrat, sans-serif',
          }}>
            <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '13px', color: '#92400E' }}>
              🧪 eSewa Test Mode — Use these credentials:
            </p>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#92400E' }}>
              <strong>eSewa ID:</strong> 9806800001 (or 9806800002, 9806800003, 9806800004, 9806800005)
            </p>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#92400E' }}>
              <strong>Password:</strong> Nepal@123
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#B45309' }}>
              These are official eSewa sandbox test accounts. Do not use real credentials.
            </p>
          </div>

          <EsewaPaymentButton type="enrollment" id={createdEnrollmentId} amount={course.discountPrice || course.price} />

          <button
            onClick={() => navigate(`/client/enrollment-success/${createdEnrollmentId}`)}
            style={{ width: '100%', marginTop: '12px', padding: '14px', backgroundColor: 'white', color: '#6B7280', border: '2px solid #E5E7EB', borderRadius: '12px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}
          >
            Pay Later (Cash at Venue)
          </button>
        </div>
      </div>
    );
  }

  const finalPrice = course.discountPrice || course.price;
  const selectedBatch = course.batches.find(b => b._id === selectedBatchId);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Progress Steps */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          {[
            { num: 1, label: 'Select Batch' },
            { num: 2, label: 'Confirm' },
            { num: 3, label: 'Payment' },
            { num: 4, label: 'Complete' }
          ].map((step, index) => (
            <React.Fragment key={step.num}>
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: currentStep >= step.num ? '#E91E63' : '#E0E0E0',
                  color: currentStep >= step.num ? 'white' : '#999',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 600,
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {currentStep > step.num ? <CheckCircle size={24} /> : step.num}
                </div>
                <span style={{ 
                  fontSize: '13px',
                  color: currentStep >= step.num ? '#E91E63' : '#999',
                  fontWeight: currentStep === step.num ? 600 : 400,
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {step.label}
                </span>
              </div>
              {index < 3 && (
                <div style={{
                  width: '80px',
                  height: '2px',
                  backgroundColor: currentStep > step.num ? '#E91E63' : '#E0E0E0',
                  margin: '0 16px 24px'
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: '32px'
        }}>
          {/* Left: Steps Content */}
          <div>
            {error && (
              <div style={{
                padding: '16px',
                backgroundColor: '#FFEBEE',
                border: '1px solid #FFCDD2',
                borderRadius: '8px',
                color: '#C62828',
                marginBottom: '24px',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                {error}
              </div>
            )}

            {/* Step 1: Select Batch */}
            {currentStep === 1 && (
              <div style={{
                backgroundColor: 'white',
                padding: '32px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <h2 style={{ 
                  fontSize: '28px',
                  fontWeight: 600,
                  marginBottom: '24px',
                  fontFamily: 'Syne, sans-serif'
                }}>
                  Select Your Batch
                </h2>

                {course.courseFormat.physicalClasses ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {course.batches.filter(b => b.status === 'upcoming').map(batch => (
                      <div
                        key={batch._id}
                        onClick={() => setSelectedBatchId(batch._id)}
                        style={{
                          padding: '24px',
                          border: selectedBatchId === batch._id ? '2px solid #E91E63' : '2px solid #E0E0E0',
                          borderRadius: '12px',
                          cursor: batch.seatsRemaining > 0 ? 'pointer' : 'not-allowed',
                          opacity: batch.seatsRemaining === 0 ? 0.5 : 1,
                          backgroundColor: selectedBatchId === batch._id ? '#FCE4EC' : 'white',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ 
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          marginBottom: '16px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={20} style={{ color: '#E91E63' }} />
                            <span style={{ 
                              fontSize: '18px',
                              fontWeight: 600,
                              fontFamily: 'Montserrat, sans-serif'
                            }}>
                              {new Date(batch.startDate).toLocaleDateString('en-US', { 
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })} - {new Date(batch.endDate).toLocaleDateString('en-US', { 
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          {batch.seatsRemaining < 5 && batch.seatsRemaining > 0 && (
                            <span style={{
                              fontSize: '12px',
                              backgroundColor: '#FFF3E0',
                              color: '#E65100',
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontWeight: 600,
                              fontFamily: 'Montserrat, sans-serif'
                            }}>
                              Limited
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={16} style={{ color: '#666' }} />
                            <span style={{ fontSize: '14px', color: '#666', fontFamily: 'Montserrat, sans-serif' }}>
                              {batch.location}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={16} style={{ color: '#666' }} />
                            <span style={{ fontSize: '14px', color: '#666', fontFamily: 'Montserrat, sans-serif' }}>
                              {batch.schedule}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={16} style={{ color: '#666' }} />
                            <span style={{ 
                              fontSize: '14px',
                              color: batch.seatsRemaining === 0 ? '#E91E63' : '#4CAF50',
                              fontWeight: 600,
                              fontFamily: 'Montserrat, sans-serif'
                            }}>
                              {batch.seatsRemaining === 0 ? 'Batch Full' : 
                               `${batch.seatsRemaining} of ${batch.seatsTotal} seats available`
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    padding: '32px',
                    backgroundColor: '#E8F5E9',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    <CheckCircle size={48} style={{ color: '#4CAF50', marginBottom: '16px' }} />
                    <p style={{ fontSize: '16px', color: '#2E7D32', fontWeight: 600 }}>
                      This is an online-only course. No batch selection required.
                    </p>
                  </div>
                )}

                <button
                  onClick={handleContinue}
                  disabled={course.courseFormat.physicalClasses && !selectedBatchId}
                  style={{
                    width: '100%',
                    padding: '16px',
                    backgroundColor: '#E91E63',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '24px',
                    fontFamily: 'Montserrat, sans-serif',
                    opacity: course.courseFormat.physicalClasses && !selectedBatchId ? 0.5 : 1
                  }}
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 2: Confirm Details */}
            {currentStep === 2 && (
              <div style={{
                backgroundColor: 'white',
                padding: '32px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <h2 style={{ 
                  fontSize: '28px',
                  fontWeight: 600,
                  marginBottom: '24px',
                  fontFamily: 'Syne, sans-serif'
                }}>
                  Confirm Enrollment
                </h2>

                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ 
                    fontSize: '18px',
                    fontWeight: 600,
                    marginBottom: '16px',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    Course Details
                  </h3>
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#F5F5F5',
                    borderRadius: '8px'
                  }}>
                    <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', fontFamily: 'Montserrat, sans-serif' }}>
                      {course.title}
                    </p>
                    <p style={{ fontSize: '14px', color: '#666', fontFamily: 'Montserrat, sans-serif' }}>
                      by {course.instructorName}
                    </p>
                  </div>
                </div>

                {selectedBatch && (
                  <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ 
                      fontSize: '18px',
                      fontWeight: 600,
                      marginBottom: '16px',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      Batch Details
                    </h3>
                    <div style={{
                      padding: '20px',
                      backgroundColor: '#F5F5F5',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={16} />
                        <span style={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
                          {new Date(selectedBatch.startDate).toLocaleDateString()} - {new Date(selectedBatch.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={16} />
                        <span style={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
                          {selectedBatch.location}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} />
                        <span style={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
                          {selectedBatch.schedule}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ 
                    fontSize: '18px',
                    fontWeight: 600,
                    marginBottom: '16px',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    Your Information
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ 
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 500,
                        marginBottom: '8px',
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="clientName"
                        value={formData.clientName}
                        onChange={handleInputChange}
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
                        Email *
                      </label>
                      <input
                        type="email"
                        name="clientEmail"
                        value={formData.clientEmail}
                        onChange={handleInputChange}
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
                        Phone Number (optional)
                      </label>
                      <input
                        type="tel"
                        name="clientPhone"
                        value={formData.clientPhone}
                        onChange={handleInputChange}
                        placeholder="9800000000"
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
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setCurrentStep(1)}
                    style={{
                      flex: 1,
                      padding: '16px',
                      backgroundColor: 'white',
                      color: '#E91E63',
                      border: '2px solid #E91E63',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'Montserrat, sans-serif'
                    }}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleContinue}
                    style={{
                      flex: 1,
                      padding: '16px',
                      backgroundColor: '#E91E63',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'Montserrat, sans-serif'
                    }}
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div style={{
                backgroundColor: 'white',
                padding: '32px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <h2 style={{ 
                  fontSize: '28px',
                  fontWeight: 600,
                  marginBottom: '24px',
                  fontFamily: 'Syne, sans-serif'
                }}>
                  Payment Information
                </h2>

                <div style={{
                  padding: '32px',
                  backgroundColor: '#FFF3E0',
                  borderRadius: '8px',
                  textAlign: 'center',
                  marginBottom: '24px'
                }}>
                  <CreditCard size={48} style={{ color: '#F57C00', marginBottom: '16px' }} />
                  <h3 style={{ 
                    fontSize: '18px',
                    fontWeight: 600,
                    marginBottom: '8px',
                    fontFamily: 'Montserrat, sans-serif',
                    color: '#E65100'
                  }}>
                    Payment Integration Coming Soon
                  </h3>
                  <p style={{ 
                    fontSize: '14px',
                    color: '#666',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    For now, proceed with cash payment at the venue
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setCurrentStep(2)}
                    style={{
                      flex: 1,
                      padding: '16px',
                      backgroundColor: 'white',
                      color: '#E91E63',
                      border: '2px solid #E91E63',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'Montserrat, sans-serif'
                    }}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    style={{
                      flex: 1,
                      padding: '16px',
                      backgroundColor: '#E91E63',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: enrolling ? 'not-allowed' : 'pointer',
                      opacity: enrolling ? 0.7 : 1,
                      fontFamily: 'Montserrat, sans-serif'
                    }}
                  >
                    {enrolling ? 'Enrolling...' : 'Complete Enrollment'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            height: 'fit-content',
            position: 'sticky',
            top: '24px'
          }}>
            <h3 style={{ 
              fontSize: '20px',
              fontWeight: 600,
              marginBottom: '20px',
              fontFamily: 'Syne, sans-serif'
            }}>
              Order Summary
            </h3>

            <div style={{ 
              marginBottom: '20px',
              paddingBottom: '20px',
              borderBottom: '1px solid #eee'
            }}>
              <p style={{ 
                fontSize: '16px',
                fontWeight: 600,
                marginBottom: '8px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Course
              </p>
              <p style={{ 
                fontSize: '14px',
                color: '#666',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                {course.title}
              </p>
            </div>

            {selectedBatch && (
              <div style={{ 
                marginBottom: '20px',
                paddingBottom: '20px',
                borderBottom: '1px solid #eee'
              }}>
                <p style={{ 
                  fontSize: '16px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Batch
                </p>
                <p style={{ 
                  fontSize: '14px',
                  color: '#666',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {new Date(selectedBatch.startDate).toLocaleDateString()} - {new Date(selectedBatch.endDate).toLocaleDateString()}
                </p>
                <p style={{ 
                  fontSize: '14px',
                  color: '#666',
                  marginTop: '4px',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {selectedBatch.location}
                </p>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <span style={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>Price</span>
                <span style={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>${course.price}</span>
              </div>
              {course.discountPrice && (
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '14px', color: '#4CAF50', fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
                    Discount
                  </span>
                  <span style={{ fontSize: '14px', color: '#4CAF50', fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
                    -${course.price - course.discountPrice}
                  </span>
                </div>
              )}
            </div>

            <div style={{ 
              paddingTop: '20px',
              borderTop: '2px solid #eee'
            }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ 
                  fontSize: '18px',
                  fontWeight: 600,
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Total
                </span>
                <span style={{ 
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#E91E63',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  ${finalPrice}
                </span>
              </div>
              {course.discountPrice && (
                <div style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  backgroundColor: '#E8F5E9',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}>
                  <span style={{ 
                    fontSize: '13px',
                    color: '#2E7D32',
                    fontWeight: 600,
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    Save ${course.price - course.discountPrice}
                  </span>
                </div>
              )}
            </div>

            {course.certificateIncluded && (
              <div style={{
                marginTop: '20px',
                padding: '16px',
                backgroundColor: '#F3E5F5',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Award size={24} style={{ color: '#E91E63' }} />
                <div>
                  <p style={{ 
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#E91E63',
                    marginBottom: '4px',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    QR Verified Certificate Included
                  </p>
                  <p style={{ 
                    fontSize: '11px',
                    color: '#666',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    Upon completion of this course
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseEnrollment;
