import { api } from './api.js';

export const notificationService = {
  async list(userId) {
    const res = await api.get('/notifications', { params: { userId } });
    return res.data;
  },
};
