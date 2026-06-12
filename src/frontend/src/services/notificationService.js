import { api } from './api.js';

export const notificationService = {
  async list(userId) {
    const res = await api.get('/notifications', { params: { userId } });
    return res.data;
  },
  async markAsRead(id) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },
  async markAllAsRead(userId) {
    const res = await api.post('/notifications/read-all', { userId });
    return res.data;
  }
};
