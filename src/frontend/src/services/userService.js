import { fakeDelay } from './api.js';
import users from '../mocks/users.json';
import { User } from '../models/User.js';

export const userService = {
  async list({ role } = {}) {
    await fakeDelay();
    return users
      .filter((u) => (role ? u.role === role : true))
      .map((u) => new User(u));
  },
  async get(id) {
    await fakeDelay();
    const u = users.find((x) => x.id === id);
    return u ? new User(u) : null;
  },
};
