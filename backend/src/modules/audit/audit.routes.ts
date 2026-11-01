import { Router, Request, Response, NextFunction } from 'express';
import { AuditEvent } from './auditEvent.model.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

const router = Router();

router.get(
  '/logs',
  requireAuth,
  requireRole('ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, req.query.page ? parseInt(req.query.page as string, 10) : 1);
      const limit = Math.max(1, Math.min(100, req.query.limit ? parseInt(req.query.limit as string, 10) : 30));
      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        AuditEvent.find()
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        AuditEvent.countDocuments(),
      ]);

      return res.status(200).json({
        success: true,
        data: logs,
        meta: {
          total,
          page,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
