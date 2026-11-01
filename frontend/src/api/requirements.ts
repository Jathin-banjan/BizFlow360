import { apiClient } from './client';
import { Requirement } from '../types';

export const requirementsApi = {
  getRequirements: async (params: {
    type?: string;
    status?: string;
    priority?: string;
    module?: string;
    search?: string;
  } = {}): Promise<Requirement[]> => {
    return apiClient('/requirements', { params });
  },

  getRequirementById: async (id: string): Promise<Requirement> => {
    return apiClient(`/requirements/${id}`);
  },

  createRequirement: async (data: Partial<Requirement>): Promise<Requirement> => {
    return apiClient('/requirements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateRequirement: async (id: string, data: Partial<Requirement>): Promise<Requirement> => {
    return apiClient(`/requirements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  toggleCriteria: async (reqId: string, criteriaId: string): Promise<Requirement> => {
    return apiClient(`/requirements/${reqId}/criteria/${criteriaId}/toggle`, {
      method: 'PATCH',
    });
  },
};
