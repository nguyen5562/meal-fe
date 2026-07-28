import apiClient from './apiClient';

export const getBotInfo = async () => {
  const response = await apiClient.get('/telegram/bot-info');
  return response.data;
};
