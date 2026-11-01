import { Router } from 'express';
import { CustomerOrderController } from './customerOrder.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const createOrderSchema = z.object({
  body: z.object({
    customerName: z.string().min(2),
    customerEmail: z.string().email(),
    region: z.enum(['North', 'South', 'East', 'West', 'Central']),
    discount: z.number().min(0).optional(),
    items: z
      .array(
        z.object({
          productId: z.string().min(10),
          quantity: z.number().int().min(1),
        })
      )
      .min(1),
  }),
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      'PLACED',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
    ]),
  }),
});

router.get('/', requireAuth, CustomerOrderController.getOrders);
router.get('/:id', requireAuth, CustomerOrderController.getOrderById);

router.post(
  '/',
  requireAuth,
  requireRole('ADMIN', 'MANAGER'),
  validate(createOrderSchema),
  CustomerOrderController.createOrder
);

router.patch(
  '/:id/status',
  requireAuth,
  requireRole('ADMIN', 'MANAGER'),
  validate(updateStatusSchema),
  CustomerOrderController.updateOrderStatus
);

export default router;
