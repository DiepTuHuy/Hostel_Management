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
};
