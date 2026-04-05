// backend/src/controllers/review.controller.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review.model';
import Service from '../models/service.model';
import Course from '../models/Course.model';
import Booking from '../models/Booking.model';
import Enrollment from '../models/Enrollment.model';

const getAuthenticatedUserId = (req: Request): string | null => {
  return req.user?.id ?? null;
};

// Create a review
export const createReview = async (req: Request, res: Response) => {
  try {
    const { targetType, targetId, rating, title, comment, images } = req.body;
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Validate target exists
    if (targetType === 'service') {
      const service = await Service.findById(targetId);
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
    } else if (targetType === 'course') {
      const course = await Course.findById(targetId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
    }

    // Check if user has already reviewed
    const existingReview = await Review.findOne({ userId, targetType, targetId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this item' });
    }

    // Check if user has completed/booked the service or enrolled in the course
    let verified = false;
    if (targetType === 'service') {
      const booking = await Booking.findOne({
        clientId: userId,
        serviceId: targetId,
        status: 'completed',
      });
      verified = !!booking;
    } else if (targetType === 'course') {
      const enrollment = await Enrollment.findOne({
        studentId: userId,
        courseId: targetId,
      });
      verified = !!enrollment;
    }

    // Create review
    const review = await Review.create({
      userId,
      targetType,
      targetId,
      rating,
      title,
      comment,
      images: images || [],
      verified,
    });

    // Update average rating
    await updateAverageRating(targetType, targetId);

    const populatedReview = await Review.findById(review._id).populate('userId', 'name');

    res.status(201).json({
      message: 'Review created successfully',
      data: populatedReview,
    });
  } catch (error: any) {
    console.error('Create review error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this item' });
    }
    res.status(500).json({ message: 'Failed to create review', error: error.message });
  }
};

// Get reviews for a target (service or course)
export const getReviewsByTarget = async (req: Request, res: Response) => {
  try {
    const { targetType, targetId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = req.query.sort as string || '-createdAt'; // -createdAt, rating, -rating

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ targetType, targetId })
      .populate('userId', 'name')
      .populate('response.vendorId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ targetType, targetId });

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { targetType, targetId: targetId as any } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    // Calculate average rating
    const avgRating = await Review.aggregate([
      { $match: { targetType, targetId: targetId as any } },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' },
          total: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      data: reviews,
      page,
      totalPages: Math.ceil(total / limit),
      total,
      averageRating: avgRating[0]?.average || 0,
      totalReviews: avgRating[0]?.total || 0,
      ratingDistribution,
    });
  } catch (error: any) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
};

// Get user's reviews
export const getUserReviews = async (req: Request, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ userId })
      .populate('targetId')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ userId });

    res.status(200).json({
      data: reviews,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error: any) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
};

// Update review
export const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, title, comment, images } = req.body;
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only update your own reviews' });
    }

    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.comment = comment || review.comment;
    review.images = images || review.images;

    await review.save();

    // Update average rating
    await updateAverageRating(review.targetType, review.targetId);

    const updatedReview = await Review.findById(review._id).populate('userId', 'name');

    res.status(200).json({
      message: 'Review updated successfully',
      data: updatedReview,
    });
  } catch (error: any) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Failed to update review', error: error.message });
  }
};

// Delete review
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    const { targetType, targetId } = review;

    await Review.findByIdAndDelete(id);

    // Update average rating
    await updateAverageRating(targetType, targetId);

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error: any) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Failed to delete review', error: error.message });
  }
};

// Vendor response to review
export const respondToReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const vendorId = getAuthenticatedUserId(req);

    if (!vendorId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const review = await Review.findById(id).populate('targetId');
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if vendor owns the service/course
    let isOwner = false;
    if (review.targetType === 'service') {
      const service = await Service.findById(review.targetId);
      isOwner = service?.vendorId.toString() === vendorId;
    } else if (review.targetType === 'course') {
      const course = await Course.findById(review.targetId);
      isOwner = course?.vendorId.toString() === vendorId;
    }

    if (!isOwner) {
      return res.status(403).json({ message: 'You can only respond to reviews on your own items' });
    }

    review.response = {
      vendorId: new mongoose.Types.ObjectId(vendorId),
      comment,
      createdAt: new Date(),
    };

    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate('userId', 'name')
      .populate('response.vendorId', 'name');

    res.status(200).json({
      message: 'Response added successfully',
      data: updatedReview,
    });
  } catch (error: any) {
    console.error('Respond to review error:', error);
    res.status(500).json({ message: 'Failed to respond to review', error: error.message });
  }
};

// Mark review as helpful
export const markReviewHelpful = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
      id,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json({
      message: 'Review marked as helpful',
      data: review,
    });
  } catch (error: any) {
    console.error('Mark helpful error:', error);
    res.status(500).json({ message: 'Failed to mark review as helpful', error: error.message });
  }
};

// Helper function to update average rating
const updateAverageRating = async (targetType: string, targetId: any) => {
  try {
    const result = await Review.aggregate([
      { $match: { targetType, targetId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const averageRating = result[0]?.averageRating || 0;
    const totalReviews = result[0]?.totalReviews || 0;

    if (targetType === 'service') {
      await Service.findByIdAndUpdate(targetId, {
        rating: averageRating,
        reviewCount: totalReviews,
      });
    } else if (targetType === 'course') {
      await Course.findByIdAndUpdate(targetId, {
        rating: averageRating,
        reviewCount: totalReviews,
      });
    }
  } catch (error) {
    console.error('Update average rating error:', error);
  }
};
