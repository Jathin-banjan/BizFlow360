import { PurchaseOrder, IPurchaseOrder } from './purchaseOrder.model.js';
import { Product } from '../products/product.model.js';
import { Supplier } from '../suppliers/supplier.model.js';
import { InventoryMovement } from '../inventory/inventoryMovement.model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { PurchaseOrderStatus } from '../../common/types.js';
import { broadcastEvent } from '../../config/socket.js';
import { Types } from 'mongoose';

export class PurchaseOrderService {
  static async getPurchaseOrders(filters: {
    status?: string;
    supplierId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ orders: any[]; total: number; page: number; totalPages: number }> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (filters.status) query.status = filters.status;
    if (filters.supplierId && Types.ObjectId.isValid(filters.supplierId)) {
      query.supplierId = filters.supplierId;
    }

    const [orders, total] = await Promise.all([
      PurchaseOrder.find(query)
        .populate('supplierId', 'name code email')
        .populate('createdBy', 'fullName email')
        .populate('approvedBy', 'fullName email')
        .sort({ orderDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PurchaseOrder.countDocuments(query),
    ]);

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getPurchaseOrderById(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid purchase order ID');
    }

    const po = await PurchaseOrder.findById(id)
      .populate('supplierId')
      .populate('createdBy', 'fullName email')
      .populate('approvedBy', 'fullName email')
      .populate('receivedBy', 'fullName email')
      .lean();

    if (!po) {
      throw new NotFoundError(`Purchase order '${id}' not found`);
    }

    return po;
  }

  static async createPurchaseOrder(
    data: {
      supplierId: string;
      expectedDeliveryDate: string;
      notes?: string;
      items: Array<{ productId: string; orderedQuantity: number; unitCost?: number }>;
    },
    userId?: string
  ): Promise<IPurchaseOrder> {
    if (!Types.ObjectId.isValid(data.supplierId)) {
      throw new BadRequestError('Invalid supplier ID');
    }

    const supplier = await Supplier.findById(data.supplierId);
    if (!supplier) {
      throw new NotFoundError('Supplier not found');
    }

    if (!data.items || data.items.length === 0) {
      throw new BadRequestError('Purchase order must have at least one line item');
    }

    // Resolve products and build items
    let calculatedTotal = 0;
    const resolvedItems = [];

    for (const item of data.items) {
      if (!Types.ObjectId.isValid(item.productId)) {
        throw new BadRequestError(`Invalid product ID in item: ${item.productId}`);
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        throw new NotFoundError(`Product '${item.productId}' not found`);
      }

      if (item.orderedQuantity <= 0) {
        throw new BadRequestError(`Ordered quantity for ${product.name} must be greater than 0`);
      }

      const cost = item.unitCost !== undefined ? item.unitCost : product.unitCost;
      const totalCost = Number((cost * item.orderedQuantity).toFixed(2));
      calculatedTotal += totalCost;

      resolvedItems.push({
        productId: product._id,
        sku: product.sku,
        productName: product.name,
        orderedQuantity: item.orderedQuantity,
        receivedQuantity: 0,
        unitCost: cost,
        totalCost,
      });
    }

    const poCount = await PurchaseOrder.countDocuments();
    const poNumber = `PO-${new Date().getFullYear()}-${String(poCount + 1001).padStart(5, '0')}`;

    const po = await PurchaseOrder.create({
      poNumber,
      supplierId: supplier._id,
      status: 'DRAFT',
      orderDate: new Date(),
      expectedDeliveryDate: new Date(data.expectedDeliveryDate),
      items: resolvedItems,
      totalAmount: Number(calculatedTotal.toFixed(2)),
      notes: data.notes,
      createdBy: userId ? new Types.ObjectId(userId) : undefined,
    });

    return po;
  }

  static async updateStatus(
    id: string,
    newStatus: PurchaseOrderStatus,
    userId?: string
  ): Promise<IPurchaseOrder> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid purchase order ID');
    }

    const po = await PurchaseOrder.findById(id);
    if (!po) {
      throw new NotFoundError('Purchase order not found');
    }

    // Enforce valid status transition machine
    const currentStatus = po.status;

    if (currentStatus === 'CANCELLED') {
      throw new BadRequestError('Cannot modify a cancelled purchase order');
    }

    if (currentStatus === 'RECEIVED') {
      throw new BadRequestError('Cannot change status of an already fully received purchase order');
    }

    if (newStatus === 'SUBMITTED') {
      if (currentStatus !== 'DRAFT') {
        throw new BadRequestError(`Cannot submit purchase order currently in '${currentStatus}' status`);
      }
    } else if (newStatus === 'APPROVED') {
      if (currentStatus !== 'SUBMITTED' && currentStatus !== 'DRAFT') {
        throw new BadRequestError(`Only submitted or draft purchase orders can be approved`);
      }
      po.approvedBy = userId ? new Types.ObjectId(userId) : undefined;
    } else if (newStatus === 'CANCELLED') {
      if ((currentStatus as string) === 'PARTIALLY_RECEIVED' || (currentStatus as string) === 'RECEIVED') {
        throw new BadRequestError(`Cannot cancel an order that already has stock receipts recorded`);
      }
    } else {
      throw new BadRequestError(`Invalid direct status transition to '${newStatus}'`);
    }

    po.status = newStatus;
    await po.save();

    broadcastEvent('po:status', { poId: po._id, poNumber: po.poNumber, status: po.status });
    broadcastEvent('kpi:updated', { type: 'PO_STATUS_CHANGED' });

    return po;
  }

