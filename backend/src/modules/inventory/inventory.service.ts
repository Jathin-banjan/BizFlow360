import { Product } from '../products/product.model.js';
import { InventoryMovement, IInventoryMovement } from './inventoryMovement.model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { calculateInventoryValuation } from '../../common/calculations.js';
import { broadcastEvent } from '../../config/socket.js';
import { Types } from 'mongoose';

export class InventoryService {
  static async getSummary(): Promise<{
    totalValuation: number;
    totalItems: number;
    lowStockCount: number;
    outOfStockCount: number;
  }> {
    const products = await Product.find({ status: 'ACTIVE' }).select(
      'currentStock unitCost reorderThreshold'
    );

    const totalValuation = calculateInventoryValuation(products);
    const totalItems = products.reduce((acc, p) => acc + (p.currentStock || 0), 0);
    const lowStockCount = products.filter(
      (p) => p.currentStock > 0 && p.currentStock <= p.reorderThreshold
    ).length;
    const outOfStockCount = products.filter((p) => p.currentStock <= 0).length;

    return {
      totalValuation,
      totalItems,
      lowStockCount,
      outOfStockCount,
    };
  }

  static async getMovements(filters: {
    productId?: string;
    movementType?: string;
    page?: number;
    limit?: number;
  }): Promise<{ movements: any[]; total: number; page: number; totalPages: number }> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (filters.productId && Types.ObjectId.isValid(filters.productId)) {
      query.productId = filters.productId;
    }
    if (filters.movementType) {
      query.movementType = filters.movementType;
    }

    const [movements, total] = await Promise.all([
      InventoryMovement.find(query)
        .populate('productId', 'name sku currentStock')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      InventoryMovement.countDocuments(query),
    ]);

    return {
      movements,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async adjustStock(
    data: {
      productId: string;
      adjustmentQuantity: number; // positive to add, negative to subtract
      reason: string;
      referenceId?: string;
    },
    userId?: string,
    userName?: string
  ): Promise<{ product: any; movement: IInventoryMovement }> {
    if (!Types.ObjectId.isValid(data.productId)) {
      throw new BadRequestError('Invalid product ID');
    }

    if (!data.adjustmentQuantity || data.adjustmentQuantity === 0) {
      throw new BadRequestError('Adjustment quantity cannot be zero');
    }

    if (!data.reason || data.reason.trim().length < 3) {
      throw new BadRequestError('A valid reason for inventory adjustment is required');
    }

    const product = await Product.findById(data.productId);
    if (!product) {
      throw new NotFoundError(`Product '${data.productId}' not found`);
    }

    const previousStock = product.currentStock;
    const newStock = previousStock + data.adjustmentQuantity;

    if (newStock < 0) {
      throw new BadRequestError(
        `Adjustment would result in negative stock. Current: ${previousStock}, Requested Adjustment: ${data.adjustmentQuantity}`
      );
    }

    // Update product stock
    product.currentStock = newStock;
    await product.save();

    // Create immutable audit movement
    const movement = await InventoryMovement.create({
      productId: product._id,
      movementType: 'ADJUSTMENT',
      quantity: Math.abs(data.adjustmentQuantity),
      previousStock,
      newStock,
      reason: data.reason.trim(),
      referenceType: 'MANUAL_ADJUSTMENT',
      referenceId: data.referenceId || 'ADJ-' + Date.now(),
      performedBy: userId ? new Types.ObjectId(userId) : undefined,
      performedByName: userName || 'Admin',
    });

    // Broadcast real-time WebSocket update
    broadcastEvent('stock:updated', {
      productId: product._id,
      sku: product.sku,
      newStock: product.currentStock,
      movementType: 'ADJUSTMENT',
    });
    broadcastEvent('kpi:updated', { type: 'STOCK_ADJUSTMENT' });

    return { product, movement };
  }
}
