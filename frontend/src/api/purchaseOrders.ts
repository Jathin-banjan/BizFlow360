import { apiClient } from './client';
import { PurchaseOrder } from '../types';

export const purchaseOrdersApi = {
  getOrders: async (params: {
    status?: string;
    supplierId?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PurchaseOrder[]> => {
    return apiClient('/purchase-orders', { params });
  },

  getOrderById: async (id: string): Promise<PurchaseOrder> => {
    return apiClient(`/purchase-orders/${id}`);
  },

  createOrder: async (data: {
    supplierId: string;
    expectedDeliveryDate: string;
    notes?: string;
    items: Array<{ productId: string; orderedQuantity: number; unitCost?: number }>;
  }): Promise<PurchaseOrder> => {
    return apiClient('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateStatus: async (
    id: string,
    status: 'SUBMITTED' | 'APPROVED' | 'CANCELLED'
  ): Promise<PurchaseOrder> => {
    return apiClient(`/purchase-orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  receiveStock: async (
    id: string,
    items: Array<{ productId: string; receivedQuantity: number }>
  ): Promise<PurchaseOrder> => {
    return apiClient(`/purchase-orders/${id}/receive`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },
};
