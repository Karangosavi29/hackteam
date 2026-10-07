import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const { refreshToken, setTokens, logout } = useAuthStore.getState();

      try {
        const { data } = await axios.post(
          `${API_URL}/api/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );

        setTokens(data.accessToken, data.refreshToken);

        original.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(original);
      } catch {
        logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
