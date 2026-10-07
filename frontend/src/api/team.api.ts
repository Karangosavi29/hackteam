import api from './axios';
import { Team, TeamAnalytics } from '@/types';

export const teamApi = {
  getAll: (params?: { hackathon?: string; isOpen?: boolean; page?: number; limit?: number }) =>
    api.get<{ teams: Team[]; total: number; page: number; pages: number }>('/teams', { params }),

  getById: (id: string) => api.get<{ team: Team }>(`/teams/${id}`),

  create: (data: Omit<Partial<Team>, 'hackathon'> & { hackathon: string }) =>
    api.post<{ team: Team }>('/teams', data),

  update: (id: string, data: Partial<Omit<Team, 'hackathon'>>) =>
    api.put<{ team: Team }>(`/teams/${id}`, data),

  disband: (id: string) => api.delete(`/teams/${id}`),

  leave: (id: string) => api.post(`/teams/${id}/leave`),

  removeMember: (teamId: string, userId: string) =>
    api.delete(`/teams/${teamId}/members/${userId}`),

  transferLeadership: (teamId: string, newLeaderId: string) =>
    api.post<{ team: Team }>(`/teams/${teamId}/transfer-leadership`, { newLeaderId }),

  getAnalytics: (teamId: string) =>
    api.get<TeamAnalytics>(`/teams/${teamId}/analytics`),
};