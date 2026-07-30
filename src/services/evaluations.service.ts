import apiClient from './apiClient';

export const evaluationsService = {
  create: async (data: {
    tableId: number;
    evaluatorName: string;
    unit: string;
    rating: number;
    feedback?: string;
  }) => {
    const response = await apiClient.post('/evaluations', data);
    return response.data;
  },
  getAll: async (params?: {
    kitchenId?: number;
    tableId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/evaluations', { params });
    return response.data;
  }
};
