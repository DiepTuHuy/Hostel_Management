import { api } from './api.js';

export const roomTypeService = {
  async list(propertyId) {
    const res = await api.get(`/properties/${propertyId}/room-types`);
    return res.data;
  },
  async create(data) {
    const res = await api.post('/room-types', data);
    return res.data;
  },
  async update(id, data) {
    const res = await api.put(`/room-types/${id}`, data);
    return res.data;
  },
  async delete(id) {
    const res = await api.delete(`/room-types/${id}`);
    return res.data;
  }
};
