import { apiClient } from './client';
import { CustomerOrder } from '../types';

export const ordersApi = {
  getOrders: async (params: {
    status?: string;
    region?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<CustomerOrder[]> => {
    return apiClient('/orders', { params });
  },

  getOrderById: async (id: string): Promise<CustomerOrder> => {
    return apiClient(`/orders/${id}`);
  },

  createOrder: async (data: {
    customerName: string;
    customerEmail: string;
    region: 'North' | 'South' | 'East' | 'West' | 'Central';
    items: Array<{ productId: string; quantity: number }>;
    discount?: number;
  }): Promise<CustomerOrder> => {
    return apiClient('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateStatus: async (
    id: string,
    status: 'PLACED' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  ): Promise<CustomerOrder> => {
    return apiClient(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  exportSalesCsv: async (params: {
    startDate?: string;
    endDate?: string;
    region?: string;
    status?: string;
  } = {}): Promise<Blob> => {
    return apiClient('/exports/sales', { params });
  },
};
