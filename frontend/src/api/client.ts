/** Axios instance: baseURL from VITE_API_URL (empty = same origin for Docker). */
import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_URL === ''
    ? ''
    : (typeof import.meta.env.VITE_API_URL === 'string' && import.meta.env.VITE_API_URL) || 'http://localhost:3000';

export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error ||
      err.message ||
      'Ошибка соединения с сервером';
    return Promise.reject(new Error(message));
  }
);

export default api;
