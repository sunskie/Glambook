import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
  // Core
  clientId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  vendorId?: mongoose.Types.ObjectId;
  status: 'active' | 'completed' | 'dropped' | 'cancelled' | 'enrolled';

  // Progress tracking (new)
  progress: number;
  completedLessons: mongoose.Types.ObjectId[];
  lastAccessedAt?: Date;
  lastLessonId?: mongoose.Types.ObjectId;
  nextLesson?: string;
  timeSpentMinutes: number;
  enrolledAt: Date;

  // Old progress fields
  lessonsProgress?: any[];
  totalLessons?: number;
  completionDate?: Date;

  // Quiz (new)
  quizScore?: number;
  quizAttempts: number;
  quizPassed: boolean;

  // Certificate (new)
  certificateIssued: boolean;
  certificateId?: string;
  certificateIssuedAt?: Date;

  // Old fields
  practicalAttendance?: any[];
  selectedBatchId?: mongoose.Types.ObjectId;
  paymentStatus?: string;
  paymentDate?: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>({
  // Core
  clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped', 'cancelled', 'enrolled'],
    default: 'active',
  },

  // Progress tracking (new)
  progress: { type: Number, default: 0, min: 0, max: 100 },
  completedLessons: [{ type: Schema.Types.ObjectId }],
  lastAccessedAt: { type: Date, default: Date.now },
  lastLessonId: { type: Schema.Types.ObjectId },
  nextLesson: { type: String },
  timeSpentMinutes: { type: Number, default: 0 },
  enrolledAt: { type: Date, default: Date.now },

  // Old progress fields
  lessonsProgress: [{ type: Schema.Types.Mixed }],
  totalLessons: { type: Number, default: 0 },
  completionDate: { type: Date },

  // Quiz (new)
  quizScore: { type: Number },
  quizAttempts: { type: Number, default: 0 },
  quizPassed: { type: Boolean, default: false },

  // Certificate (new)
  certificateIssued: { type: Boolean, default: false },
  certificateId: { type: String },
  certificateIssuedAt: { type: Date },

  // Old fields
  practicalAttendance: [{ type: Schema.Types.Mixed }],
  selectedBatchId: { type: Schema.Types.ObjectId },
  paymentStatus: { type: String },
  paymentDate: { type: Date },
}, { timestamps: true });

export default mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);