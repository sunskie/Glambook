// backend/src/models/Certificate.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ICertificate extends Document {
  certificateId: string; // e.g. GLAM-2026-482931
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  enrollmentId: mongoose.Types.ObjectId;
  studentName: string;
  courseName: string;
  issuedDate: Date;
  score: number;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const certificateSchema = new Schema<ICertificate>(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    enrollmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    issuedDate: {
      type: Date,
      default: Date.now,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    verified: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICertificate>('Certificate', certificateSchema);
