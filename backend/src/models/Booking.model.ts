// backend/src/models/Booking.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  serviceId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  bookingDate: Date;
  bookingTime: string;
  duration: number;
  totalPrice: number;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalAmount: number;
  advanceAmount: number;
  remainingAmount: number;
  advancePaid: boolean;
  remainingPaid: boolean;
  paymentStatus: 'unpaid' | 'advance_paid' | 'partial' | 'completed' | 'refunded';
  paymentMethod: 'esewa' | 'cash' | 'other';
  esewaTransactionId?: string;
  esewaRefId?: string;
  termsAccepted: boolean;
  termsAcceptedAt?: Date;
  isNonRefundable: boolean;
  loyaltyDiscountApplied: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    bookingTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientPhone: {
      type: String,
      required: true,
      trim: true,
    },
    clientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    specialRequests: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    advanceAmount: {
      type: Number,
      required: true,
    },
    remainingAmount: {
      type: Number,
      required: true,
    },
    advancePaid: {
      type: Boolean,
      default: false,
    },
    remainingPaid: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'advance_paid', 'partial', 'completed', 'refunded'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['esewa', 'cash', 'other'],
      default: 'esewa',
    },
    esewaTransactionId: {
      type: String,
    },
    esewaRefId: {
      type: String,
    },
    termsAccepted: {
      type: Boolean,
      default: false,
    },
    termsAcceptedAt: {
      type: Date,
    },
    isNonRefundable: {
      type: Boolean,
      default: false,
    },
    loyaltyDiscountApplied: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

BookingSchema.index({ clientId: 1, createdAt: -1 });
BookingSchema.index({ vendorId: 1, status: 1 });
BookingSchema.index({ bookingDate: 1 });

export default mongoose.model<IBooking>('Booking', BookingSchema);