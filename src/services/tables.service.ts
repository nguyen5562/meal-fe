import apiClient from './apiClient';

export const tablesService = {
  findByToken: async (token: string) => {
    const response = await apiClient.get(`/tables/token/${token}`);
    return response.data;
  },
  findAll: async (kitchenId?: number) => {
    const url = kitchenId ? `/tables?kitchenId=${kitchenId}` : '/tables';
    const response = await apiClient.get(url);
    return response.data;
  },
  create: async (data: { kitchenId: number; tableName: string }) => {
    const response = await apiClient.post('/tables', data);
    return response.data;
  },
  update: async (id: number, data: { kitchenId?: number; tableName?: string }) => {
    const response = await apiClient.patch(`/tables/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await apiClient.delete(`/tables/${id}`);
    return response.data;
  }
};
