import mongoose, { Schema, Document } from 'mongoose';

export interface IDispute extends Document {
  bookingId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  reason: string;
  description: string;
  evidenceUrls: string[];
  vendorResponseDescription: string;
  vendorEvidenceUrls: string[];
  vendorRespondedAt: Date;
  status: 'pending' | 'under_review' | 'vendor_responded' | 'resolved_refund' | 'resolved_release' | 'resolved_partial';
  refundAmount: number;
  resolution: string;
  resolvedBy: mongoose.Types.ObjectId;
  resolvedAt: Date;
  timeline: {
    event: string;
    timestamp: Date;
    actor: string;
  }[];
  payoutFrozen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DisputeSchema = new Schema<IDispute>({
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true, enum: ['overpricing', 'wrong_service', 'no_show', 'poor_quality', 'other'] },
  description: { type: String, required: true, minlength: 20 },
  evidenceUrls: [{ type: String }],
  vendorResponseDescription: { type: String },
  vendorEvidenceUrls: [{ type: String }],
  vendorRespondedAt: { type: Date },
  status: { type: String, default: 'pending', enum: ['pending', 'under_review', 'vendor_responded', 'resolved_refund', 'resolved_release', 'resolved_partial'] },
  refundAmount: { type: Number, default: 0 },
  resolution: { type: String },
  resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
  timeline: [{
    event: { type: String },
    timestamp: { type: Date, default: Date.now },
    actor: { type: String },
  }],
  payoutFrozen: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IDispute>('Dispute', DisputeSchema);
