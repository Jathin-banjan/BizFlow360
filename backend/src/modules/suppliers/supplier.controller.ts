import { Request, Response, NextFunction } from 'express';
import { SupplierService } from './supplier.service.js';
import { recordAudit } from '../../middleware/auditLogger.js';

export class SupplierController {
  static async getSuppliers(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        search: req.query.search as string,
        status: req.query.status as string,
      };

      const suppliers = await SupplierService.getSuppliers(filters);
      return res.status(200).json({ success: true, data: suppliers });
    } catch (error) {
      next(error);
    }
  }

  static async getSupplierById(req: Request, res: Response, next: NextFunction) {
    try {
      const supplier = await SupplierService.getSupplierById(req.params.id);
      return res.status(200).json({ success: true, data: supplier });
    } catch (error) {
      next(error);
    }
  }

  static async createSupplier(req: Request, res: Response, next: NextFunction) {
    try {
      const supplier = await SupplierService.createSupplier(req.body);

      await recordAudit(req, 'SUPPLIER_CREATE', 'Supplier', supplier._id.toString(), {
        code: supplier.code,
        name: supplier.name,
      });

      return res.status(201).json({
        success: true,
        message: 'Supplier created successfully',
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateSupplier(req: Request, res: Response, next: NextFunction) {
    try {
      const supplier = await SupplierService.updateSupplier(req.params.id, req.body);

      await recordAudit(req, 'SUPPLIER_UPDATE', 'Supplier', supplier._id.toString(), req.body);

      return res.status(200).json({
        success: true,
        message: 'Supplier updated successfully',
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  }
}
