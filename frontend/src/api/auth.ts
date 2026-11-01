import { apiClient } from './client';
import { User } from '../types';

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<{ token: string; user: User }> => {
    return apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  logout: async (): Promise<{ success: boolean }> => {
    return apiClient('/auth/logout', {
      method: 'POST',
    });
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    return apiClient('/auth/me', {
      method: 'GET',
    });
  },
};
