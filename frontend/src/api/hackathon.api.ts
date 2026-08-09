import api from './axios';
import { Hackathon } from '@/types';

export const hackathonApi = {
  getAll: (params?: {
    mode?: string;
    tags?: string;
    startAfter?: string;
    startBefore?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) => api.get<{ hackathons: Hackathon[]; total: number; page: number; pages: number }>('/hackathons', { params }),

  getById: (id: string) => api.get<{ hackathon: Hackathon }>(`/hackathons/${id}`),

  create: (data: Partial<Hackathon>) => api.post<{ hackathon: Hackathon }>('/hackathons', data),

  update: (id: string, data: Partial<Hackathon>) =>
    api.put<{ hackathon: Hackathon }>(`/hackathons/${id}`, data),

  delete: (id: string) => api.delete(`/hackathons/${id}`),
};