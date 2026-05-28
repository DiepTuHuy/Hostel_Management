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
};
