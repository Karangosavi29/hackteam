import api from './axios';
import { Task } from '@/types';

export const taskApi = {
  getForTeam: (teamId: string) =>
    api.get<{ tasks: Task[]; count: number }>(`/teams/${teamId}/tasks`),

  create: (teamId: string, data: { title: string; description?: string; assignedTo?: string; priority?: Task['priority']; dueDate?: string }) =>
    api.post<{ task: Task }>(`/teams/${teamId}/tasks`, data),

  update: (taskId: string, data: Partial<Pick<Task, 'title' | 'description' | 'assignedTo' | 'status' | 'priority' | 'dueDate'>>) =>
    api.patch<{ task: Task }>(`/tasks/${taskId}`, data),

  remove: (taskId: string) => api.delete(`/tasks/${taskId}`),
};