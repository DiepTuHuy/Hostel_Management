import { fakeDelay } from './api.js';
import rooms from '../mocks/rooms.json';
import { Room } from '../models/Room.js';

export const roomService = {
  async list({ propertyId, status } = {}) {
    await fakeDelay();
    return rooms
      .filter((r) => (propertyId ? r.propertyId === propertyId : true))
      .filter((r) => (status ? r.status === status : true))
      .map((r) => new Room(r));
  },
  async get(id) {
    await fakeDelay();
    const r = rooms.find((x) => x.id === id);
    return r ? new Room(r) : null;
  },
  async search({ keyword = '', priceMin, priceMax, amenities = [], district } = {}) {
    await fakeDelay();
    const kw = keyword.toLowerCase();
    return rooms
      .filter((r) => (kw ? (r.code + r.description).toLowerCase().includes(kw) : true))
      .filter((r) => (priceMin != null ? r.price >= priceMin : true))
      .filter((r) => (priceMax != null ? r.price <= priceMax : true))
      .filter((r) => (amenities.length ? amenities.every((a) => r.amenities.includes(a)) : true))
      .map((r) => new Room(r));
  },
};
