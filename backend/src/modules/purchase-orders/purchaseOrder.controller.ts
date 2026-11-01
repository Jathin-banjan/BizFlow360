import { Request, Response, NextFunction } from 'express';
import { PurchaseOrderService } from './purchaseOrder.service.js';
import { recordAudit } from '../../middleware/auditLogger.js';

export class PurchaseOrderController {
  static async getPurchaseOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        status: req.query.status as string,
        supplierId: req.query.supplierId as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      };

      const result = await PurchaseOrderService.getPurchaseOrders(filters);
      return res.status(200).json({
        success: true,
        data: result.orders,
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

  static async getPurchaseOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const po = await PurchaseOrderService.getPurchaseOrderById(req.params.id);
      return res.status(200).json({ success: true, data: po });
    } catch (error) {
      next(error);
    }
  }

  static async createPurchaseOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const po = await PurchaseOrderService.createPurchaseOrder(
        req.body,
        req.user?.userId
      );

      await recordAudit(req, 'PO_CREATE', 'PurchaseOrder', po._id.toString(), {
        poNumber: po.poNumber,
        totalAmount: po.totalAmount,
      });

      return res.status(201).json({
        success: true,
        message: 'Purchase order created successfully',
        data: po,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const po = await PurchaseOrderService.updateStatus(
        req.params.id,
        status,
        req.user?.userId
      );

      await recordAudit(req, 'PO_STATUS_CHANGE', 'PurchaseOrder', po._id.toString(), {
        poNumber: po.poNumber,
        newStatus: status,
      });

      return res.status(200).json({
        success: true,
        message: `Purchase order status updated to ${status}`,
        data: po,
      });
    } catch (error) {
      next(error);
    }
  }

  static async receiveStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { items } = req.body;
      const po = await PurchaseOrderService.receiveStock(
        req.params.id,
        items,
        req.user?.userId,
        req.user?.fullName
      );

      await recordAudit(req, 'PO_STOCK_RECEIPT', 'PurchaseOrder', po._id.toString(), {
        poNumber: po.poNumber,
        newStatus: po.status,
        receivedItems: items,
      });

      return res.status(200).json({
        success: true,
        message: 'Stock received and inventory updated successfully',
        data: po,
      });
    } catch (error) {
      next(error);
    }
  }
}
