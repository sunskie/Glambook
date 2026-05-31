import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
  // Core
  clientId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  vendorId?: mongoose.Types.ObjectId;
  status: 'pending_payment' | 'active' | 'completed' | 'dropped' | 'cancelled' | 'enrolled';

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
  quizStatus?: 'not_started' | 'pending_approval' | 'approved' | 'rejected' | 'failed';
  quizScore?: number;
  quizAttempts: number;
  quizPassed: boolean;
  quizSubmittedAt?: Date;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;

  // Certificate (new)
  certificateIssued: boolean;
  certificateId?: string;
  certificateIssuedAt?: Date;
  onlineCertificateIssuedAt?: Date;
  finalCertificateIssuedAt?: Date;

  // Online phase
  onlineCompleted: boolean;
  // quizPassed already exists above

  // Physical phase
  totalClasses: number;
  attendedClasses: number;
  attendancePercentage: number;
  practicalPassed: boolean;

  // Certificate eligibility
  certificateEligible: boolean;

  // Attendance log
  attendanceLog: Array<{
    date: Date;
    status: 'present' | 'absent';
    markedBy?: mongoose.Types.ObjectId;
  }>;

  // Old fields
  practicalAttendance?: any[];
  selectedBatchId?: mongoose.Types.ObjectId;
  paymentDate?: Date;

  // Payment details
  totalPrice?: number;
  totalAmount: number;
  advanceAmount: number;
  remainingAmount: number;
  advancePaid: boolean;
  remainingPaid: boolean;
  paymentStatus: 'unpaid' | 'advance_paid' | 'partial' | 'completed';
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  paymentMethod?: string;
  transactionId?: string;
  esewaTransactionId?: string;
  esewaRefId?: string;
  termsAccepted: boolean;
  termsAcceptedAt?: Date;
  isNonRefundable: boolean;

  // Batch details
  batchStartDate?: Date;
  batchEndDate?: Date;
  batchLocation?: string;
}

const EnrollmentSchema = new Schema<IEnrollment>({
  // Core
  clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['pending_payment', 'active', 'completed', 'dropped', 'cancelled', 'enrolled'],
    default: 'enrolled',
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
  quizStatus: {
    type: String,
    enum: ['not_started', 'pending_approval', 'approved', 'rejected', 'failed'],
    default: 'not_started',
  },
  quizScore: { type: Number, default: null },
  quizAttempts: { type: Number, default: 0 },
  quizPassed: { type: Boolean, default: false },
  quizSubmittedAt: { type: Date, default: null },
  approvedAt: { type: Date, default: null },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },

  // Certificate (new)
  certificateIssued: { type: Boolean, default: false },
  certificateId: { type: String },
  certificateIssuedAt: { type: Date },
  onlineCertificateIssuedAt: { type: Date },
  finalCertificateIssuedAt: { type: Date },

  // Online phase
  onlineCompleted: { type: Boolean, default: false },

  // Physical phase
  totalClasses: { type: Number, default: 0 },
  attendedClasses: { type: Number, default: 0 },
  attendancePercentage: { type: Number, default: 0 },
  practicalPassed: { type: Boolean, default: false },

  // Certificate eligibility
  certificateEligible: { type: Boolean, default: false },

  // Attendance log
  attendanceLog: [{
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent'], required: true },
    markedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  }],

  // Old fields
  practicalAttendance: [{ type: Schema.Types.Mixed }],
  selectedBatchId: { type: Schema.Types.ObjectId },
  paymentDate: { type: Date },

  // Payment details
  totalPrice: { type: Number },
  totalAmount: { type: Number },
  advanceAmount: { type: Number },
  remainingAmount: { type: Number },
  advancePaid: { type: Boolean, default: false },
  remainingPaid: { type: Boolean, default: false },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'pending', 'advance_paid', 'partial', 'completed', 'free'],
    default: 'unpaid',
  },
  clientName: { type: String },
  clientPhone: { type: String },
  clientEmail: { type: String },
  paymentMethod: {
    type: String,
    enum: ['esewa', 'cash', 'mock', 'free', 'other'],
    default: 'esewa',
  },
  transactionId: { type: String },
  esewaTransactionId: { type: String },
  esewaRefId: { type: String },
  termsAccepted: { type: Boolean, default: false },
  termsAcceptedAt: { type: Date },
  isNonRefundable: { type: Boolean, default: false },

  // Batch details
  batchStartDate: { type: Date },
  batchEndDate: { type: Date },
  batchLocation: { type: String },
}, { timestamps: true });

export default mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);