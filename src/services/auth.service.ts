import apiClient from './apiClient';

export const authService = {
  login: async (username: string, password: string) => {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data;
  },
  refreshToken: async (refresh_token: string) => {
    const response = await apiClient.post('/auth/refresh', { refresh_token });
    return response.data;
  }
};
