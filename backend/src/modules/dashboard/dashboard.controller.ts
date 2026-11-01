import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service.js';

export class DashboardController {
  static async getMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const metrics = await DashboardService.getMetrics(
        startDate as string,
        endDate as string
      );
      return res.status(200).json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  }

  static async getTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const months = req.query.months ? parseInt(req.query.months as string, 10) : 6;
      const trends = await DashboardService.getMonthlyTrends(months);
      return res.status(200).json({ success: true, data: trends });
    } catch (error) {
      next(error);
    }
  }

  static async getBreakdowns(req: Request, res: Response, next: NextFunction) {
    try {
      const breakdowns = await DashboardService.getBreakdowns();
      return res.status(200).json({ success: true, data: breakdowns });
    } catch (error) {
      next(error);
    }
  }

  static async getTopProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await DashboardService.getTopAndBottomProducts();
      return res.status(200).json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  static async getRecentOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
      const orders = await DashboardService.getRecentOrders(limit);
      return res.status(200).json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }
}
