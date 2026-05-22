import { invoiceService } from '../services/index.js';
import { useFetch } from './useFetch.js';

export function useInvoices(filters = {}) {
  return useFetch(() => invoiceService.list(filters), [JSON.stringify(filters)]);
}
