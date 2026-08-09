import api from './axios';
import { Request } from '@/types';

export const requestApi = {
  send: (data: { type: 'join' | 'invite'; teamId: string; toUserId?: string; message?: string }) =>
    api.post<{ request: Request }>('/requests', data),

  getIncoming: () => api.get<{ requests: Request[]; count: number }>('/requests/incoming'),

  getOutgoing: () => api.get<{ requests: Request[]; count: number }>('/requests/outgoing'),

  accept: (id: string) => api.put<{ request: Request }>(`/requests/${id}/accept`),

  reject: (id: string) => api.put<{ request: Request }>(`/requests/${id}/reject`),

  withdraw: (id: string) => api.delete(`/requests/${id}`),
};