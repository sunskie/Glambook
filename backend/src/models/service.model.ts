import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  title: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  status: 'active' | 'inactive';
  vendorId: mongoose.Types.ObjectId;
  imageUrl: string | null;  // ADD THIS
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a service title'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      validate: {
        validator: function(value: number) {
          return /^\d+(\.\d{1,2})?$/.test(value.toString());
        },
        message: 'Price can have maximum 2 decimal places'
      }
    },
    duration: {
      type: Number,
      required: [true, 'Please provide service duration'],
      min: [10, 'Duration must be at least 10 minute'],
      validate: {
        validator: function(value: number) {
          return Number.isInteger(value);
        },
        message: 'Duration must be a whole number (in minutes)'
      }
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: {
        values: ['Hair', 'Makeup', 'Spa', 'Nails', 'Skincare', 'Massage', 'Other'],
        message: '{VALUE} is not a valid category'
      },
      trim: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Vendor ID is required']
    },
    // IMAGE URL FIELD
    imageUrl: {
      type: String,
      default: null,
    }
  },
  {
    timestamps: true
  }
);

ServiceSchema.index({ vendorId: 1 });
ServiceSchema.index({ category: 1 });
ServiceSchema.index({ status: 1 });
ServiceSchema.index({ vendorId: 1, status: 1 });

const Service = mongoose.model<IService>('Service', ServiceSchema);

export default Service;