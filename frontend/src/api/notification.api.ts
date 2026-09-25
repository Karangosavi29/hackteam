import api from './axios';
import { Notification } from '@/types';

export const notificationApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get<{ notifications: Notification[]; total: number; unreadCount: number; page: number; pages: number }>(
      '/notifications',
      { params }
    ),

  markRead: (id: string) => api.patch<{ notification: Notification }>(`/notifications/${id}/read`),

  markAllRead: () => api.patch('/notifications/read-all'),

  remove: (id: string) => api.delete(`/notifications/${id}`),
};