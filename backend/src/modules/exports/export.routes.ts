import { Router, Request, Response, NextFunction } from 'express';
import { ExportService } from './export.service.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

const router = Router();

router.get(
  '/sales',
  requireAuth,
  requireRole('ADMIN', 'MANAGER', 'ANALYST'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const csv = await ExportService.exportSalesCsv({
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        region: req.query.region as string,
        status: req.query.status as string,
      });

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=bizflow360_sales_${new Date().toISOString().split('T')[0]}.csv`
      );
      return res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/inventory',
  requireAuth,
  requireRole('ADMIN', 'MANAGER', 'ANALYST'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const csv = await ExportService.exportInventoryCsv();

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=bizflow360_inventory_${new Date().toISOString().split('T')[0]}.csv`
      );
      return res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
