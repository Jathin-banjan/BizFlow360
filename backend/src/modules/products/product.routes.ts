import { Router } from 'express';
import { ProductController } from './product.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const createProductSchema = z.object({
  body: z.object({
    sku: z.string().min(2).max(30),
    name: z.string().min(2).max(100),
    categoryId: z.string().min(10),
    description: z.string().optional(),
    unitCost: z.number().min(0),
    unitPrice: z.number().min(0),
    currentStock: z.number().min(0).optional(),
    reorderThreshold: z.number().min(0).optional(),
    leadTimeDays: z.number().min(1).optional(),
  }),
});

const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    categoryId: z.string().min(10).optional(),
    description: z.string().optional(),
    unitCost: z.number().min(0).optional(),
    unitPrice: z.number().min(0).optional(),
    reorderThreshold: z.number().min(0).optional(),
    leadTimeDays: z.number().min(1).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
});

router.get('/categories', requireAuth, ProductController.getCategories);
router.get('/', requireAuth, ProductController.getProducts);
router.get('/:id', requireAuth, ProductController.getProductById);

router.post(
  '/',
  requireAuth,
  requireRole('ADMIN', 'MANAGER'),
  validate(createProductSchema),
  ProductController.createProduct
);

router.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN', 'MANAGER'),
  validate(updateProductSchema),
  ProductController.updateProduct
);

router.patch(
  '/:id/status',
  requireAuth,
  requireRole('ADMIN'),
  ProductController.setProductStatus
);

export default router;
