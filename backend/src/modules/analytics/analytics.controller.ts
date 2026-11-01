import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service.js';
import { recordAudit } from '../../middleware/auditLogger.js';

export class AnalyticsController {
  static async getInsights(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        category: req.query.category as string,
        severity: req.query.severity as string,
        status: req.query.status as string,
      };

      const insights = await AnalyticsService.getInsights(filters);
      return res.status(200).json({ success: true, data: insights });
    } catch (error) {
      next(error);
    }
  }

  static async refreshInsights(req: Request, res: Response, next: NextFunction) {
    try {
      const insights = await AnalyticsService.runRulesEngine();
      return res.status(200).json({
        success: true,
        message: 'Business rules engine executed successfully',
        data: insights,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const insight = await AnalyticsService.updateStatus(
        req.params.id,
        status,
        req.user?.userId,
        req.user?.fullName
      );

      await recordAudit(req, 'INSIGHT_STATUS_CHANGE', 'BusinessInsight', insight._id.toString(), {
        title: insight.title,
        newStatus: status,
      });

      return res.status(200).json({
        success: true,
        message: `Insight marked as ${status}`,
        data: insight,
      });
    } catch (error) {
      next(error);
    }
  }
}
