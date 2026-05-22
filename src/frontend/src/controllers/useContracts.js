import { contractService } from '../services/index.js';
import { useFetch } from './useFetch.js';

export function useContracts(filters = {}) {
  return useFetch(() => contractService.list(filters), [JSON.stringify(filters)]);
}
