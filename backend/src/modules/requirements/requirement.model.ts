import mongoose, { Document, Schema, Types } from 'mongoose';
import {
  RequirementPriority,
  RequirementStatus,
  RequirementType,
} from '../../common/types.js';

export interface IAcceptanceCriteria {
  id: string;
  text: string;
  isMet: boolean;
}

export interface IRequirement extends Document {
  requirementId: string;
  title: string;
  description: string;
  businessObjective: string;
  stakeholder: string;
  priority: RequirementPriority;
  type: RequirementType;
  status: RequirementStatus;
  relatedModule: string;
  acceptanceCriteria: IAcceptanceCriteria[];
  createdBy?: Types.ObjectId;
  createdByName?: string;
  updatedBy?: Types.ObjectId;
  updatedByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const acceptanceCriteriaSchema = new Schema<IAcceptanceCriteria>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true },
    isMet: { type: Boolean, default: false },
  },
  { _id: false }
);

const requirementSchema = new Schema<IRequirement>(
  {
    requirementId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    businessObjective: {
      type: String,
      required: true,
      trim: true,
    },
    stakeholder: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      required: true,
    },
    type: {
      type: String,
      enum: ['BUSINESS', 'FUNCTIONAL', 'NON_FUNCTIONAL'],
      default: 'FUNCTIONAL',
      required: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'IMPLEMENTED', 'REJECTED'],
      default: 'DRAFT',
      required: true,
    },
    relatedModule: {
      type: String,
      required: true,
      trim: true,
    },
    acceptanceCriteria: {
      type: [acceptanceCriteriaSchema],
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdByName: {
      type: String,
      trim: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedByName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

requirementSchema.index({ requirementId: 1 });
requirementSchema.index({ status: 1 });
requirementSchema.index({ priority: 1 });
requirementSchema.index({ type: 1 });
requirementSchema.index({ relatedModule: 1 });

export const Requirement = mongoose.model<IRequirement>(
  'Requirement',
  requirementSchema
);
