import { Request, Response, NextFunction } from 'express';
import { InventoryService } from './inventory.service.js';
import { recordAudit } from '../../middleware/auditLogger.js';

export class InventoryController {
  static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await InventoryService.getSummary();
      return res.status(200).json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }

  static async getMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        productId: req.query.productId as string,
        movementType: req.query.movementType as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      };

      const result = await InventoryService.getMovements(filters);
      return res.status(200).json({
        success: true,
        data: result.movements,
        meta: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async adjustStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { product, movement } = await InventoryService.adjustStock(
        req.body,
        req.user?.userId,
        req.user?.fullName
      );

      await recordAudit(req, 'INVENTORY_ADJUST', 'Product', product._id.toString(), {
        adjustment: req.body.adjustmentQuantity,
        previousStock: movement.previousStock,
        newStock: movement.newStock,
        reason: req.body.reason,
      });

      return res.status(200).json({
        success: true,
        message: 'Stock adjusted successfully',
        data: { product, movement },
      });
    } catch (error) {
      next(error);
    }
  }
}
