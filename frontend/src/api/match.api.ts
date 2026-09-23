import api from './axios';
import { TeammateSuggestion, TeamSuggestion, CompatibilityResult, TeamSkillCoverage } from '@/types';

export const matchApi = {
  getTeammates: (params?: { hackathonId?: string; limit?: number }) =>
    api.get<{ suggestions: TeammateSuggestion[]; count: number }>('/match/teammates', { params }),

  getTeams: (params: { hackathonId: string; limit?: number }) =>
    api.get<{ suggestions: TeamSuggestion[]; count: number }>('/match/teams', { params }),

  getCompatibility: (otherUserId: string) =>
    api.get<CompatibilityResult>(`/match/compatibility/${otherUserId}`),

  getTeamSkillCoverage: (teamId: string) =>
    api.get<TeamSkillCoverage>(`/match/team/${teamId}/coverage`),
};