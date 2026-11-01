import { Router } from 'express';
import { InventoryController } from './inventory.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const adjustSchema = z.object({
  body: z.object({
    productId: z.string().min(10),
    adjustmentQuantity: z.number().int().refine((val) => val !== 0, {
      message: 'Adjustment quantity cannot be 0',
    }),
    reason: z.string().min(3),
    referenceId: z.string().optional(),
  }),
});

router.get('/summary', requireAuth, InventoryController.getSummary);
router.get('/movements', requireAuth, InventoryController.getMovements);
router.post(
  '/adjust',
  requireAuth,
  requireRole('ADMIN', 'MANAGER'),
  validate(adjustSchema),
  InventoryController.adjustStock
);

export default router;
