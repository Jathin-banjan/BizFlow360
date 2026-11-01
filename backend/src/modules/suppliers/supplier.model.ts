import mongoose, { Document, Schema } from 'mongoose';
import { SupplierStatus } from '../../common/types.js';

export interface ISupplier extends Document {
  code: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  leadTimeDays: number;
  rating: number;
  status: SupplierStatus;
  totalOrdersPlaced: number;
  onTimeDeliveryRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      default: 'United States',
      trim: true,
    },
    leadTimeDays: {
      type: Number,
      default: 7,
      min: [1, 'Lead time must be at least 1 day'],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    totalOrdersPlaced: {
      type: Number,
      default: 0,
      min: 0,
    },
    onTimeDeliveryRate: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

supplierSchema.index({ code: 1 });
supplierSchema.index({ status: 1 });

export const Supplier = mongoose.model<ISupplier>('Supplier', supplierSchema);
