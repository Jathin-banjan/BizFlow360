import { CustomerOrder, ICustomerOrder } from './customerOrder.model.js';
import { Product } from '../products/product.model.js';
import { InventoryMovement } from '../inventory/inventoryMovement.model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { CustomerOrderStatus } from '../../common/types.js';
import { calculateGrossProfit } from '../../common/calculations.js';
import { Types } from 'mongoose';

export class CustomerOrderService {
  static async getOrders(filters: {
    status?: string;
    region?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ orders: any[]; total: number; page: number; totalPages: number }> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (filters.status) query.status = filters.status;
    if (filters.region) query.region = filters.region;

    if (filters.startDate || filters.endDate) {
      query.orderDate = {};
      if (filters.startDate) query.orderDate.$gte = new Date(filters.startDate);
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        query.orderDate.$lte = end;
      }
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { orderNumber: searchRegex },
        { customerName: searchRegex },
        { customerEmail: searchRegex },
      ];
    }

    const sortField = filters.sortBy || 'orderDate';
    const sortDirection = filters.sortOrder === 'asc' ? 1 : -1;

    const [orders, total] = await Promise.all([
      CustomerOrder.find(query)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limit)
        .lean(),
      CustomerOrder.countDocuments(query),
    ]);

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getOrderById(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid order ID');
    }

    const order = await CustomerOrder.findById(id).lean();
    if (!order) {
      throw new NotFoundError(`Order '${id}' not found`);
    }

    return order;
  }

  static async createOrder(
    data: {
      customerName: string;
      customerEmail: string;
      region: 'North' | 'South' | 'East' | 'West' | 'Central';
      items: Array<{ productId: string; quantity: number }>;
      discount?: number;
    },
    userId?: string,
    userName?: string
  ): Promise<ICustomerOrder> {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestError('Order must have at least one line item');
    }

    let subtotal = 0;
    let totalCogs = 0;
    const resolvedItems = [];

    // Verify stock and calculate totals
    for (const item of data.items) {
      if (!Types.ObjectId.isValid(item.productId)) {
        throw new BadRequestError(`Invalid product ID: ${item.productId}`);
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        throw new NotFoundError(`Product '${item.productId}' not found`);
      }

      if (product.currentStock < item.quantity) {
        throw new BadRequestError(
          `Insufficient stock for '${product.name}'. Available: ${product.currentStock}, Requested: ${item.quantity}`
        );
      }

      const itemTotal = Number((product.unitPrice * item.quantity).toFixed(2));
      const itemCogs = Number((product.unitCost * item.quantity).toFixed(2));
      const itemProfit = Number((itemTotal - itemCogs).toFixed(2));

      subtotal += itemTotal;
      totalCogs += itemCogs;

      resolvedItems.push({
        productId: product._id,
        sku: product.sku,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.unitPrice,
        unitCost: product.unitCost,
        totalPrice: itemTotal,
        grossProfit: itemProfit,
      });

      // Deduct inventory atomically
      const prevStock = product.currentStock;
      product.currentStock = prevStock - item.quantity;
      await product.save();

      // Create stock movement record
      await InventoryMovement.create({
        productId: product._id,
        movementType: 'SALE',
        quantity: item.quantity,
        previousStock: prevStock,
        newStock: product.currentStock,
        referenceType: 'CUSTOMER_ORDER',
        referenceId: 'PENDING',
        reason: 'Customer sale deduction',
        performedBy: userId ? new Types.ObjectId(userId) : undefined,
        performedByName: userName || 'Sales Portal',
      });
    }

    const discount = data.discount || 0;
    const taxRate = 0.08; // 8% tax
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Number((taxableAmount * taxRate).toFixed(2));
    const totalAmount = Number((taxableAmount + tax).toFixed(2));
    const orderGrossProfit = calculateGrossProfit(subtotal - discount, totalCogs);

    const orderCount = await CustomerOrder.countDocuments();
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 10001).padStart(6, '0')}`;

    const order = await CustomerOrder.create({
      orderNumber,
      customerName: data.customerName.trim(),
      customerEmail: data.customerEmail.toLowerCase().trim(),
      region: data.region,
      orderDate: new Date(),
      status: 'CONFIRMED',
      items: resolvedItems,
      subtotal: Number(subtotal.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      tax,
      totalAmount,
      grossProfit: orderGrossProfit,
      paymentStatus: 'PAID',
    });

    // Update referenceId on movements
    await InventoryMovement.updateMany(
      { referenceId: 'PENDING' },
      { referenceId: order.orderNumber }
    );

    return order;
  }

  static async updateOrderStatus(
    id: string,
    newStatus: CustomerOrderStatus
  ): Promise<ICustomerOrder> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid order ID');
    }

    const order = await CustomerOrder.findById(id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.status === 'DELIVERED' && newStatus !== 'DELIVERED') {
      throw new BadRequestError('Delivered orders cannot return to a previous status');
    }

    if (order.status === 'CANCELLED') {
      throw new BadRequestError('Cancelled orders cannot change status');
    }

    order.status = newStatus;
    if (newStatus === 'DELIVERED') {
      order.fulfilledDate = new Date();
    }

    await order.save();
    return order;
  }
}
