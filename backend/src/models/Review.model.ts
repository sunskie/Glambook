// backend/src/models/Review.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  targetType: 'service' | 'course';
  targetId: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  helpful: number;
  verified: boolean;
  response?: {
    vendorId: mongoose.Types.ObjectId;
    comment: string;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['service', 'course'],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    images: [{
      type: String,
    }],
    helpful: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    response: {
      vendorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      comment: {
        type: String,
        maxlength: 500,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
ReviewSchema.index({ targetType: 1, targetId: 1 });
ReviewSchema.index({ userId: 1 });

// Prevent duplicate reviews
ReviewSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', ReviewSchema);