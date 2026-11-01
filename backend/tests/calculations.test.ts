import { describe, it, expect } from 'vitest';
import {
  calculateGrossProfit,
  calculateGrossMarginPercentage,
  calculateAverageOrderValue,
  calculateInventoryValuation,
  calculateFulfilmentRate,
  calculateOnTimeDeliveryRate,
  isLowStock,
} from '../src/common/calculations.js';

describe('BizFlow 360 Business Calculations', () => {
  describe('Gross Profit Calculation', () => {
    it('should calculate gross profit correctly as net revenue minus cogs', () => {
      const profit = calculateGrossProfit(10000, 6000);
      expect(profit).toBe(4000);
    });

    it('should handle zero cogs correctly', () => {
      const profit = calculateGrossProfit(5000, 0);
      expect(profit).toBe(5000);
    });

    it('should handle loss/negative profit correctly', () => {
      const profit = calculateGrossProfit(3000, 4500);
      expect(profit).toBe(-1500);
    });
  });

  describe('Gross Margin Percentage Calculation', () => {
    it('should calculate gross margin percentage correctly', () => {
      const margin = calculateGrossMarginPercentage(4000, 10000);
      expect(margin).toBe(40);
    });

    it('should safely return 0 when net revenue is 0 to avoid division by zero', () => {
      const margin = calculateGrossMarginPercentage(0, 0);
      expect(margin).toBe(0);
    });

    it('should safely return 0 when net revenue is negative', () => {
      const margin = calculateGrossMarginPercentage(-500, -1000);
      expect(margin).toBe(0);
    });
  });

  describe('Average Order Value (AOV) Calculation', () => {
    it('should calculate AOV accurately', () => {
      const aov = calculateAverageOrderValue(15000, 50);
      expect(aov).toBe(300);
    });

    it('should safely return 0 when order count is 0', () => {
      const aov = calculateAverageOrderValue(10000, 0);
      expect(aov).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      const aov = calculateAverageOrderValue(1000, 3);
      expect(aov).toBe(333.33);
    });
  });

  describe('Inventory Valuation Calculation', () => {
    it('should sum stock * unitCost across all inventory items', () => {
      const items = [
        { currentStock: 10, unitCost: 100 }, // 1000
        { currentStock: 5, unitCost: 250 },  // 1250
        { currentStock: 20, unitCost: 50 },  // 1000
      ];
      const valuation = calculateInventoryValuation(items);
      expect(valuation).toBe(3250);
    });

    it('should return 0 for empty inventory list', () => {
      const valuation = calculateInventoryValuation([]);
      expect(valuation).toBe(0);
    });

    it('should ignore negative stock quantities as safe zero', () => {
      const items = [
        { currentStock: -5, unitCost: 100 },
        { currentStock: 10, unitCost: 20 },
      ];
      const valuation = calculateInventoryValuation(items);
      expect(valuation).toBe(200);
    });
  });

  describe('Fulfilment Rate Calculation', () => {
    it('should calculate percentage of fulfilled orders over eligible total', () => {
      const rate = calculateFulfilmentRate(85, 100);
      expect(rate).toBe(85);
    });

    it('should return 0 when total eligible orders is 0', () => {
      const rate = calculateFulfilmentRate(0, 0);
      expect(rate).toBe(0);
    });

    it('should clamp to 100% maximum', () => {
      const rate = calculateFulfilmentRate(105, 100);
      expect(rate).toBe(100);
    });
  });

  describe('Supplier On-Time Delivery Rate', () => {
    it('should calculate on-time percentage accurately', () => {
      const rate = calculateOnTimeDeliveryRate(19, 20);
      expect(rate).toBe(95);
    });

    it('should return 0 if completed orders count is 0', () => {
      const rate = calculateOnTimeDeliveryRate(0, 0);
      expect(rate).toBe(0);
    });
  });

  describe('Low-Stock Detection Rule', () => {
    it('should flag true when currentStock is less than reorderThreshold', () => {
      expect(isLowStock(4, 10)).toBe(true);
    });

    it('should flag true when currentStock is exactly equal to reorderThreshold', () => {
      expect(isLowStock(10, 10)).toBe(true);
    });

    it('should flag false when currentStock is safely above reorderThreshold', () => {
      expect(isLowStock(25, 10)).toBe(false);
    });
  });
});
