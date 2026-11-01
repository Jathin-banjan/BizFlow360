import { Router } from 'express';
import { SupplierController } from './supplier.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const createSupplierSchema = z.object({
  body: z.object({
    code: z.string().min(2).max(20),
    name: z.string().min(2).max(100),
    contactPerson: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(5),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    leadTimeDays: z.number().min(1).optional(),
    rating: z.number().min(1).max(5).optional(),
  }),
});

const updateSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    contactPerson: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(5).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    leadTimeDays: z.number().min(1).optional(),
    rating: z.number().min(1).max(5).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
});

router.get('/', requireAuth, SupplierController.getSuppliers);
router.get('/:id', requireAuth, SupplierController.getSupplierById);

router.post(
  '/',
  requireAuth,
  requireRole('ADMIN', 'MANAGER'),
  validate(createSupplierSchema),
  SupplierController.createSupplier
);

router.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN', 'MANAGER'),
  validate(updateSupplierSchema),
  SupplierController.updateSupplier
);

export default router;
