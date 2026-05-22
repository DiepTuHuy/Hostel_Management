import { fakeDelay } from './api.js';
import properties from '../mocks/properties.json';
import { Property } from '../models/Property.js';

export const propertyService = {
  async list() {
    await fakeDelay();
    return properties.map((p) => new Property(p));
  },
  async get(id) {
    await fakeDelay();
    const p = properties.find((x) => x.id === id);
    return p ? new Property(p) : null;
  },
};
