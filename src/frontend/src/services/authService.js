import { fakeDelay } from './api.js';
import users from '../mocks/users.json';
import { User } from '../models/User.js';

/**
 * authService — mô phỏng đăng nhập với 4 role.
 * Demo accounts:
 *  - admin@boardinghouse.vn / admin
 *  - manager.q1@boardinghouse.vn / manager
 *  - duc.pm@gmail.com / tenant
 */
export const authService = {
  async login(email, password) {
    await fakeDelay();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) throw new Error('Tài khoản không tồn tại');
    // Mock: chấp nhận password === role
    if (password !== found.role) throw new Error('Mật khẩu không đúng');
    const token = `mock.${found.id}.${Date.now()}`;
    localStorage.setItem('bhpro_token', token);
    localStorage.setItem('bhpro_user', JSON.stringify(found));
    return { token, user: new User(found) };
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
