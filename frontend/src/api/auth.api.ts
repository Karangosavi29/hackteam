import api from './axios';
import { User } from '@/types';

export const authApi = {
  register: (data: { name: string; email: string; password: string; college?: string; role?: string }) =>
    api.post<{ accessToken: string; refreshToken: string; user: User }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ accessToken: string; refreshToken: string; user: User }>('/auth/login', data),

  getMe: () => api.get<{ user: User }>('/auth/me'),

  refresh: (refreshToken: string) =>
    api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken }),

  logout: () => api.post('/auth/logout'),
};