import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Set your environment variable EXPO_PUBLIC_API_URL in the .env file
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.5.54:8082/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  async (config) => {
    console.log('[API Request]', config.method?.toUpperCase(), config.url);
    try {
      // Set a short timeout for SecureStore just in case
      const tokenPromise = SecureStore.getItemAsync('userToken');
      const token = await Promise.race([
        tokenPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('SecureStore Timeout')), 2000))
      ]);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('[API Interceptor] SecureStore error:', e.message);
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('[API Response]', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error.config?.url, error.message);
    return Promise.reject(error);
  }
);

// ── Students ──────────────────────────────────────────────
export const getStudents = (search = '') =>
  api.get('/students', { params: search ? { search } : {} });

// ── Izin ─────────────────────────────────────────────────
export const getIzins = () => api.get('/izins');
export const createIzin = (data) => api.post('/izins', data);

// ── Late ─────────────────────────────────────────────────
export const getLateRecords = () => api.get('/late-records');
export const createLateRecord = (data) => api.post('/late-records', data);

// ── Pelanggaran ───────────────────────────────────────────
export const getPelanggarans = () => api.get('/pelanggarans');
export const createPelanggaran = (data) => api.post('/pelanggarans', data);

// ── Schedule ──────────────────────────────────────────────
export const getSchedules = (params = {}) => api.get('/schedules', { params });
export const getScheduleClasses = () => api.get('/schedules/classes');
export const getScheduleDirect = (kelas) => {
  const url = `${process.env.EXPO_PUBLIC_SCHEDULE_API_URL}/${kelas}`;
  return axios.get(url, { timeout: 10000 });
};

export const getPengumuman = () => api.get('/pengumuman');

// ── Auth & Health ──────────────────────────────────────────
export const checkServerHealth = async () => {
  // Pinging the root /health endpoint instead of the /api/v1 subgroup
  const rootUrl = BASE_URL.replace('/api/v1', '/health');
  return axios.get(rootUrl, { timeout: 3000 });
};

export const changePassword = (data) => api.post('/auth/change-password', data);

export default api;
