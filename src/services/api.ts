//src/services/api.ts
import axios from 'axios';
import { DeviceEventEmitter } from 'react-native';
import { getToken, getRefreshToken, saveTokens, clearTokens } from './authStorage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  console.warn("Attention: EXPO_PUBLIC_API_URL n'est pas défini dans le fichier .env");
} else {
  console.log(`[API] Connecté à : ${API_URL}`);
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRequest =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh-token') ||
      originalRequest?.url?.includes('/auth/logout');

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRequest) {
      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        await saveTokens(accessToken, newRefreshToken);
        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);

        // PROTECTION ANTI-LOGOUT SAUVAGE (Modèle Yély) :
        // On ne déconnecte QUE si le serveur renvoie une invalidation explicite (401/403).
        // Si c'est une erreur réseau (timeout, 502/503), la session reste 100% conservée.
        if (
          refreshError.response &&
          (refreshError.response.status === 401 || refreshError.response.status === 403)
        ) {
          await clearTokens();
          DeviceEventEmitter.emit('AUTH_FAILED');
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;