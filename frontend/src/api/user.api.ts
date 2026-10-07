import api from './axios';
import { User, Team } from '@/types';

export const userApi = {
  getProfile: (id: string) => api.get<{ user: User }>(`/users/${id}`),

  updateProfile: (data: Partial<User>) => api.put<{ user: User }>('/users/profile', data),

  searchUsers: (params: { skills?: string; role?: string; q?: string }) =>
    api.get<{ users: User[]; count: number }>('/users', { params }),

  getUserTeams: (id: string) =>
    api.get<{ teams: (Pick<Team, '_id' | 'name' | 'isOpen' | 'maxSize' | 'members'> & { leader: string; hackathon: Pick<Team['hackathon'], '_id' | 'title'> })[] }>(`/users/${id}/teams`),
};