import mongoose, { Document, Schema, Types } from 'mongoose';
import {
  InsightCategory,
  InsightSeverity,
  InsightStatus,
} from '../../common/types.js';

export interface IBusinessInsight extends Document {
  insightKey: string;
  title: string;
  category: InsightCategory;
  severity: InsightSeverity;
  evidence: string;
  relevantMetric: string;
  metricValue: number;
  period: string;
  explanation: string;
  recommendedAction: string;
  status: InsightStatus;
  acknowledgedBy?: Types.ObjectId;
  acknowledgedByName?: string;
  resolvedBy?: Types.ObjectId;
  resolvedByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const businessInsightSchema = new Schema<IBusinessInsight>(
  {
    insightKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['INVENTORY', 'SALES', 'SUPPLIERS', 'MARGIN'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['CRITICAL', 'WARNING', 'INFO'],
      required: true,
    },
    evidence: {
      type: String,
      required: true,
      trim: true,
    },
    relevantMetric: {
      type: String,
      required: true,
      trim: true,
    },
    metricValue: {
      type: Number,
      required: true,
    },
    period: {
      type: String,
      required: true,
      trim: true,
    },
    explanation: {
      type: String,
      required: true,
      trim: true,
    },
    recommendedAction: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'],
      default: 'ACTIVE',
      required: true,
    },
    acknowledgedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    acknowledgedByName: {
      type: String,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedByName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

businessInsightSchema.index({ status: 1, severity: 1 });
businessInsightSchema.index({ category: 1 });

export const BusinessInsight = mongoose.model<IBusinessInsight>(
  'BusinessInsight',
  businessInsightSchema
);
