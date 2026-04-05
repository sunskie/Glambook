// backend/src/models/Enrollment.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ILessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt: Date | null;
  timeSpent: number; // in seconds
}

export interface IEnrollment extends Document {
  courseId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  
  // Batch selection
  selectedBatchId: string | null;
  batchStartDate: Date | null;
  batchEndDate: Date | null;
  batchLocation: string | null;
  
  // Enrollment details
  enrollmentDate: Date;
  status: 'enrolled' | 'completed' | 'cancelled' | 'refunded';
  
  // Progress tracking
  progress: number; // 0-100
  lessonsProgress: ILessonProgress[];
  completedLessons: number;
  totalLessons: number;
  
  // Practical attendance
  practicalAttendance: {
    date: Date;
    attended: boolean;
    notes: string;
  }[];
  
  // Payment
  totalPrice: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate: Date | null;
  
  // Certificate
  certificateIssued: boolean;
  certificateUrl: string | null;
  certificateIssuedDate: Date | null;
  
  // Dates
  startDate: Date;
  completionDate: Date | null;
  
  // Client info
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const lessonProgressSchema = new Schema({
  lessonId: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  timeSpent: { type: Number, default: 0 },
});

const attendanceSchema = new Schema({
  date: { type: Date, required: true },
  attended: { type: Boolean, required: true },
  notes: { type: String, default: '' },
});

const enrollmentSchema = new Schema<IEnrollment>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    selectedBatchId: {
      type: String,
      default: null,
    },
    batchStartDate: {
      type: Date,
      default: null,
    },
    batchEndDate: {
      type: Date,
      default: null,
    },
    batchLocation: {
      type: String,
      default: null,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['enrolled', 'completed', 'cancelled', 'refunded'],
      default: 'enrolled',
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lessonsProgress: {
      type: [lessonProgressSchema],
      default: [],
    },
    completedLessons: {
      type: Number,
      default: 0,
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    practicalAttendance: {
      type: [attendanceSchema],
      default: [],
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    certificateUrl: {
      type: String,
      default: null,
    },
    certificateIssuedDate: {
      type: Date,
      default: null,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    completionDate: {
      type: Date,
      default: null,
    },
    clientName: {
      type: String,
      required: true,
    },
    clientEmail: {
      type: String,
      required: true,
    },
    clientPhone: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Compound indexes
enrollmentSchema.index({ clientId: 1, status: 1 });
enrollmentSchema.index({ vendorId: 1, status: 1 });
enrollmentSchema.index({ courseId: 1, clientId: 1 });

export default mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);