import { fakeDelay } from './api.js';
import users from '../mocks/users.json';
import { User } from '../models/User.js';

export const authService = {
  async login(email, password) {
    await fakeDelay();
    const registered = JSON.parse(localStorage.getItem('bhpro_registered_users') || '[]');
    const foundRegistered = registered.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (foundRegistered) {
      if (password !== foundRegistered.password) {
        throw new Error('Mật khẩu không đúng');
      }
      const token = `mock.${foundRegistered.id}.${Date.now()}`;
      localStorage.setItem('bhpro_token', token);
      localStorage.setItem('bhpro_user', JSON.stringify(foundRegistered));
      return { token, user: new User(foundRegistered) };
    }
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      throw new Error('Tài khoản không tồn tại');
    }
    if (password !== found.role) {
      throw new Error('Mật khẩu không đúng');
    }
    const token = `mock.${found.id}.${Date.now()}`;
    localStorage.setItem('bhpro_token', token);
    localStorage.setItem('bhpro_user', JSON.stringify(found));
    return { token, user: new User(found) };
  },

  async register(fullName, email, phone, password, role = 'tenant') {
    await fakeDelay();
    const registered = JSON.parse(localStorage.getItem('bhpro_registered_users') || '[]');
    const allUsers = [...users, ...registered];
    if (allUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email đã được đăng ký sử dụng trong hệ thống');
    }
    const newUser = {
      id: `u-${role === 'tenant' ? 'tnt' : 'vst'}-${Date.now()}`,
      fullName,
      email,
      phone,
      role,
      status: 'active',
      createdAt: new Date().toISOString(),
      password
    };
    registered.push(newUser);
    localStorage.setItem('bhpro_registered_users', JSON.stringify(registered));
    return newUser;
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
