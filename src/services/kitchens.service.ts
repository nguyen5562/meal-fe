import apiClient from './apiClient';

export interface Kitchen {
  id: number;
  name: string;
  location?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getKitchens = async () => {
  const response = await apiClient.get<Kitchen[]>('/kitchens');
  return response.data;
};

export const getKitchenById = async (id: number) => {
  const response = await apiClient.get<Kitchen>(`/kitchens/${id}`);
  return response.data;
};

export const createKitchen = async (data: { name: string; location?: string; isActive?: boolean }) => {
  const response = await apiClient.post<Kitchen>('/kitchens', data);
  return response.data;
};

export const updateKitchen = async (id: number, data: Partial<{ name: string; location: string; isActive: boolean }>) => {
  const response = await apiClient.patch<Kitchen>(`/kitchens/${id}`, data);
  return response.data;
};

export const deleteKitchen = async (id: number) => {
  const response = await apiClient.delete(`/kitchens/${id}`);
  return response.data;
};
