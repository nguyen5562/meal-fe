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
  }
};
