import { apiClient } from './client';
import { Supplier } from '../types';

export const suppliersApi = {
  getSuppliers: async (params: { search?: string; status?: string } = {}): Promise<Supplier[]> => {
    return apiClient('/suppliers', { params });
  },

  getSupplierById: async (id: string): Promise<Supplier> => {
    return apiClient(`/suppliers/${id}`);
  },

  createSupplier: async (data: Partial<Supplier>): Promise<Supplier> => {
    return apiClient('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateSupplier: async (id: string, data: Partial<Supplier>): Promise<Supplier> => {
    return apiClient(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
