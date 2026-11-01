import { Request, Response, NextFunction } from 'express';
import { RequirementService } from './requirement.service.js';
import { recordAudit } from '../../middleware/auditLogger.js';

export class RequirementController {
  static async getRequirements(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        type: req.query.type as any,
        status: req.query.status as any,
        priority: req.query.priority as any,
        module: req.query.module as string,
        search: req.query.search as string,
      };

      const requirements = await RequirementService.getRequirements(filters);
      return res.status(200).json({ success: true, data: requirements });
    } catch (error) {
      next(error);
    }
  }

  static async getRequirementById(req: Request, res: Response, next: NextFunction) {
    try {
      const requirement = await RequirementService.getRequirementById(req.params.id);
      return res.status(200).json({ success: true, data: requirement });
    } catch (error) {
      next(error);
    }
  }

  static async createRequirement(req: Request, res: Response, next: NextFunction) {
    try {
      const requirement = await RequirementService.createRequirement(
        req.body,
        req.user?.userId,
        req.user?.fullName
      );

      await recordAudit(req, 'REQUIREMENT_CREATE', 'Requirement', requirement._id.toString(), {
        requirementId: requirement.requirementId,
        title: requirement.title,
      });

      return res.status(201).json({
        success: true,
        message: 'Requirement created successfully',
        data: requirement,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateRequirement(req: Request, res: Response, next: NextFunction) {
    try {
      const requirement = await RequirementService.updateRequirement(
        req.params.id,
        req.body,
        req.user?.userId,
        req.user?.fullName
      );

      await recordAudit(req, 'REQUIREMENT_UPDATE', 'Requirement', requirement._id.toString(), {
        requirementId: requirement.requirementId,
      });

      return res.status(200).json({
        success: true,
        message: 'Requirement updated successfully',
        data: requirement,
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleCriteria(req: Request, res: Response, next: NextFunction) {
    try {
      const requirement = await RequirementService.toggleCriteria(
        req.params.id,
        req.params.criteriaId,
        req.user?.userId,
        req.user?.fullName
      );

      return res.status(200).json({
        success: true,
        message: 'Acceptance criteria toggled successfully',
        data: requirement,
      });
    } catch (error) {
      next(error);
    }
  }
}
