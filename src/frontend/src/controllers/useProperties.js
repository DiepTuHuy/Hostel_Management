import { propertyService } from '../services/index.js';
import { useFetch } from './useFetch.js';

export function useProperties() {
  return useFetch(() => propertyService.list(), []);
}
