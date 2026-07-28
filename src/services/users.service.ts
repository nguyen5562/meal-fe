import apiClient from './apiClient';

export interface User {
  id: number;
  username: string;
  fullName?: string;
  role: 'ADMIN' | 'MANAGER';
  isActive: boolean;
  telegramChatId?: string;
  managerKitchens?: { kitchen: { id: number; name: string } }[];
  createdAt: string;
  updatedAt: string;
}

export const getUsers = async () => {
  const response = await apiClient.get<User[]>('/users');
  return response.data;
};

export const getUserById = async (id: number) => {
  const response = await apiClient.get<User>(`/users/${id}`);
  return response.data;
};

export const createUser = async (data: any) => {
  const response = await apiClient.post<User>('/users', data);
  return response.data;
};

export const updateUser = async (id: number, data: any) => {
  const response = await apiClient.patch<User>(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
};
