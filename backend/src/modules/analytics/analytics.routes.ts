import { Router } from 'express';
import { AnalyticsController } from './analytics.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACKNOWLEDGED', 'RESOLVED']),
  }),
});

router.get('/insights', requireAuth, AnalyticsController.getInsights);
router.post(
  '/insights/refresh',
  requireAuth,
  requireRole('ADMIN', 'MANAGER'),
  AnalyticsController.refreshInsights
);
router.patch(
  '/insights/:id/status',
  requireAuth,
  requireRole('ADMIN', 'MANAGER'),
  validate(updateStatusSchema),
  AnalyticsController.updateStatus
);

export default router;
