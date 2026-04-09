// Frontend/src/components/common/ReviewForm.tsx
import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import reviewService from '../../services/api/reviewService';
import showToast from './Toast';

interface ReviewFormProps {
  targetType: 'service' | 'course';
  targetId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  targetType,
  targetId,
  onSuccess,
  onCancel,
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      showToast.error('Please select a rating');
      return;
    }

    if (!title.trim()) {
      showToast.error('Please enter a review title');
      return;
    }

    if (!comment.trim()) {
      showToast.error('Please enter your review');
      return;
    }

    try {
      setLoading(true);
      await reviewService.createReview({
        targetType,
        targetId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });

      showToast.success('Review submitted successfully!');
      onSuccess();
    } catch (error: any) {
      showToast.error(error.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: '32px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            fontFamily: 'Montserrat, sans-serif',
            margin: 0
          }}>
            Write a Review
          </h2>
          <button
            onClick={onCancel}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Rating */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '8px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Rating *
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <Star
                    size={32}
                    style={{
                      color: '#fbbf24',
                      fill: (hoveredRating || rating) >= star ? '#fbbf24' : 'transparent'
                    }}
                  />
                </button>
              ))}
            </div>
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
              Review Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              maxLength={100}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                fontFamily: 'Montserrat, sans-serif'
              }}
            />
            <div style={{
              fontSize: '12px',
              color: '#94a3b8',
              marginTop: '4px',
              textAlign: 'right',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              {title.length}/100
            </div>
          </div>

          {/* Comment */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '8px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Your Review *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about your experience..."
              rows={6}
              maxLength={1000}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                fontFamily: 'Montserrat, sans-serif',
                resize: 'vertical'
              }}
            />
            <div style={{
              fontSize: '12px',
              color: '#94a3b8',
              marginTop: '4px',
              textAlign: 'right',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              {comment.length}/1000
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '12px 24px',
                backgroundColor: '#f1f5f9',
                color: '#334155',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: '#5B62B3',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;