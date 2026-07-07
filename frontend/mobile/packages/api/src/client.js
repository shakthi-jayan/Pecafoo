import axios from 'axios';
import { getTokens, setTokens, clearTokens, clearUser } from '@pecafoo/storage';

/**
 * Axios client configured for the Pecafoo Django REST API.
 *
 * Reads EXPO_PUBLIC_API_URL from environment — never hardcoded.
 * Request interceptor attaches JWT Bearer token from AsyncStorage.
 * Response interceptor handles 401 → refresh → retry or logout.
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE_URL) {
  console.warn(
    '[@pecafoo/api] EXPO_PUBLIC_API_URL is not set. ' +
    'Add it to your .env file: EXPO_PUBLIC_API_URL=http://192.168.x.x:8000/api'
  );
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Listeners for forced logout (consumed by AuthContext) ──
const logoutListeners = new Set();

export const onForceLogout = (listener) => {
  logoutListeners.add(listener);
  return () => logoutListeners.delete(listener);
};

const emitForceLogout = () => {
  logoutListeners.forEach((fn) => fn());
};

// ── Request interceptor — attach JWT ──
apiClient.interceptors.request.use(
  async (config) => {
    const tokens = await getTokens();
    if (tokens?.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor — handle 401 refresh flow ──
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until the refresh completes
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const tokens = await getTokens();
      if (!tokens?.refresh) {
        throw new Error('No refresh token');
      }

      const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
        refresh: tokens.refresh,
      });

      const newTokens = { ...tokens, access: data.access };
      await setTokens(newTokens);

      processQueue(null, data.access);

      originalRequest.headers.Authorization = `Bearer ${data.access}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await clearTokens();
      await clearUser();
      emitForceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
