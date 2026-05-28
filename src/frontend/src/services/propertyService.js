import { api } from './api.js';
import { Property } from '../models/Property.js';

export const propertyService = {
  async list() {
    const res = await api.get('/properties');
    return res.data.map((p) => new Property(p));
  },
  async get(id) {
    const res = await api.get(`/properties/${id}`);
    return res.data ? new Property(res.data) : null;
  },
  async create(data) {
    const res = await api.post('/properties', data);
    return new Property(res.data);
  },
  async update(id, data) {
    const res = await api.put(`/properties/${id}`, data);
    return new Property(res.data);
  },
  async delete(id) {
    const res = await api.delete(`/properties/${id}`);
    return res.data;
  }
};
