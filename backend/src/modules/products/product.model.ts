import mongoose, { Document, Schema, Types } from 'mongoose';
import { ProductStatus } from '../../common/types.js';

export interface IProduct extends Document {
  sku: string;
  name: string;
  categoryId: Types.ObjectId;
  description?: string;
  unitCost: number;
  unitPrice: number;
  currentStock: number;
  reorderThreshold: number;
  leadTimeDays: number;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    sku: {
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
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    unitCost: {
      type: Number,
      required: true,
      min: [0, 'Unit cost cannot be negative'],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative'],
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Current stock cannot be negative'],
    },
    reorderThreshold: {
      type: Number,
      required: true,
      default: 10,
      min: [0, 'Reorder threshold cannot be negative'],
    },
    leadTimeDays: {
      type: Number,
      default: 7,
      min: [1, 'Lead time must be at least 1 day'],
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ sku: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ currentStock: 1, reorderThreshold: 1 });
productSchema.index({ status: 1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);
