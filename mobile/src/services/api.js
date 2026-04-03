import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// NOTE: Replace with your actual local machine IP address
const BASE_URL = 'http://192.168.18.22:8082/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('userToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

export default api;
