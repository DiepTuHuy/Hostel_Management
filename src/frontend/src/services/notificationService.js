import { fakeDelay } from './api.js';
import notifications from '../mocks/notifications.json';

export const notificationService = {
  async list(userId) {
    await fakeDelay();
    return notifications.filter((n) => !userId || n.userId === userId);
  },
};
