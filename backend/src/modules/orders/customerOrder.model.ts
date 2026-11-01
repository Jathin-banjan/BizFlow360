import mongoose, { Document, Schema, Types } from 'mongoose';
import { CustomerOrderStatus } from '../../common/types.js';

export interface IOrderItem {
  productId: Types.ObjectId;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  totalPrice: number;
  grossProfit: number;
}

export interface ICustomerOrder extends Document {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  region: 'North' | 'South' | 'East' | 'West' | 'Central';
  orderDate: Date;
  status: CustomerOrderStatus;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  grossProfit: number;
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  fulfilledDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative'],
    },
    unitCost: {
      type: Number,
      required: true,
      min: [0, 'Unit cost cannot be negative'],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative'],
    },
    grossProfit: {
      type: Number,
      required: true,
    },
  },
  { _id: true }
);

const customerOrderSchema = new Schema<ICustomerOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    region: {
      type: String,
      enum: ['North', 'South', 'East', 'West', 'Central'],
      required: true,
    },
    orderDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'PLACED',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
      ],
      default: 'PLACED',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(val: any[]) => val.length > 0, 'Order must contain at least one item'],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    grossProfit: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'PENDING', 'REFUNDED'],
      default: 'PAID',
    },
    fulfilledDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

customerOrderSchema.index({ orderDate: -1 });
customerOrderSchema.index({ region: 1 });
customerOrderSchema.index({ status: 1 });

export const CustomerOrder = mongoose.model<ICustomerOrder>(
  'CustomerOrder',
  customerOrderSchema
);
