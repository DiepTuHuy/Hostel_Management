import { api } from './api.js';

export const reportService = {
  async getDashboard(propertyId) {
    const res = await api.get('/reports/dashboard', { params: { propertyId } });
    return res.data;
  },
  async getRevenue(propertyId, year) {
    const res = await api.get('/reports/revenue', { params: { propertyId, year } });
    return res.data;
  },
  async getOccupancy() {
    const res = await api.get('/reports/occupancy');
    return res.data;
  },
  async getDebts(propertyId) {
    const res = await api.get('/reports/debts', { params: { propertyId } });
    return res.data;
  }
};
