// Frontend/src/services/api/reviewService.ts
import api from '../../utils/api';

export interface CreateReviewData {
  targetType: 'service' | 'course';
  targetId: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
}

export interface Review {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  targetType: 'service' | 'course';
  targetId: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  helpful: number;
  verified: boolean;
  response?: {
    vendorId: {
      _id: string;
      name: string;
    };
    comment: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  data: Review[];
  page: number;
  totalPages: number;
  total: number;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Array<{
    _id: number;
    count: number;
  }>;
}

const createReview = async (data: CreateReviewData) => {
  const response: any = await api.post('/reviews', data);
  return response;
};

const getReviewsByTarget = async (
  targetType: 'service' | 'course',
  targetId: string,
  page: number = 1,
  sort: string = '-createdAt'
) => {
  const response: any = await api.get(`/reviews/${targetType}/${targetId}`, {
    params: { page, sort },
  });
  return response as ReviewsResponse;
};

const getUserReviews = async (page: number = 1) => {
  const response: any = await api.get('/reviews/my-reviews', {
    params: { page },
  });
  return response;
};

const updateReview = async (id: string, data: Partial<CreateReviewData>) => {
  const response: any = await api.put(`/reviews/${id}`, data);
  return response;
};

const deleteReview = async (id: string) => {
  const response: any = await api.delete(`/reviews/${id}`);
  return response;
};

const respondToReview = async (id: string, comment: string) => {
  const response: any = await api.post(`/reviews/${id}/respond`, { comment });
  return response;
};

const markReviewHelpful = async (id: string) => {
  const response: any = await api.patch(`/reviews/${id}/helpful`);
  return response;
};

export default {
  createReview,
  getReviewsByTarget,
  getUserReviews,
  updateReview,
  deleteReview,
  respondToReview,
  markReviewHelpful,
};