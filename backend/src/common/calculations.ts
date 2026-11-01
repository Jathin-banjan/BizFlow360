/**
 * Business Calculations for BizFlow 360
 * Pure, deterministic functions with boundary and zero-division protection.
 */

/**
 * Gross Profit = Net Sales Revenue - Cost of Goods Sold
 */
export function calculateGrossProfit(netRevenue: number, cogs: number): number {
  const profit = netRevenue - cogs;
  return Number(profit.toFixed(2));
}

/**
 * Gross Margin % = (Gross Profit / Net Sales Revenue) * 100
 * Returns 0 if net revenue <= 0
 */
export function calculateGrossMarginPercentage(grossProfit: number, netRevenue: number): number {
  if (!netRevenue || netRevenue <= 0) {
    return 0;
  }
  const margin = (grossProfit / netRevenue) * 100;
  return Number(margin.toFixed(2));
}

/**
 * Average Order Value = Net Sales Revenue / Eligible Order Count
 * Returns 0 if order count <= 0
 */
export function calculateAverageOrderValue(netRevenue: number, eligibleOrderCount: number): number {
  if (!eligibleOrderCount || eligibleOrderCount <= 0) {
    return 0;
  }
  const aov = netRevenue / eligibleOrderCount;
  return Number(aov.toFixed(2));
}

/**
 * Inventory Valuation = Sum of (stockQuantity * unitCost)
 */
export function calculateInventoryValuation(
  items: Array<{ currentStock: number; unitCost: number }>
): number {
  const total = items.reduce((sum, item) => {
    const qty = Math.max(0, item.currentStock || 0);
    const cost = Math.max(0, item.unitCost || 0);
    return sum + qty * cost;
  }, 0);
  return Number(total.toFixed(2));
}

/**
 * Fulfilment Rate = (Fulfilled eligible orders / Total eligible orders) * 100
 * Denominator includes all non-cancelled orders
 */
export function calculateFulfilmentRate(fulfilledCount: number, eligibleTotalCount: number): number {
  if (!eligibleTotalCount || eligibleTotalCount <= 0) {
    return 0;
  }
  const rate = (fulfilledCount / eligibleTotalCount) * 100;
  return Number(Math.min(100, Math.max(0, rate)).toFixed(2));
}

/**
 * Supplier On-Time Delivery Rate = (On-time completed orders / Total completed orders) * 100
 */
export function calculateOnTimeDeliveryRate(onTimeCount: number, completedCount: number): number {
  if (!completedCount || completedCount <= 0) {
    return 0;
  }
  const rate = (onTimeCount / completedCount) * 100;
  return Number(Math.min(100, Math.max(0, rate)).toFixed(2));
}

/**
 * Is product in low-stock condition?
 */
export function isLowStock(currentStock: number, reorderThreshold: number): boolean {
  return currentStock <= reorderThreshold;
}