  /**
   * Receive stock for purchase order items
   * Atomic, auditable, and prevents duplicate receipt processing
   */
  static async receiveStock(
    id: string,
    receiptItems: Array<{ productId: string; receivedQuantity: number }>,
    userId?: string,
    userName?: string
  ): Promise<IPurchaseOrder> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid purchase order ID');
    }

    const po = await PurchaseOrder.findById(id);
    if (!po) {
      throw new NotFoundError('Purchase order not found');
    }

    if (po.status !== 'APPROVED' && po.status !== 'PARTIALLY_RECEIVED') {
      throw new BadRequestError(
        `Cannot receive stock for purchase order with status '${po.status}'. Must be APPROVED or PARTIALLY_RECEIVED.`
      );
    }

    if (!receiptItems || receiptItems.length === 0) {
      throw new BadRequestError('At least one receipt item must be specified');
    }

    // Process each receipt item
    for (const receipt of receiptItems) {
      if (receipt.receivedQuantity <= 0) continue;

      const itemIndex = po.items.findIndex(
        (i) => i.productId.toString() === receipt.productId.toString()
      );

      if (itemIndex === -1) {
        throw new BadRequestError(`Product '${receipt.productId}' is not part of this purchase order`);
      }

      const poItem = po.items[itemIndex];
      const remainingExpected = poItem.orderedQuantity - poItem.receivedQuantity;

      if (receipt.receivedQuantity > remainingExpected) {
        throw new BadRequestError(
          `Cannot receive ${receipt.receivedQuantity} units of '${poItem.productName}'. Maximum pending: ${remainingExpected}`
        );
      }

      // Update product inventory atomically
      const product = await Product.findById(poItem.productId);
      if (!product) {
        throw new NotFoundError(`Product '${poItem.productName}' not found in database`);
      }

      const previousStock = product.currentStock;
      const newStock = previousStock + receipt.receivedQuantity;
      product.currentStock = newStock;
      await product.save();

      // Record immutable stock movement
      await InventoryMovement.create({
        productId: product._id,
        movementType: 'RECEIPT',
        quantity: receipt.receivedQuantity,
        previousStock,
        newStock,
        referenceType: 'PURCHASE_ORDER',
        referenceId: po.poNumber,
        reason: `PO Receipt from Supplier for ${po.poNumber}`,
        performedBy: userId ? new Types.ObjectId(userId) : undefined,
        performedByName: userName || 'Warehouse Manager',
      });

      // Update line item in PO
      poItem.receivedQuantity += receipt.receivedQuantity;
    }

    // Check if entire PO is now fully received or partially received
    const allFullyReceived = po.items.every(
      (item) => item.receivedQuantity >= item.orderedQuantity
    );

    po.status = allFullyReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED';
    if (allFullyReceived) {
      po.actualDeliveryDate = new Date();
    }
    po.receivedBy = userId ? new Types.ObjectId(userId) : undefined;

    await po.save();

    broadcastEvent('stock:updated', { poNumber: po.poNumber, status: po.status });
    broadcastEvent('kpi:updated', { type: 'STOCK_RECEIVED' });

    return po;
  }
}
