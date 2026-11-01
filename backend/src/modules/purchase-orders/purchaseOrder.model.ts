import mongoose, { Document, Schema, Types } from 'mongoose';
import { PurchaseOrderStatus } from '../../common/types.js';

export interface IPurchaseOrderItem {
  productId: Types.ObjectId;
  sku: string;
  productName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitCost: number;
  totalCost: number;
}

export interface IPurchaseOrder extends Document {
  poNumber: string;
  supplierId: Types.ObjectId;
  status: PurchaseOrderStatus;
  orderDate: Date;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  items: IPurchaseOrderItem[];
  totalAmount: number;
  notes?: string;
  createdBy?: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  receivedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const purchaseOrderItemSchema = new Schema<IPurchaseOrderItem>(
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
    orderedQuantity: {
      type: Number,
      required: true,
      min: [1, 'Ordered quantity must be at least 1'],
    },
    receivedQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Received quantity cannot be negative'],
    },
    unitCost: {
      type: Number,
      required: true,
      min: [0, 'Unit cost cannot be negative'],
    },
    totalCost: {
      type: Number,
      required: true,
      min: [0, 'Total cost cannot be negative'],
    },
  },
  { _id: true }
);

const purchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    poNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'SUBMITTED',
        'APPROVED',
        'PARTIALLY_RECEIVED',
        'RECEIVED',
        'CANCELLED',
      ],
      default: 'DRAFT',
      required: true,
      index: true,
    },
    orderDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expectedDeliveryDate: {
      type: Date,
      required: true,
    },
    actualDeliveryDate: {
      type: Date,
    },
    items: {
      type: [purchaseOrderItemSchema],
      required: true,
      validate: [(val: any[]) => val.length > 0, 'PO must contain at least one line item'],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    receivedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

purchaseOrderSchema.index({ orderDate: -1 });
purchaseOrderSchema.index({ status: 1, expectedDeliveryDate: 1 });

export const PurchaseOrder = mongoose.model<IPurchaseOrder>(
  'PurchaseOrder',
  purchaseOrderSchema
);
