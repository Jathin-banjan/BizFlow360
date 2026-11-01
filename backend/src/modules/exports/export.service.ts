import { CustomerOrder } from '../orders/customerOrder.model.js';
import { Product } from '../products/product.model.js';

/**
 * Escapes CSV field and neutralizes CSV Formula Injection (=, +, -, @, tab, cr)
 */
export function sanitizeCsvField(val: any): string {
  if (val === null || val === undefined) {
    return '""';
  }

  let str = String(val).replace(/"/g, '""');

  // Prevent spreadsheet formula execution vulnerability
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }

  return `"${str}"`;
}

export class ExportService {
  static async exportSalesCsv(filters: {
    startDate?: string;
    endDate?: string;
    region?: string;
    status?: string;
  }): Promise<string> {
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

    const orders = await CustomerOrder.find(query).sort({ orderDate: -1 }).lean();

    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Customer Email',
      'Region',
      'Status',
      'Payment Status',
      'Subtotal ($)',
      'Discount ($)',
      'Tax ($)',
      'Total Amount ($)',
      'Gross Profit ($)',
    ];

    const rows = orders.map((o) => [
      sanitizeCsvField(o.orderNumber),
      sanitizeCsvField(new Date(o.orderDate).toISOString().split('T')[0]),
      sanitizeCsvField(o.customerName),
      sanitizeCsvField(o.customerEmail),
      sanitizeCsvField(o.region),
      sanitizeCsvField(o.status),
      sanitizeCsvField(o.paymentStatus),
      sanitizeCsvField(o.subtotal.toFixed(2)),
      sanitizeCsvField(o.discount.toFixed(2)),
      sanitizeCsvField(o.tax.toFixed(2)),
      sanitizeCsvField(o.totalAmount.toFixed(2)),
      sanitizeCsvField(o.grossProfit.toFixed(2)),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  static async exportInventoryCsv(): Promise<string> {
    const products = await Product.find()
      .populate('categoryId', 'name code')
      .sort({ sku: 1 })
      .lean();

    const headers = [
      'SKU',
      'Product Name',
      'Category',
      'Unit Cost ($)',
      'Unit Price ($)',
      'Current Stock',
      'Reorder Threshold',
      'Inventory Valuation ($)',
      'Status',
      'Lead Time (Days)',
    ];

    const rows = products.map((p: any) => {
      const valuation = ((p.currentStock || 0) * (p.unitCost || 0)).toFixed(2);
      return [
        sanitizeCsvField(p.sku),
        sanitizeCsvField(p.name),
        sanitizeCsvField(p.categoryId?.name || 'Unassigned'),
        sanitizeCsvField((p.unitCost || 0).toFixed(2)),
        sanitizeCsvField((p.unitPrice || 0).toFixed(2)),
        sanitizeCsvField(p.currentStock),
        sanitizeCsvField(p.reorderThreshold),
        sanitizeCsvField(valuation),
        sanitizeCsvField(p.status),
        sanitizeCsvField(p.leadTimeDays),
      ];
    });

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
