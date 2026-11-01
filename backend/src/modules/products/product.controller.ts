import { Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service.js';
import { recordAudit } from '../../middleware/auditLogger.js';

export class ProductController {
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await ProductService.getCategories();
      return res.status(200).json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        search: req.query.search as string,
        categoryId: req.query.categoryId as string,
        status: req.query.status as string,
        lowStock: req.query.lowStock === 'true',
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const result = await ProductService.getProducts(filters);
      return res.status(200).json({
        success: true,
        data: result.products,
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

  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      return res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.createProduct(
        req.body,
        req.user?.userId,
        req.user?.fullName
      );

      await recordAudit(req, 'PRODUCT_CREATE', 'Product', product._id.toString(), {
        sku: product.sku,
        name: product.name,
      });

      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.updateProduct(req.params.id, req.body);

      await recordAudit(req, 'PRODUCT_UPDATE', 'Product', product._id.toString(), req.body);

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async setProductStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const product = await ProductService.setProductStatus(req.params.id, status);

      await recordAudit(req, 'PRODUCT_STATUS_CHANGE', 'Product', product._id.toString(), {
        newStatus: status,
      });

      return res.status(200).json({
        success: true,
        message: `Product status changed to ${status}`,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }
}
