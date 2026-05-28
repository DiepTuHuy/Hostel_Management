import { api } from './api.js';
import { Invoice } from '../models/Invoice.js';

export const invoiceService = {
  async list({ tenantId, propertyId, status, period } = {}) {
    const res = await api.get('/invoices', { params: { tenantId, propertyId, status, period } });
    return res.data.map((i) => new Invoice(i));
  },
  async get(id) {
    const res = await api.get(`/invoices/${id}`);
    return res.data ? new Invoice(res.data) : null;
  },
  async pay(id, method) {
    const res = await api.post(`/invoices/${id}/pay`, { method });
    return res.data;
  },
  async generateInvoices(propertyId, period) {
    const res = await api.post('/invoices/generate', { propertyId, period });
    return res.data;
  },
  async payWithCash(id) {
    const res = await api.post(`/invoices/${id}/pay-cash`);
    return res.data;
  },
  async rejectCash(id) {
    const res = await api.post(`/invoices/${id}/reject-cash`);
    return res.data;
  }
};
