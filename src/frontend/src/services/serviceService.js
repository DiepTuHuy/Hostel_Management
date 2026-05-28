import { api } from './api.js';

export const serviceService = {
  async list(propertyId) {
    const res = await api.get('/services', { params: { propertyId } });
    return res.data;
  },
  async create(data) {
    const res = await api.post('/services', data);
    return res.data;
  },
  async update(id, data) {
    const res = await api.put(`/services/${id}`, data);
    return res.data;
  },
  async delete(id) {
    const res = await api.delete(`/services/${id}`);
    return res.data;
  }
};
