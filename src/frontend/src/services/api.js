/**
 * API client trung tâm — sử dụng axios.
 * Hiện tại chưa kết nối backend thật, các service sẽ trả về mock data.
 * Khi backend MVC sẵn sàng chỉ cần thay BASE_URL và uncomment các axios call.
 */
import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Token interceptor — JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bhpro_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('bhpro_token');
      // window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Tiện ích delay giả lập network khi dùng mock
export const fakeDelay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
