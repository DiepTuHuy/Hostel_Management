import { fakeDelay } from './api.js';
import invoices from '../mocks/invoices.json';
import { Invoice } from '../models/Invoice.js';

export const invoiceService = {
  async list({ tenantId, propertyId, status, period } = {}) {
    await fakeDelay();
    return invoices
      .filter((i) => (tenantId ? i.tenantId === tenantId : true))
      .filter((i) => (propertyId ? i.propertyId === propertyId : true))
      .filter((i) => (status ? i.status === status : true))
      .filter((i) => (period ? i.period === period : true))
      .map((i) => new Invoice(i));
  },
  async get(id) {
    await fakeDelay();
    const i = invoices.find((x) => x.id === id);
    return i ? new Invoice(i) : null;
  },
  async pay(id, method) {
    await fakeDelay(800);
    return { ok: true, transactionId: `TX${Date.now()}`, method };
  },
};
