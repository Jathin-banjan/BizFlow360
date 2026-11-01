import { apiClient } from './client';
import { Product, Category } from '../types';

export const productsApi = {
  getCategories: async (): Promise<Category[]> => {
    return apiClient('/products/categories');
  },

  getProducts: async (params: {
    search?: string;
    categoryId?: string;
    status?: string;
    lowStock?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<Product[]> => {
    return apiClient('/products', { params });
  },

  getProductById: async (id: string): Promise<Product> => {
    return apiClient(`/products/${id}`);
  },

  createProduct: async (data: Partial<Product>): Promise<Product> => {
    return apiClient('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    return apiClient(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  setStatus: async (id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<Product> => {
    return apiClient(`/products/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
