// backend/src/models/User.model.ts
import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "client" | "vendor" | "admin";
  phone?: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true 
    },
    password: { 
      type: String, 
      required: true 
    },
    role: {
      type: String,
      enum: ["client", "vendor", "admin"],
      default: "client",
    },
    phone: {
      type: String,
      trim: true
    },
    isApproved: {
      type: Boolean,
      default: function(this: IUser) {
        // Auto-approve clients and admins, vendors need manual approval
        return this.role !== 'vendor';
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isApproved: 1 });

export default mongoose.model<IUser>("User", userSchema);