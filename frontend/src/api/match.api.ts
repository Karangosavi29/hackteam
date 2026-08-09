import api from './axios';
import { TeammateSuggestion, TeamSuggestion } from '@/types';

export const matchApi = {
  getTeammates: (params?: { hackathonId?: string; limit?: number }) =>
    api.get<{ suggestions: TeammateSuggestion[]; count: number }>('/match/teammates', { params }),

  getTeams: (params: { hackathonId: string; limit?: number }) =>
    api.get<{ suggestions: TeamSuggestion[]; count: number }>('/match/teams', { params }),
};