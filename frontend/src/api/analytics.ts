import { apiClient } from './client';
import { BusinessInsight } from '../types';

export const analyticsApi = {
  getInsights: async (params: {
    category?: string;
    severity?: string;
    status?: string;
  } = {}): Promise<BusinessInsight[]> => {
    return apiClient('/analytics/insights', { params });
  },

  refreshInsights: async (): Promise<BusinessInsight[]> => {
    return apiClient('/analytics/insights/refresh', {
      method: 'POST',
    });
  },

  updateStatus: async (
    id: string,
    status: 'ACKNOWLEDGED' | 'RESOLVED'
  ): Promise<BusinessInsight> => {
    return apiClient(`/analytics/insights/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
