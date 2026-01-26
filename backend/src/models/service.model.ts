// This file defines what a SERVICE looks like in our database
// Think of it as a blueprint or template

import mongoose, { Document, Schema } from 'mongoose';

// ============================================
// STEP 1: Define the TypeScript Interface
// ============================================
// This tells TypeScript what properties a Service MUST have
// It's like a contract: "Every service needs these things!"

export interface IService extends Document {
  title: string;              // e.g., "Haircut"
  description: string;        // e.g., "Professional haircut with styling"
  price: number;              // e.g., 50 (in dollars/rupees)
  duration: number;           // e.g., 60 (in minutes)
  category: string;           // e.g., "Hair", "Makeup", "Spa"
  status: 'active' | 'inactive';  // Can only be one of these two
  vendorId: mongoose.Types.ObjectId;  // Who owns this service?
  createdAt: Date;           // When was it created?
  updatedAt: Date;           // When was it last updated?
}

// ============================================
// STEP 2: Create the Mongoose Schema
// ============================================
// This tells MongoDB how to store the data
// It's like building the actual database table structure

const ServiceSchema = new Schema<IService>(
  {
    // ──────────────────────────────────────
    // TITLE: The name of the service
    // ──────────────────────────────────────
    title: {
      type: String,           // Must be text
      required: [true, 'Please provide a service title'],  // Cannot be empty
      trim: true,             // Remove extra spaces (e.g., "  Haircut  " → "Haircut")
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },

    // ──────────────────────────────────────
    // DESCRIPTION: Details about the service
    // ──────────────────────────────────────
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },

    // ──────────────────────────────────────
    // PRICE: How much does it cost?
    // ──────────────────────────────────────
    price: {
      type: Number,           // Must be a number
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative'],  // Can't charge negative money!
      validate: {
        validator: function(value: number) {
          // Custom check: Price must have max 2 decimal places
          // e.g., 50.99 ✅  |  50.999 ❌
          return /^\d+(\.\d{1,2})?$/.test(value.toString());
        },
        message: 'Price can have maximum 2 decimal places'
      }
    },

    // ──────────────────────────────────────
    // DURATION: How long does it take? (in minutes)
    // ──────────────────────────────────────
    duration: {
      type: Number,
      required: [true, 'Please provide service duration'],
      min: [1, 'Duration must be at least 1 minute'],
      validate: {
        validator: function(value: number) {
          // Duration must be a whole number (no decimals)
          return Number.isInteger(value);
        },
        message: 'Duration must be a whole number (in minutes)'
      }
    },

    // ──────────────────────────────────────
    // CATEGORY: What type of service?
    // ──────────────────────────────────────
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: {
        values: ['Hair', 'Makeup', 'Spa', 'Nails', 'Skincare', 'Massage', 'Other'],
        message: '{VALUE} is not a valid category'  // {VALUE} is replaced by what user sent
      },
      trim: true
    },

    // ──────────────────────────────────────
    // STATUS: Is this service available?
    // ──────────────────────────────────────
    status: {
      type: String,
      enum: ['active', 'inactive'],  // Only these two options allowed
      default: 'active'               // If not specified, set to 'active'
    },

    // ──────────────────────────────────────
    // VENDOR ID: Who created this service?
    // ──────────────────────────────────────
    vendorId: {
      type: Schema.Types.ObjectId,   // Reference to User collection
      ref: 'User',                    // Links to the User model
      required: [true, 'Vendor ID is required']
    }
  },
  {
    // ──────────────────────────────────────
    // TIMESTAMPS: Auto-create createdAt & updatedAt
    // ──────────────────────────────────────
    timestamps: true  // MongoDB automatically adds these fields
  }
);

// ============================================
// STEP 3: Add Indexes for Performance
// ============================================
// Indexes make searching faster (like a book index)
// When we search by vendorId often, this speeds it up!

ServiceSchema.index({ vendorId: 1 });        // Speed up searches by vendor
ServiceSchema.index({ category: 1 });        // Speed up searches by category
ServiceSchema.index({ status: 1 });          // Speed up searches by status
ServiceSchema.index({ vendorId: 1, status: 1 });  // Combo search optimization

// ============================================
// STEP 4: Create and Export the Model
// ============================================
// This creates the actual "Service" table in MongoDB

const Service = mongoose.model<IService>('Service', ServiceSchema);

export default Service;