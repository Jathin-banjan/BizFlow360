import { apiClient } from './client';
import { DashboardMetrics, MonthlyTrend } from '../types';

export const dashboardApi = {
  getMetrics: async (startDate?: string, endDate?: string): Promise<DashboardMetrics> => {
    return apiClient('/dashboard/metrics', {
      params: { startDate, endDate },
    });
  },

  getTrends: async (months = 6): Promise<MonthlyTrend[]> => {
    return apiClient('/dashboard/trends', {
      params: { months },
    });
  },

  getBreakdowns: async (): Promise<{
    byRegion: Array<{ region: string; revenue: number; orders: number; profit: number }>;
    byCategory: Array<{ category: string; code: string; revenue: number; unitsSold: number }>;
  }> => {
    return apiClient('/dashboard/breakdowns');
  },

  getTopProducts: async (): Promise<{
    topProducts: Array<{ id: string; name: string; sku: string; revenue: number; unitsSold: number; profit: number }>;
    bottomProducts: Array<{ id: string; name: string; sku: string; revenue: number; unitsSold: number; profit: number }>;
  }> => {
    return apiClient('/dashboard/top-products');
  },

  getRecentOrders: async (limit = 8): Promise<any[]> => {
    return apiClient('/dashboard/recent-orders', {
      params: { limit },
    });
  },
};
