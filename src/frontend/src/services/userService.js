import { api } from './api.js';
import { User } from '../models/User.js';

export const userService = {
  async list({ role } = {}) {
    const res = await api.get('/users', { params: { role } });
    return res.data.map((u) => new User(u));
  },
  async get(id) {
    const res = await api.get(`/users/${id}`);
    return res.data ? new User(res.data) : null;
  },
};
