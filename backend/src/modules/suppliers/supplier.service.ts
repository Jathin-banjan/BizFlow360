import { Supplier, ISupplier } from './supplier.model.js';
import { PurchaseOrder } from '../purchase-orders/purchaseOrder.model.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors.js';
import { calculateOnTimeDeliveryRate } from '../../common/calculations.js';
import { Types } from 'mongoose';

export class SupplierService {
  static async getSuppliers(filters: {
    search?: string;
    status?: string;
  }): Promise<ISupplier[]> {
    const query: any = {};

    if (filters.search) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { code: searchRegex },
        { contactPerson: searchRegex },
        { email: searchRegex },
      ];
    }

    if (filters.status) {
      query.status = filters.status;
    }

    return Supplier.find(query).sort({ name: 1 });
  }

  static async getSupplierById(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid supplier ID');
    }

    const supplier = await Supplier.findById(id).lean();
    if (!supplier) {
      throw new NotFoundError(`Supplier with ID '${id}' not found`);
    }

    // Retrieve real purchase order history
    const purchaseOrders = await PurchaseOrder.find({ supplierId: supplier._id })
      .sort({ orderDate: -1 })
      .limit(15)
      .lean();

    // Recalculate true on-time delivery rate from recorded received orders
    const completedOrders = purchaseOrders.filter((po) => po.status === 'RECEIVED');
    const onTimeOrders = completedOrders.filter(
      (po) =>
        po.actualDeliveryDate &&
        new Date(po.actualDeliveryDate).getTime() <= new Date(po.expectedDeliveryDate).getTime()
    );

    const calculatedOnTimeRate =
      completedOrders.length > 0
        ? calculateOnTimeDeliveryRate(onTimeOrders.length, completedOrders.length)
        : supplier.onTimeDeliveryRate;

    return {
      ...supplier,
      calculatedOnTimeDeliveryRate: calculatedOnTimeRate,
      purchaseOrders,
    };
  }

  static async createSupplier(data: {
    code: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    country?: string;
    leadTimeDays?: number;
    rating?: number;
  }): Promise<ISupplier> {
    const cleanCode = data.code.toUpperCase().trim();

    const existing = await Supplier.findOne({ code: cleanCode });
    if (existing) {
      throw new ConflictError(`Supplier with code '${cleanCode}' already exists`);
    }

    const supplier = await Supplier.create({
      ...data,
      code: cleanCode,
      email: data.email.toLowerCase().trim(),
      status: 'ACTIVE',
      totalOrdersPlaced: 0,
      onTimeDeliveryRate: 100,
    });

    return supplier;
  }

  static async updateSupplier(
    id: string,
    updates: Partial<{
      name: string;
      contactPerson: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      country: string;
      leadTimeDays: number;
      rating: number;
      status: 'ACTIVE' | 'INACTIVE';
    }>
  ): Promise<ISupplier> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid supplier ID');
    }

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      throw new NotFoundError(`Supplier with ID '${id}' not found`);
    }

    Object.assign(supplier, updates);
    await supplier.save();
    return supplier;
  }
}
