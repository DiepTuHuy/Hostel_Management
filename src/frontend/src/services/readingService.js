import { api } from './api.js';

export const readingService = {
  async list({ roomId, period } = {}) {
    const res = await api.get('/readings', { params: { roomId, period } });
    return res.data;
  },
  async create(readings) {
    const res = await api.post('/readings', { readings });
    return res.data;
  }
};
