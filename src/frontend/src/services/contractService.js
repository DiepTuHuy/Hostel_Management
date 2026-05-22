import { fakeDelay } from './api.js';
import contracts from '../mocks/contracts.json';
import { Contract } from '../models/Contract.js';

export const contractService = {
  async list({ propertyId, tenantId, status } = {}) {
    await fakeDelay();
    return contracts
      .filter((c) => (propertyId ? c.propertyId === propertyId : true))
      .filter((c) => (tenantId ? c.tenantId === tenantId : true))
      .filter((c) => (status ? c.status === status : true))
      .map((c) => new Contract(c));
  },
  async get(id) {
    await fakeDelay();
    const c = contracts.find((x) => x.id === id);
    return c ? new Contract(c) : null;
  },
};
