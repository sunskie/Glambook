// Frontend/src/components/common/ReviewsList.tsx
import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageCircle } from 'lucide-react';
import reviewService, { Review, ReviewsResponse } from '../../services/api/reviewService';
import showToast from './Toast';

interface ReviewsListProps {
  targetType: 'service' | 'course';
  targetId: string;
  onWriteReview?: () => void;
}

const ReviewsList: React.FC<ReviewsListProps> = ({
  targetType,
  targetId,
  onWriteReview,
}) => {
  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('-createdAt');

  useEffect(() => {
    fetchReviews();
  }, [targetType, targetId, sortBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getReviewsByTarget(targetType, targetId, 1, sortBy);
      setReviewsData(data);
    } catch (error: any) {
      showToast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      await reviewService.markReviewHelpful(reviewId);
      fetchReviews(); // Refresh reviews
    } catch (error) {
      showToast.error('Failed to mark review as helpful');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div style={{
        padding: '48px',
        textAlign: 'center',
        fontFamily: 'Montserrat, sans-serif'
      }}>
        Loading reviews...
      </div>
    );
  }

  if (!reviewsData) {
    return null;
  }

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Summary Section */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px'
        }}>
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              marginBottom: '8px'
            }}>
              Customer Reviews
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={24}
                    style={{
                      color: '#fbbf24',
                      fill: star <= Math.round(reviewsData.averageRating) ? '#fbbf24' : 'transparent'
                    }}
                  />
                ))}
              </div>
              <span style={{
                fontSize: '18px',
                fontWeight: 600
              }}>
                {reviewsData.averageRating.toFixed(1)} out of 5
              </span>
              <span style={{
                fontSize: '14px',
                color: '#64748b'
              }}>
                ({reviewsData.totalReviews} {reviewsData.totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>

          {onWriteReview && (
            <button
              onClick={onWriteReview}
              style={{
                padding: '12px 24px',
                backgroundColor: '#5B62B3',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Rating Distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[5, 4, 3, 2, 1].map((rating) => {
            const dist = reviewsData.ratingDistribution.find((d) => d._id === rating);
            const count = dist?.count || 0;
            const percentage = reviewsData.totalReviews > 0
              ? (count / reviewsData.totalReviews) * 100
              : 0;

            return (
              <div
                key={rating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <span style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  minWidth: '60px'
                }}>
                  {rating} stars
                </span>
                <div style={{
                  flex: 1,
                  height: '8px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: '#fbbf24',
                    borderRadius: '4px'
                  }} />
                </div>
                <span style={{
                  fontSize: '14px',
                  color: '#64748b',
                  minWidth: '40px',
                  textAlign: 'right'
                }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sort Options */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 600
        }}>
          {reviewsData.data.length} {reviewsData.data.length === 1 ? 'Review' : 'Reviews'}
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="-createdAt">Most Recent</option>
          <option value="createdAt">Oldest First</option>
          <option value="-rating">Highest Rated</option>
          <option value="rating">Lowest Rated</option>
          <option value="-helpful">Most Helpful</option>
        </select>
      </div>

      {/* Reviews List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {reviewsData.data.map((review) => (
          <div
            key={review._id}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* Review Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: 600
                  }}>
                    {review.userId.name}
                  </span>
                  {review.verified && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#10b981',
                      backgroundColor: '#d1fae5',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}>
                      Verified
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      style={{
                        color: '#fbbf24',
                        fill: star <= review.rating ? '#fbbf24' : 'transparent'
                      }}
                    />
                  ))}
                </div>
              </div>
              <span style={{
                fontSize: '12px',
                color: '#94a3b8'
              }}>
                {formatDate(review.createdAt)}
              </span>
            </div>

            {/* Review Content */}
            <h4 style={{
              fontSize: '16px',
              fontWeight: 600,
              marginBottom: '8px'
            }}>
              {review.title}
            </h4>
            <p style={{
              fontSize: '14px',
              color: '#475569',
              lineHeight: '1.6',
              marginBottom: '16px'
            }}>
              {review.comment}
            </p>

            {/* Vendor Response */}
            {review.response && (
              <div style={{
                backgroundColor: '#f8fafc',
                borderLeft: '3px solid #5B62B3',
                padding: '16px',
                marginBottom: '16px',
                borderRadius: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <MessageCircle size={16} style={{ color: '#5B62B3' }} />
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#5B62B3'
                  }}>
                    Response from {review.response.vendorId.name}
                  </span>
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#475569',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  {review.response.comment}
                </p>
              </div>
            )}

            {/* Review Actions */}
            <button
              onClick={() => handleHelpful(review._id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#64748b',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              <ThumbsUp size={16} />
              Helpful ({review.helpful})
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {reviewsData.data.length === 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center'
        }}>
          <Star size={48} style={{ color: '#e2e8f0', margin: '0 auto 16px' }} />
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            marginBottom: '16px'
          }}>
            No reviews yet. Be the first to review!
          </p>
          {onWriteReview && (
            <button
              onClick={onWriteReview}
              style={{
                padding: '12px 24px',
                backgroundColor: '#5B62B3',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Write a Review
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewsList;