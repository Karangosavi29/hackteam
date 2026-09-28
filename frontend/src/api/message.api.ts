import api from './axios';
import { Message } from '@/types';

export const messageApi = {
  getForTeam: (teamId: string, params?: { page?: number; limit?: number }) =>
    api.get<{ messages: Message[]; total: number; page: number; pages: number }>(
      `/teams/${teamId}/messages`,
      { params }
    ),
};