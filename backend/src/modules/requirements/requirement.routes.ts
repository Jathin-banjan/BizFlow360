import { Router } from 'express';
import { RequirementController } from './requirement.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const createReqSchema = z.object({
  body: z.object({
    requirementId: z.string().min(3).max(20),
    title: z.string().min(3).max(150),
    description: z.string().min(5),
    businessObjective: z.string().min(5),
    stakeholder: z.string().min(2),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    type: z.enum(['BUSINESS', 'FUNCTIONAL', 'NON_FUNCTIONAL']),
    status: z
      .enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'IMPLEMENTED', 'REJECTED'])
      .optional(),
    relatedModule: z.string().min(2),
    acceptanceCriteria: z
      .array(
        z.object({
          id: z.string(),
          text: z.string(),
          isMet: z.boolean().optional(),
        })
      )
      .default([]),
  }),
});

const updateReqSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(150).optional(),
    description: z.string().min(5).optional(),
    businessObjective: z.string().min(5).optional(),
    stakeholder: z.string().min(2).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    type: z.enum(['BUSINESS', 'FUNCTIONAL', 'NON_FUNCTIONAL']).optional(),
    status: z
      .enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'IMPLEMENTED', 'REJECTED'])
      .optional(),
    relatedModule: z.string().min(2).optional(),
    acceptanceCriteria: z
      .array(
        z.object({
          id: z.string(),
          text: z.string(),
          isMet: z.boolean(),
        })
      )
      .optional(),
  }),
});

router.get('/', requireAuth, RequirementController.getRequirements);
router.get('/:id', requireAuth, RequirementController.getRequirementById);

router.post(
  '/',
  requireAuth,
  requireRole('ADMIN', 'MANAGER', 'ANALYST'),
  validate(createReqSchema),
  RequirementController.createRequirement
);

router.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN', 'MANAGER', 'ANALYST'),
  validate(updateReqSchema),
  RequirementController.updateRequirement
);

router.patch(
  '/:id/criteria/:criteriaId/toggle',
  requireAuth,
  requireRole('ADMIN', 'MANAGER', 'ANALYST'),
  RequirementController.toggleCriteria
);

export default router;
