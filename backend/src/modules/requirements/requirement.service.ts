import { Requirement, IRequirement } from './requirement.model.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors.js';
import {
  RequirementPriority,
  RequirementStatus,
  RequirementType,
} from '../../common/types.js';
import { Types } from 'mongoose';

export class RequirementService {
  static async getRequirements(filters: {
    type?: RequirementType;
    status?: RequirementStatus;
    priority?: RequirementPriority;
    module?: string;
    search?: string;
  }): Promise<IRequirement[]> {
    const query: any = {};

    if (filters.type) query.type = filters.type;
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.module) query.relatedModule = filters.module;

    if (filters.search) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { requirementId: searchRegex },
        { title: searchRegex },
        { description: searchRegex },
        { businessObjective: searchRegex },
        { stakeholder: searchRegex },
      ];
    }

    return Requirement.find(query).sort({ requirementId: 1 });
  }

  static async getRequirementById(id: string): Promise<IRequirement> {
    let reqDoc: IRequirement | null = null;

    if (Types.ObjectId.isValid(id)) {
      reqDoc = await Requirement.findById(id);
    } else {
      reqDoc = await Requirement.findOne({ requirementId: id.toUpperCase().trim() });
    }

    if (!reqDoc) {
      throw new NotFoundError(`Requirement '${id}' not found`);
    }

    return reqDoc;
  }

  static async createRequirement(
    data: {
      requirementId: string;
      title: string;
      description: string;
      businessObjective: string;
      stakeholder: string;
      priority: RequirementPriority;
      type: RequirementType;
      status?: RequirementStatus;
      relatedModule: string;
      acceptanceCriteria: Array<{ id: string; text: string; isMet?: boolean }>;
    },
    userId?: string,
    userName?: string
  ): Promise<IRequirement> {
    const cleanId = data.requirementId.toUpperCase().trim();

    const existing = await Requirement.findOne({ requirementId: cleanId });
    if (existing) {
      throw new ConflictError(`Requirement with ID '${cleanId}' already exists`);
    }

    const requirement = await Requirement.create({
      ...data,
      requirementId: cleanId,
      status: data.status || 'DRAFT',
      createdBy: userId ? new Types.ObjectId(userId) : undefined,
      createdByName: userName || 'Product Analyst',
      updatedBy: userId ? new Types.ObjectId(userId) : undefined,
      updatedByName: userName || 'Product Analyst',
    });

    return requirement;
  }

  static async updateRequirement(
    id: string,
    updates: Partial<{
      title: string;
      description: string;
      businessObjective: string;
      stakeholder: string;
      priority: RequirementPriority;
      type: RequirementType;
      status: RequirementStatus;
      relatedModule: string;
      acceptanceCriteria: Array<{ id: string; text: string; isMet: boolean }>;
    }>,
    userId?: string,
    userName?: string
  ): Promise<IRequirement> {
    let requirement = await Requirement.findById(id);
    if (!requirement) {
      requirement = await Requirement.findOne({ requirementId: id.toUpperCase().trim() });
    }

    if (!requirement) {
      throw new NotFoundError(`Requirement '${id}' not found`);
    }

    Object.assign(requirement, updates);
    requirement.updatedBy = userId ? new Types.ObjectId(userId) : undefined;
    requirement.updatedByName = userName || 'Functional Analyst';

    await requirement.save();
    return requirement;
  }

  static async toggleCriteria(
    reqId: string,
    criteriaId: string,
    userId?: string,
    userName?: string
  ): Promise<IRequirement> {
    const requirement = await this.getRequirementById(reqId);
    const criteria = requirement.acceptanceCriteria.find((c) => c.id === criteriaId);

    if (!criteria) {
      throw new NotFoundError(`Acceptance criteria '${criteriaId}' not found on requirement`);
    }

    criteria.isMet = !criteria.isMet;
    requirement.updatedBy = userId ? new Types.ObjectId(userId) : undefined;
    requirement.updatedByName = userName;

    await requirement.save();
    return requirement;
  }
}
