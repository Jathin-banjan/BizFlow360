import mongoose, { Document, Schema, Types } from 'mongoose';
import { MovementType } from '../../common/types.js';

export interface IInventoryMovement extends Document {
  productId: Types.ObjectId;
  movementType: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceType?: string;
  referenceId?: string;
  reason?: string;
  performedBy?: Types.ObjectId;
  performedByName?: string;
  createdAt: Date;
}

const inventoryMovementSchema = new Schema<IInventoryMovement>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    movementType: {
      type: String,
      enum: ['RECEIPT', 'SALE', 'ADJUSTMENT', 'RETURN'],
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    referenceType: {
      type: String,
      trim: true,
    },
    referenceId: {
      type: String,
      trim: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    performedByName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

inventoryMovementSchema.index({ createdAt: -1 });

export const InventoryMovement = mongoose.model<IInventoryMovement>(
  'InventoryMovement',
  inventoryMovementSchema
);
