import { Router } from 'express';
import { PurchaseOrderController } from './purchaseOrder.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const createPOSchema = z.object({
  body: z.object({
    supplierId: z.string().min(10),
    expectedDeliveryDate: z.string().min(8),
    notes: z.string().optional(),
    items: z
      .array(
        z.object({
          productId: z.string().min(10),
          orderedQuantity: z.number().int().min(1),
          unitCost: z.number().min(0).optional(),
        })
      )
      .min(1),
  }),
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['SUBMITTED', 'APPROVED', 'CANCELLED']),
  }),
});

const receiveStockSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          productId: z.string().min(10),
          receivedQuantity: z.number().int().min(1),
        })
      )
      .min(1),
  }),
});

router.get('/', requireAuth, PurchaseOrderController.getPurchaseOrders);
router.get('/:id', requireAuth, PurchaseOrderController.getPurchaseOrderById);

router.post(
  '/',
  requireAuth,
  requireRole('ADMIN', 'MANAGER'),
  validate(createPOSchema),
  PurchaseOrderController.createPurchaseOrder
);

router.patch(
  '/:id/status',
  requireAuth,
  requireRole('ADMIN', 'MANAGER'),
  validate(updateStatusSchema),
  PurchaseOrderController.updateStatus
);

router.post(
  '/:id/receive',
  requireAuth,
  requireRole('ADMIN', 'MANAGER'),
  validate(receiveStockSchema),
  PurchaseOrderController.receiveStock
);

export default router;
