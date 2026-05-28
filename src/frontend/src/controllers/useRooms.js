import { roomService } from '../services/index.js';
import { useFetch } from './useFetch.js';

export function useRooms(filters = {}) {
  return useFetch(() => roomService.list(filters), [JSON.stringify(filters)]);
}
