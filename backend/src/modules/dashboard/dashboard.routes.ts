import { Router } from 'express';
import { DashboardController } from './dashboard.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/metrics', requireAuth, DashboardController.getMetrics);
router.get('/trends', requireAuth, DashboardController.getTrends);
router.get('/breakdowns', requireAuth, DashboardController.getBreakdowns);
router.get('/top-products', requireAuth, DashboardController.getTopProducts);
router.get('/recent-orders', requireAuth, DashboardController.getRecentOrders);

export default router;
