import mongoose, { Schema, Document } from 'mongoose';
export interface IVendorAvailability extends Document {
  vendorId: mongoose.Types.ObjectId;
  workingDays: number[]; // 0=Sun, 1=Mon ... 6=Sat
  workingHours: { start: string; end: string }; // "09:00", "18:00"
  slotDuration: number; // minutes, default 60
  blockedDates: Date[];
  updatedAt: Date;
}
const VendorAvailabilitySchema = new Schema<IVendorAvailability>({
  vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  workingDays: { type: [Number], default: [1, 2, 3, 4, 5] },
  workingHours: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '18:00' },
  },
  slotDuration: { type: Number, default: 60 },
  blockedDates: [{ type: Date }],
}, { timestamps: true });
export default mongoose.model<IVendorAvailability>('VendorAvailability', VendorAvailabilitySchema);
