import { BusinessInsight, IBusinessInsight } from './businessInsight.model.js';
import { Product } from '../products/product.model.js';
import { PurchaseOrder } from '../purchase-orders/purchaseOrder.model.js';
import { Supplier } from '../suppliers/supplier.model.js';
import { CustomerOrder } from '../orders/customerOrder.model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { Types } from 'mongoose';

export class AnalyticsService {
  static async getInsights(filters: {
    category?: string;
    severity?: string;
    status?: string;
  }): Promise<IBusinessInsight[]> {
    const query: any = {};
    if (filters.category) query.category = filters.category;
    if (filters.severity) query.severity = filters.severity;
    if (filters.status) query.status = filters.status;

    return BusinessInsight.find(query).sort({
      status: 1, // ACTIVE first
      severity: 1,
      createdAt: -1,
    });
  }

  /**
   * Evaluates rule engine across real database collections
   * and creates/updates operational alerts
   */
  static async runRulesEngine(): Promise<IBusinessInsight[]> {
    const generatedInsights: Array<Partial<IBusinessInsight>> = [];
    const now = new Date();

    // RULE 1: Low stock critical items
    const lowStockProducts = await Product.find({
      status: 'ACTIVE',
      $expr: { $lte: ['$currentStock', '$reorderThreshold'] },
    }).populate('categoryId', 'name');

    if (lowStockProducts.length > 0) {
      const topCritical = lowStockProducts.slice(0, 3).map((p) => `${p.name} (${p.currentStock}/${p.reorderThreshold})`).join(', ');
      generatedInsights.push({
        insightKey: 'RULE_LOW_STOCK_ALERT',
        title: `${lowStockProducts.length} Product(s) Below Reorder Threshold`,
        category: 'INVENTORY',
        severity: lowStockProducts.some((p) => p.currentStock === 0) ? 'CRITICAL' : 'WARNING',
        evidence: `Items requiring replenishment: ${topCritical}`,
        relevantMetric: 'Low-Stock Products',
        metricValue: lowStockProducts.length,
        period: 'Real-time',
        explanation:
          'Current inventory levels have breached the minimum reorder threshold, presenting a stockout risk.',
        recommendedAction:
          'Create and submit purchase orders to preferred suppliers to replenish depleted inventory.',
        status: 'ACTIVE',
      });
    }

    // RULE 2: Overdue Purchase Orders
    const delayedPOs = await PurchaseOrder.find({
      status: { $in: ['APPROVED', 'PARTIALLY_RECEIVED'] },
      expectedDeliveryDate: { $lt: now },
    }).populate('supplierId', 'name contactPerson phone');

    if (delayedPOs.length > 0) {
      generatedInsights.push({
        insightKey: 'RULE_OVERDUE_PURCHASE_ORDERS',
        title: `${delayedPOs.length} Purchase Order(s) Overdue Delivery`,
        category: 'SUPPLIERS',
        severity: 'CRITICAL',
        evidence: delayedPOs
          .map((po: any) => `${po.poNumber} from ${po.supplierId?.name || 'Supplier'} (Due: ${new Date(po.expectedDeliveryDate).toLocaleDateString()})`)
          .join('; '),
        relevantMetric: 'Overdue PO Count',
        metricValue: delayedPOs.length,
        period: 'Current pending deliveries',
        explanation:
          'Suppliers have exceeded their contractual expected delivery dates for active approved purchase orders.',
        recommendedAction:
          'Contact supplier representatives immediately to expedite dispatch and update delivery forecasts.',
        status: 'ACTIVE',
      });
    }

    // RULE 3: Underperforming Suppliers (On-Time Delivery Rate < 85%)
    const poorSuppliers = await Supplier.find({
      status: 'ACTIVE',
      onTimeDeliveryRate: { $lt: 85 },
      totalOrdersPlaced: { $gt: 0 },
    });

    if (poorSuppliers.length > 0) {
      generatedInsights.push({
        insightKey: 'RULE_POOR_SUPPLIER_RELIABILITY',
        title: `${poorSuppliers.length} Supplier(s) With Substandard Delivery SLA`,
        category: 'SUPPLIERS',
        severity: 'WARNING',
        evidence: poorSuppliers.map((s) => `${s.name}: ${s.onTimeDeliveryRate}% on-time SLA`).join(', '),
        relevantMetric: 'Supplier SLA Compliance',
        metricValue: poorSuppliers.length,
        period: 'Year to date',
        explanation:
          'Suppliers with fulfillment reliability below the target threshold of 85% create lead time volatility.',
        recommendedAction:
          'Conduct vendor performance reviews or shift procurement quotas to secondary qualified suppliers.',
        status: 'ACTIVE',
      });
    }

    // RULE 4: Gross Margin Alert (Overall margin check)
    const recentOrders = await CustomerOrder.find({
      status: { $ne: 'CANCELLED' },
    }).limit(100);

    const totalRev = recentOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalProfit = recentOrders.reduce((sum, o) => sum + o.grossProfit, 0);
    const overallMargin = totalRev > 0 ? (totalProfit / totalRev) * 100 : 0;

    if (overallMargin > 0 && overallMargin < 25) {
      generatedInsights.push({
        insightKey: 'RULE_LOW_GROSS_MARGIN',
        title: 'Gross Margin Compression Alert',
        category: 'MARGIN',
        severity: 'WARNING',
        evidence: `Current average gross margin is ${overallMargin.toFixed(1)}%, below the 25% target hurdle.`,
        relevantMetric: 'Gross Margin %',
        metricValue: Number(overallMargin.toFixed(1)),
        period: 'Recent order sample',
        explanation:
          'Discounting or rising cost of goods sold has eroded profitability on recent transactions.',
        recommendedAction:
          'Review pricing markups and minimize discretionary discounting on low-margin categories.',
        status: 'ACTIVE',
      });
    }

    // Upsert detected insights
    for (const insight of generatedInsights) {
      await BusinessInsight.findOneAndUpdate(
        { insightKey: insight.insightKey },
        {
          $set: {
            title: insight.title,
            category: insight.category,
            severity: insight.severity,
            evidence: insight.evidence,
            relevantMetric: insight.relevantMetric,
            metricValue: insight.metricValue,
            period: insight.period,
            explanation: insight.explanation,
            recommendedAction: insight.recommendedAction,
          },
          $setOnInsert: { status: 'ACTIVE' },
        },
        { upsert: true, new: true }
      );
    }

    return BusinessInsight.find().sort({ status: 1, severity: 1, createdAt: -1 });
  }

  static async updateStatus(
    id: string,
    status: 'ACKNOWLEDGED' | 'RESOLVED',
    userId?: string,
    userName?: string
  ): Promise<IBusinessInsight> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid insight ID');
    }

    const insight = await BusinessInsight.findById(id);
    if (!insight) {
      throw new NotFoundError('Business insight not found');
    }

    insight.status = status;
    if (status === 'ACKNOWLEDGED') {
      insight.acknowledgedBy = userId ? new Types.ObjectId(userId) : undefined;
      insight.acknowledgedByName = userName;
    } else if (status === 'RESOLVED') {
      insight.resolvedBy = userId ? new Types.ObjectId(userId) : undefined;
      insight.resolvedByName = userName;
    }

    await insight.save();
    return insight;
  }
}
