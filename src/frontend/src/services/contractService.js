import { api } from './api.js';
import { Contract } from '../models/Contract.js';

export const contractService = {
  async list({ propertyId, tenantId, status } = {}) {
    const res = await api.get('/contracts', { params: { propertyId, tenantId, status } });
    return res.data.map((c) => new Contract(c));
  },
  async get(id) {
    const res = await api.get(`/contracts/${id}`);
    return res.data ? new Contract(res.data) : null;
  },
  async create(data) {
    const res = await api.post('/contracts', data);
    return new Contract(res.data);
  },
  async terminate(id) {
    const res = await api.patch(`/contracts/${id}/terminate`);
    return new Contract(res.data);
  },
  async extend(id, endDate) {
    const res = await api.patch(`/contracts/${id}/extend`, { endDate });
    return new Contract(res.data);
  },
  async sign(id) {
    const res = await api.patch(`/contracts/${id}/sign`);
    return new Contract(res.data);
  },
  async update(id, data) {
    const res = await api.put(`/contracts/${id}`, data);
    return new Contract(res.data);
  }
};
