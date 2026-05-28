import { api } from './api.js';
import { Room } from '../models/Room.js';

export const roomService = {
  async list({ propertyId, status } = {}) {
    const res = await api.get('/rooms', { params: { propertyId, status } });
    return res.data.map((r) => new Room(r));
  },
  async get(id) {
    const res = await api.get(`/rooms/${id}`);
    return res.data ? new Room(res.data) : null;
  },
  async search({ keyword = '', priceMin, priceMax, amenities = [], district } = {}) {
    const params = {
      keyword,
      priceMin,
      priceMax,
      district
    };
    if (amenities.length) {
      params.amenities = amenities.join(',');
    }
    const res = await api.get('/rooms/search', { params });
    return res.data.map((r) => new Room(r));
  },
  async create(data) {
    const res = await api.post('/rooms', data);
    return new Room(res.data);
  },
  async update(id, data) {
    const res = await api.put(`/rooms/${id}`, data);
    return new Room(res.data);
  },
  async delete(id) {
    const res = await api.delete(`/rooms/${id}`);
    return res.data;
  },
  async updateStatus(id, status) {
    const res = await api.patch(`/rooms/${id}/status`, { status });
    return new Room(res.data);
  },
  async deposit(id, depositData) {
    const res = await api.post(`/rooms/${id}/deposit`, depositData);
    return res.data;
  }
};
