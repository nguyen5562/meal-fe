import apiClient from './apiClient';

export const tablesService = {
  findByToken: async (token: string) => {
    const response = await apiClient.get(`/tables/token/${token}`);
    return response.data;
  }
};
