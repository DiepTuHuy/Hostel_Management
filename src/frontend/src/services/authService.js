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
    return res.data;
  },

  async verifyOtp(email, otp) {
    const res = await api.post('/auth/verify-otp', { email, otp });
    const { token, user } = res.data;
    localStorage.setItem('bhpro_token', token);
    localStorage.setItem('bhpro_user', JSON.stringify(user));
    return { token, user: new User(user) };
  },

  async resendOtp(email) {
    const res = await api.post('/auth/resend-otp', { email });
    return res.data;
  },

  async forgotPassword(email) {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(email, otp, newPassword) {
    const res = await api.post('/auth/reset-password', { email, otp, newPassword });
    return res.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn("Backend logout error:", e);
    }
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
