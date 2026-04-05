// backend/src/models/Course.model.ts
import mongoose, { Document, Schema } from 'mongoose';

// Lesson interface
export interface ILesson {
  title: string;
  description: string;
  duration: number; // in minutes
  contentType: 'video' | 'pdf' | 'article';
  contentUrl: string | null;
  orderIndex: number;
  isPreview: boolean; // Can be previewed before enrollment
}

// Batch interface
export interface IBatch {
  id: any;
  startDate: Date;
  endDate: Date;
  location: string;
  seatsTotal: number;
  seatsRemaining: number;
  schedule: string; // e.g., "Mon, Wed, Fri - 10 AM to 12 PM"
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

// Main Course interface
export interface ICourse extends Document {
  title: string;
  description: string;
  category: string;
  price: number;
  discountPrice: number | null;
  duration: number; // Total course duration in hours
  level: 'beginner' | 'intermediate' | 'advanced';
  vendorId: mongoose.Types.ObjectId;
  imageUrl: string | null;
  
  // Course content
  whatYouWillLearn: string[];
  requirements: string[];
  courseFormat: {
    theoryHours: number;
    practicalHours: number;
    onlineContent: boolean;
    physicalClasses: boolean;
  };
  
  // Lessons (online content)
  lessons: ILesson[];
  
  // Batches (physical classes)
  batches: IBatch[];
  
  // Instructor info
  instructorName: string;
  instructorBio: string;
  
  // Certificate
  certificateIncluded: boolean;
  certificateTemplate: string | null;
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  
  // Stats
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true }, // minutes
  contentType: { 
    type: String, 
    enum: ['video', 'pdf', 'article'],
    required: true 
  },
  contentUrl: { type: String, default: null },
  orderIndex: { type: Number, required: true },
  isPreview: { type: Boolean, default: false },
});

const batchSchema = new Schema<IBatch>({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: { type: String, required: true },
  seatsTotal: { type: Number, required: true, min: 1 },
  seatsRemaining: { type: Number, required: true },
  schedule: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming' 
  },
});

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title must be less than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [2000, 'Description must be less than 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Hair Styling', 'Makeup', 'Skincare', 'Nails', 'Spa & Wellness', 'Business & Marketing', 'Other'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      default: null,
      min: [0, 'Discount price cannot be negative'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 hour'],
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    whatYouWillLearn: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    courseFormat: {
      theoryHours: { type: Number, default: 0 },
      practicalHours: { type: Number, default: 0 },
      onlineContent: { type: Boolean, default: true },
      physicalClasses: { type: Boolean, default: true },
    },
    lessons: {
      type: [lessonSchema],
      default: [],
    },
    batches: {
      type: [batchSchema],
      default: [],
    },
    instructorName: {
      type: String,
      required: [true, 'Instructor name is required'],
    },
    instructorBio: {
      type: String,
      default: '',
    },
    certificateIncluded: {
      type: Boolean,
      default: true,
    },
    certificateTemplate: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'active', 'inactive'],
      default: 'pending',
      index: true,
    },
    enrollmentCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
courseSchema.index({ vendorId: 1, status: 1 });
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ price: 1 });
courseSchema.index({ 'batches.startDate': 1 });

export default mongoose.model<ICourse>('Course', courseSchema);
