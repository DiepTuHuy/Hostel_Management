import { api } from './api.js';
import { User } from '../models/User.js';

/**
 * authService — Kết nối backend thực qua API client
 */
export const authService = {
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('bhpro_token', token);
    localStorage.setItem('bhpro_user', JSON.stringify(user));
    return { token, user: new User(user) };
  },

  async register(fullName, email, phone, password, role = 'tenant') {
    const res = await api.post('/auth/register', {
      fullName,
      email,
      phone,
      password,
      role
    });
    return new User(res.data.user);
  },

  async logout() {
    localStorage.removeItem('bhpro_token');
    localStorage.removeItem('bhpro_user');
  },

  getCurrentUser() {
    try {
      const raw = localStorage.getItem('bhpro_user');
      return raw ? new User(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  },
};
