import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAuditEvent extends Document {
  action: string;
  entityType: string;
  entityId?: string;
  performedBy?: Types.ObjectId;
  performedByName: string;
  performedByRole: string;
  details?: Record<string, any>;
  ipAddress?: string;
  timestamp: Date;
}

const auditEventSchema = new Schema<IAuditEvent>(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    entityType: {
      type: String,
      required: true,
      trim: true,
    },
    entityId: {
      type: String,
      trim: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    performedByName: {
      type: String,
      required: true,
      trim: true,
    },
    performedByRole: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: false,
  }
);

auditEventSchema.index({ timestamp: -1 });
auditEventSchema.index({ entityType: 1, action: 1 });

export const AuditEvent = mongoose.model<IAuditEvent>(
  'AuditEvent',
  auditEventSchema
);
