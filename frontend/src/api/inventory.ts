import { apiClient } from './client';
import { InventoryMovement } from '../types';

export const inventoryApi = {
  getSummary: async (): Promise<{
    totalValuation: number;
    totalItems: number;
    lowStockCount: number;
    outOfStockCount: number;
  }> => {
    return apiClient('/inventory/summary');
  },

  getMovements: async (params: {
    productId?: string;
    movementType?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<InventoryMovement[]> => {
    return apiClient('/inventory/movements', { params });
  },

  adjustStock: async (data: {
    productId: string;
    adjustmentQuantity: number;
    reason: string;
    referenceId?: string;
  }): Promise<{ product: any; movement: InventoryMovement }> => {
    return apiClient('/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  exportCsv: async (): Promise<Blob> => {
    return apiClient('/exports/inventory');
  },
};
