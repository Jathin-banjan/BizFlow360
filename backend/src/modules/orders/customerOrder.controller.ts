import { Request, Response, NextFunction } from 'express';
import { CustomerOrderService } from './customerOrder.service.js';
import { recordAudit } from '../../middleware/auditLogger.js';

export class CustomerOrderController {
  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        status: req.query.status as string,
        region: req.query.region as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const result = await CustomerOrderService.getOrders(filters);
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

  static async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await CustomerOrderService.getOrderById(req.params.id);
      return res.status(200).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await CustomerOrderService.createOrder(
        req.body,
        req.user?.userId,
        req.user?.fullName
      );

      await recordAudit(req, 'ORDER_CREATE', 'CustomerOrder', order._id.toString(), {
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
      });

      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const order = await CustomerOrderService.updateOrderStatus(req.params.id, status);

      await recordAudit(req, 'ORDER_STATUS_CHANGE', 'CustomerOrder', order._id.toString(), {
        orderNumber: order.orderNumber,
        newStatus: status,
      });

      return res.status(200).json({
        success: true,
        message: `Order status updated to ${status}`,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
}
