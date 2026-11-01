import { CustomerOrder } from '../orders/customerOrder.model.js';
import { Product } from '../products/product.model.js';
import { PurchaseOrder } from '../purchase-orders/purchaseOrder.model.js';
import { Supplier } from '../suppliers/supplier.model.js';
import { BusinessInsight } from '../analytics/businessInsight.model.js';
import {
  calculateGrossProfit,
  calculateGrossMarginPercentage,
  calculateAverageOrderValue,
  calculateFulfilmentRate,
  calculateInventoryValuation,
} from '../../common/calculations.js';

export class DashboardService {
  static async getMetrics(startDateStr?: string, endDateStr?: string) {
    const orderFilter: any = { status: { $ne: 'CANCELLED' } };

    if (startDateStr || endDateStr) {
      orderFilter.orderDate = {};
      if (startDateStr) orderFilter.orderDate.$gte = new Date(startDateStr);
      if (endDateStr) {
        const end = new Date(endDateStr);
        end.setHours(23, 59, 59, 999);
        orderFilter.orderDate.$lte = end;
      }
    }

    // 1. Order aggregation for revenue, profit, counts
    const [orderAggregation, activeProducts, pendingPoCount, suppliers, activeAlertsCount] =
      await Promise.all([
        CustomerOrder.aggregate([
          { $match: orderFilter },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$totalAmount' },
              totalProfit: { $sum: '$grossProfit' },
              orderCount: { $sum: 1 },
              deliveredCount: {
                $sum: { $cond: [{ $eq: ['$status', 'DELIVERED'] }, 1, 0] },
              },
            },
          },
        ]),
        Product.find({ status: 'ACTIVE' }).select('currentStock unitCost reorderThreshold').lean(),
        PurchaseOrder.countDocuments({
          status: { $in: ['DRAFT', 'SUBMITTED', 'APPROVED', 'PARTIALLY_RECEIVED'] },
        }),
        Supplier.find({ status: 'ACTIVE' }).select('onTimeDeliveryRate').lean(),
        BusinessInsight.countDocuments({ status: 'ACTIVE' }),
      ]);

    const orderStats = orderAggregation[0] || {
      totalRevenue: 0,
      totalProfit: 0,
      orderCount: 0,
      deliveredCount: 0,
    };

    const totalRevenue = Number(orderStats.totalRevenue.toFixed(2));
    const grossProfit = Number(orderStats.totalProfit.toFixed(2));
    const totalCost = Number(Math.max(0, totalRevenue - grossProfit).toFixed(2));
    const grossMargin = calculateGrossMarginPercentage(grossProfit, totalRevenue);
    const aov = calculateAverageOrderValue(totalRevenue, orderStats.orderCount);
    const fulfilmentRate = calculateFulfilmentRate(
      orderStats.deliveredCount,
      orderStats.orderCount
    );

    // Inventory metrics
    const inventoryValuation = calculateInventoryValuation(activeProducts);
    const lowStockCount = activeProducts.filter(
      (p) => p.currentStock <= p.reorderThreshold
    ).length;

    // Supplier average on-time performance
    const avgOnTimeRate =
      suppliers.length > 0
        ? Number(
            (
              suppliers.reduce((acc, s) => acc + (s.onTimeDeliveryRate || 0), 0) /
              suppliers.length
            ).toFixed(2)
          )
        : 100;

    return {
      totalRevenue,
      totalCost,
      grossProfit,
      grossMarginPercentage: grossMargin,
      totalOrders: orderStats.orderCount,
      averageOrderValue: aov,
      fulfilmentRate,
      inventoryValuation,
      lowStockProductCount: lowStockCount,
      pendingPurchaseOrdersCount: pendingPoCount,
      supplierDeliveryPerformance: avgOnTimeRate,
      activeAlertsCount,
    };
  }

  static async getMonthlyTrends(monthsCount = 6) {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsCount);

    const monthlyData = await CustomerOrder.aggregate([
      {
        $match: {
          orderDate: { $gte: cutoffDate },
          status: { $ne: 'CANCELLED' },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$orderDate' },
            month: { $month: '$orderDate' },
          },
          revenue: { $sum: '$totalAmount' },
          profit: { $sum: '$grossProfit' },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    return monthlyData.map((d) => ({
      period: `${monthNames[d._id.month - 1]} ${d._id.year}`,
      revenue: Number(d.revenue.toFixed(2)),
      profit: Number(d.profit.toFixed(2)),
      orders: d.orders,
    }));
  }

  static async getBreakdowns() {
    // 1. Regional Breakdown
    const regionalData = await CustomerOrder.aggregate([
      { $match: { status: { $ne: 'CANCELLED' } } },
      {
        $group: {
          _id: '$region',
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          profit: { $sum: '$grossProfit' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // 2. Category Breakdown
    const categoryData = await CustomerOrder.aggregate([
      { $match: { status: { $ne: 'CANCELLED' } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category.name',
          categoryCode: { $first: '$category.code' },
          revenue: { $sum: '$items.totalPrice' },
          unitsSold: { $sum: '$items.quantity' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    return {
      byRegion: regionalData.map((r) => ({
        region: r._id,
        revenue: Number(r.revenue.toFixed(2)),
        orders: r.orders,
        profit: Number(r.profit.toFixed(2)),
      })),
      byCategory: categoryData.map((c) => ({
        category: c._id,
        code: c.categoryCode,
        revenue: Number(c.revenue.toFixed(2)),
        unitsSold: c.unitsSold,
      })),
    };
  }

  static async getTopAndBottomProducts() {
    const productStats = await CustomerOrder.aggregate([
      { $match: { status: { $ne: 'CANCELLED' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          sku: { $first: '$items.sku' },
          revenue: { $sum: '$items.totalPrice' },
          unitsSold: { $sum: '$items.quantity' },
          profit: { $sum: '$items.grossProfit' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    const topProducts = productStats.slice(0, 5).map((p) => ({
      id: p._id,
      name: p.productName,
      sku: p.sku,
      revenue: Number(p.revenue.toFixed(2)),
      unitsSold: p.unitsSold,
      profit: Number(p.profit.toFixed(2)),
    }));

    const bottomProducts = productStats
      .slice(-5)
      .reverse()
      .map((p) => ({
        id: p._id,
        name: p.productName,
        sku: p.sku,
        revenue: Number(p.revenue.toFixed(2)),
        unitsSold: p.unitsSold,
        profit: Number(p.profit.toFixed(2)),
      }));

    return { topProducts, bottomProducts };
  }

  static async getRecentOrders(limit = 8) {
    return CustomerOrder.find()
      .sort({ orderDate: -1 })
      .limit(limit)
      .select('orderNumber customerName region orderDate totalAmount status')
      .lean();
  }
}
